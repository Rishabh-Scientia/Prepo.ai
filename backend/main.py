"""
Prepo.ai — FastAPI backend application.

Routes:
  GET  /api/health          → health check
  POST /api/generate-quiz   → generate quiz via LangGraph pipeline
  POST /api/evaluate-quiz   → evaluate submitted answers via LangGraph pipeline
"""

from __future__ import annotations

import os
import sys
import uuid
import time
import hmac
import hashlib
import base64
import json
import urllib.request

from dotenv import load_dotenv
load_dotenv()

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    GenerateQuizRequest,
    EvaluateQuizRequest,
    GenerateQuizResponse,
    EvaluateQuizResponse,
    QuestionPublic,
    QuestionResult,
    ExplanationBlock,
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from store.session_store import session_store
from store.db_store import (
    save_quiz_attempt,
    get_user_attempts,
    get_attempt_by_id,
    create_shared_quiz,
    get_shared_quiz,
    submit_student_response,
    get_teacher_shared_quizzes,
    get_quiz_student_responses,
    get_user_credits,
    deduct_user_credit,
    add_user_credits,
    record_payment,
    delete_user_attempt,
    delete_shared_quiz,
    update_shared_quiz_settings,
)
from auth.verify import get_current_user
from graph.generate_graph import build_generate_graph
from graph.evaluate_graph import build_evaluate_graph
from graph.generate_doc_graph import build_generate_doc_graph
from utils.doc_parser import extract_text_from_file, validate_document_text


# ── Load environment ─────────────────────────────────────────────────────────

# Look for .env in the project root (parent of backend/)
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not found in .env file.")
    print("Create a .env file in the project root with: GROQ_API_KEY=your_key_here")
    sys.exit(1)

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Prepo.ai",
    description="AI-generated practice quizzes for any class, subject, and chapter",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile graphs once at startup
generate_graph = build_generate_graph()
evaluate_graph = build_evaluate_graph()
generate_doc_graph = build_generate_doc_graph()


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "prepo-ai"}


@app.get("/api/user/credits")
async def fetch_user_credits(user: dict = Depends(get_current_user)):
    """
    Get remaining free credits for current user.
    """
    user_id = user.get("user_id")
    credits = get_user_credits(user_id)
    return {"credits": credits}


@app.post("/api/generate-quiz", response_model=GenerateQuizResponse)
async def generate_quiz(request: GenerateQuizRequest, user: dict = Depends(get_current_user)):
    """
    Generate a quiz using the LangGraph generation pipeline.
    Returns questions WITHOUT correct answers.
    Stores the full quiz (with answers) server-side keyed by session_id.
    """
    user_id = user.get("user_id")

    # 1. Credit Check
    credits = get_user_credits(user_id)
    if credits <= 0:
        raise HTTPException(
            status_code=403,
            detail="CREDIT_LIMIT_REACHED: You have reached your credit limit. Please top up credits to generate quizzes.",
        )

    # Run the generation graph
    result = generate_graph.invoke({
        "class_level": request.class_level,
        "subject": request.subject,
        "chapter": request.chapter,
        "num_questions": request.num_questions,
        "language": request.language.value,
        "difficulty": request.difficulty.value,
        "raw_llm_output": "",
        "retry_count": 0,
        "quiz": None,
        "error": None,
    })

    # Check for errors
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    if not result.get("quiz"):
        raise HTTPException(
            status_code=500,
            detail="Quiz generation failed. Please try again.",
        )

    quiz_data = result["quiz"]

    # 2. Deduct 1 credit upon successful quiz generation
    deduct_user_credit(user_id)

    # Generate session ID and store quiz server-side with config metadata
    session_id = str(uuid.uuid4())
    session_store.save(session_id, {
        "quiz": quiz_data,
        "subject": request.subject,
        "chapter": request.chapter,
        "class_level": request.class_level,
        "difficulty": request.difficulty.value,
        "language": request.language.value,
    })

    # Build public response (strip correct_answer from each question)
    public_questions = [
        QuestionPublic(
            id=q["id"],
            type=q["type"],
            question=q["question"],
            options=q["options"],
            difficulty=q["difficulty"],
        )
        for q in quiz_data["questions"]
    ]

    return GenerateQuizResponse(
        session_id=session_id,
        questions=public_questions,
    )


@app.post("/api/generate-quiz-from-doc", response_model=GenerateQuizResponse)
async def generate_quiz_from_doc(
    file: UploadFile = File(...),
    num_questions: int = Form(10),
    language: str = Form("English"),
    difficulty: str = Form("Medium"),
    subject: str = Form(""),
    user: dict = Depends(get_current_user),
):
    """
    Generate a quiz from an uploaded PDF, DOCX, or TXT document.
    Includes 2-Layer Guardrails and preserves user credits if rejected.
    """
    user_id = user.get("user_id")

    # 1. Credit Check
    credits = get_user_credits(user_id)
    if credits <= 0:
        raise HTTPException(
            status_code=403,
            detail="CREDIT_LIMIT_REACHED: You have reached your credit limit. Please top up credits to generate quizzes.",
        )

    # 2. Read File Bytes & Validate Size (Max 20MB)
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty. Please upload a valid document.")

    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 20MB limit. Please upload a smaller document.")

    filename = file.filename or "uploaded_document"

    # 3. Layer-1 Guardrail: Text Extraction & Heuristic Quality Check
    try:
        extracted_text = extract_text_from_file(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from '{filename}': {str(e)}")

    is_valid_text, error_msg = validate_document_text(extracted_text)
    if not is_valid_text:
        # Reject immediately with friendly message — zero credits deducted!
        raise HTTPException(status_code=400, detail=error_msg)

    # 4. Layer-2 Guardrail & Quiz Generation via LangGraph
    doc_subject = (subject or "").strip() or os.path.splitext(filename)[0]

    result = generate_doc_graph.invoke({
        "document_text": extracted_text,
        "num_questions": int(num_questions),
        "language": language,
        "difficulty": difficulty,
        "subject": doc_subject,
        "raw_llm_output": "",
        "retry_count": 0,
        "quiz": None,
        "error": None,
        "guardrail_rejected": False,
        "guardrail_message": None,
    })

    # If Layer-2 Guardrail rejected as non-educational:
    if result.get("guardrail_rejected") or (result.get("error") and "educational" in str(result.get("error", "")).lower()):
        msg = result.get("guardrail_message") or result.get("error") or "The uploaded document does not contain adequate educational material to generate a quality quiz. Please upload a clear study document or notes."
        raise HTTPException(status_code=400, detail=msg)

    if result.get("error") or not result.get("quiz"):
        raise HTTPException(
            status_code=400,
            detail=result.get("error") or "Quiz generation failed. Please ensure the document text is clear and try again.",
        )

    quiz_data = result["quiz"]

    # 5. Deduct 1 credit ONLY upon successful quiz creation
    deduct_user_credit(user_id)

    # 6. Store full session server-side with document context
    session_id = str(uuid.uuid4())
    session_store.save(session_id, {
        "quiz": quiz_data,
        "document_text": extracted_text,
        "subject": doc_subject,
        "chapter": "Document Quiz",
        "class_level": "Document",
        "difficulty": difficulty,
        "language": language,
        "filename": filename,
    })

    # 7. Build public response without answers
    public_questions = [
        QuestionPublic(
            id=q["id"],
            type=q["type"],
            question=q["question"],
            options=q["options"],
            difficulty=q["difficulty"],
        )
        for q in quiz_data["questions"]
    ]

    return GenerateQuizResponse(
        session_id=session_id,
        questions=public_questions,
    )



@app.post("/api/evaluate-quiz", response_model=EvaluateQuizResponse)
async def evaluate_quiz(request: EvaluateQuizRequest, user: dict = Depends(get_current_user)):
    """
    Evaluate the student's submitted answers.
    Uses deterministic scoring + LLM-generated explanations.
    """

    # Retrieve stored quiz
    session_data = session_store.get(request.session_id)
    if session_data is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found. The quiz may have expired. Please generate a new quiz.",
        )

    quiz_data = session_data["quiz"]
    language = session_data.get("language", "English")

    # Run the evaluation graph
    result = evaluate_graph.invoke({
        "quiz": quiz_data,
        "answers": [a.model_dump() for a in request.answers],
        "language": language,
        "scored_results": [],
        "score": 0,
        "total": 0,
        "results": None,
        "error": None,
    })

    # Check for errors
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])

    if not result.get("results"):
        raise HTTPException(
            status_code=500,
            detail="Evaluation failed. Please try again.",
        )

    # Build response
    question_results = []
    for r in result["results"]:
        explanation = r.get("explanation", {})
        if not isinstance(explanation, dict):
            explanation = {"reasoning": str(explanation) if explanation else ""}

        question_results.append(
            QuestionResult(
                question_id=str(r.get("question_id", "")),
                question_text=str(r.get("question_text", "")),
                options=r.get("options", []),
                selected_option=str(r.get("selected_option", "") or ""),
                is_correct=bool(r.get("is_correct", False)),
                correct_answer=str(r.get("correct_answer", "")),
                explanation=ExplanationBlock(
                    confirmation=str(explanation.get("confirmation", "") or ""),
                    core_concept=str(explanation.get("core_concept", "") or ""),
                    reasoning=str(explanation.get("reasoning", "") or ""),
                    why_incorrect_option_wrong=str(explanation.get("why_incorrect_option_wrong", "") or ""),
                ),
            )
        )

    # Save completed quiz attempt to Supabase DB
    user_id = user.get("user_id")
    if user_id and quiz_data:
        subject = session_data.get("subject", "General")
        chapter = session_data.get("chapter", "General")
        class_level = session_data.get("class_level", "General")
        difficulty = session_data.get("difficulty", "Medium")

        save_quiz_attempt(
            user_id=user_id,
            subject=subject,
            chapter=chapter,
            class_level=class_level,
            difficulty=difficulty,
            language=language,
            score=result["score"],
            total=result["total"],
            questions=quiz_data.get("questions", []),
            user_answers=[a.model_dump() for a in request.answers],
            evaluation_results=[q.model_dump() for q in question_results],
        )

    return EvaluateQuizResponse(
        score=result["score"],
        total=result["total"],
        results=question_results,
    )


# ── User Profile & History Routes ────────────────────────────────────────────

@app.get("/api/user/attempts")
async def fetch_user_attempts(user: dict = Depends(get_current_user)):
    """
    Get all past quiz attempts for the authenticated user.
    """
    user_id = user.get("user_id")
    attempts = get_user_attempts(user_id)
    return {"attempts": attempts}


@app.get("/api/user/attempts/{attempt_id}")
async def fetch_attempt_detail(attempt_id: str, user: dict = Depends(get_current_user)):
    """
    Get detailed breakdown of a specific past quiz attempt.
    """
    user_id = user.get("user_id")
    attempt = get_attempt_by_id(attempt_id, user_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found.")
    return attempt


@app.delete("/api/user/attempts/{attempt_id}")
async def remove_user_attempt(attempt_id: str, user: dict = Depends(get_current_user)):
    """
    Delete a past quiz attempt for the authenticated user.
    """
    user_id = user.get("user_id")
    success = delete_user_attempt(attempt_id, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete quiz attempt.")
    return {"success": True, "message": "Quiz attempt deleted successfully."}



# ── Shareable Quiz / Teacher Mode Routes ──────────────────────────────────────

@app.post("/api/quiz/share")
async def share_quiz(payload: dict, user: dict = Depends(get_current_user)):
    """
    Teacher shares a generated quiz session with students.
    """
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    session_data = session_store.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Quiz session expired or not found.")

    quiz_data = session_data.get("quiz", {})
    questions = quiz_data.get("questions", [])
    if not questions:
        raise HTTPException(status_code=400, detail="No questions found in this quiz.")

    user_id = user.get("user_id")

    # Credit Check for sharing
    credits = get_user_credits(user_id)
    if credits <= 0:
        raise HTTPException(
            status_code=403,
            detail="CREDIT_LIMIT_REACHED: You have reached your credit limit. Contact yoursbench@gmail.com for getting more credit.",
        )

    email = user.get("email", "Teacher")
    teacher_name = email.split("@")[0] if "@" in email else "Teacher"

    time_limit_minutes = payload.get("time_limit_minutes")
    show_results = payload.get("show_results", True)
    is_active = payload.get("is_active", True)

    shared = create_shared_quiz(
        created_by=user_id,
        teacher_name=teacher_name,
        subject=session_data.get("subject", "General"),
        chapter=session_data.get("chapter", "General"),
        class_level=session_data.get("class_level", "General"),
        difficulty=session_data.get("difficulty", "Medium"),
        language=session_data.get("language", "English"),
        questions=questions,
        is_active=is_active,
        time_limit_minutes=time_limit_minutes,
        show_results=show_results,
    )

    if not shared:
        raise HTTPException(status_code=500, detail="Failed to create shared quiz.")

    return {
        "shared_quiz_id": shared.get("id"),
        "subject": shared.get("subject"),
        "chapter": shared.get("chapter"),
        "is_active": shared.get("is_active", True),
        "time_limit_minutes": shared.get("time_limit_minutes"),
        "show_results": shared.get("show_results", True),
    }


@app.get("/api/quiz/shared/{quiz_id}")
async def get_shared_quiz_questions(quiz_id: str):
    """
    Public endpoint: Student loads shared quiz by ID (strips correct answers).
    """
    shared = get_shared_quiz(quiz_id)
    if not shared:
        raise HTTPException(status_code=404, detail="Shared quiz not found or expired.")

    # Strip correct_answer from each question before sending to student
    public_questions = [
        {
            "id": q["id"],
            "type": q.get("type", "mcq"),
            "question": q["question"],
            "options": q["options"],
            "difficulty": q.get("difficulty", "medium"),
        }
        for q in shared.get("questions", [])
    ]

    return {
        "quiz_id": shared["id"],
        "teacher_name": shared.get("teacher_name", "Teacher"),
        "subject": shared["subject"],
        "chapter": shared["chapter"],
        "class_level": shared["class_level"],
        "difficulty": shared["difficulty"],
        "language": shared.get("language", "English"),
        "is_active": shared.get("is_active", True),
        "time_limit_minutes": shared.get("time_limit_minutes"),
        "show_results": shared.get("show_results", True),
        "questions": public_questions,
    }


@app.post("/api/quiz/shared/{quiz_id}/submit")
async def submit_shared_quiz_student(quiz_id: str, payload: dict):
    """
    Public endpoint: Student submits answers with their Name.
    """
    student_name = payload.get("student_name", "").strip()
    answers = payload.get("answers", [])

    if not student_name:
        raise HTTPException(status_code=400, detail="Student name is required.")

    result = submit_student_response(
        quiz_id=quiz_id,
        student_name=student_name,
        student_answers=answers,
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to record submission.")

    if result.get("error") == "TEST_INACTIVE":
        raise HTTPException(
            status_code=403,
            detail="This assessment is no longer accepting responses. Submissions have been closed by the instructor.",
        )

    return result


@app.get("/api/teacher/shared-quizzes")
async def get_teacher_quizzes(user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Get all shared quizzes created by this teacher.
    """
    user_id = user.get("user_id")
    quizzes = get_teacher_shared_quizzes(user_id)
    return {"shared_quizzes": quizzes}


@app.patch("/api/teacher/shared-quizzes/{quiz_id}/settings")
async def update_quiz_settings(quiz_id: str, payload: dict, user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Update assessment controls (is_active, time_limit_minutes, show_results).
    """
    user_id = user.get("user_id")
    success = update_shared_quiz_settings(quiz_id, user_id, payload)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update quiz settings.")
    return {"success": True, "message": "Quiz settings updated successfully."}


@app.get("/api/teacher/shared-quizzes/{quiz_id}/responses")
async def get_shared_quiz_leaderboard(quiz_id: str, user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Get student submission leaderboard for a specific shared quiz.
    """
    user_id = user.get("user_id")
    responses = get_quiz_student_responses(quiz_id, user_id)
    return {"responses": responses}


@app.delete("/api/teacher/shared-quizzes/{quiz_id}")
async def remove_shared_quiz(quiz_id: str, user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Delete a shared quiz and all its student responses.
    """
    user_id = user.get("user_id")
    success = delete_shared_quiz(quiz_id, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shared quiz.")
    return {"success": True, "message": "Shared quiz and responses deleted successfully."}



# ── Razorpay Payment Gateway & Credits Top-up ────────────────────────────────

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

CREDIT_PLANS = {
    "plan_30": {
        "plan_id": "plan_30",
        "name": "Starter Pack",
        "amount": 900,  # 900 paise = ₹9.00
        "currency": "INR",
        "credits": 30,
        "price_display": "₹9",
        "per_quiz": "₹0.30",
        "description": "30 AI Quiz Generations with step-by-step solutions",
        "badge": "Starter",
        "popular": False,
    },
    "plan_100": {
        "plan_id": "plan_100",
        "name": "Pro Pack",
        "amount": 2900,  # 2900 paise = ₹29.00
        "currency": "INR",
        "credits": 100,
        "price_display": "₹29",
        "per_quiz": "₹0.29",
        "description": "100 AI Quiz Generations + Teacher sharing enabled",
        "badge": "Best Value",
        "popular": True,
    },
}


def _create_razorpay_order(amount: int, currency: str, receipt: str, notes: dict) -> dict:
    """
    Create a Razorpay order using either the official SDK or direct REST API.
    """
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay API credentials not configured on server.",
        )

    # Try official razorpay package
    try:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        return client.order.create({
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
            "notes": notes,
        })
    except ImportError:
        pass

    # Fallback to direct HTTP request with Basic Auth
    auth_bytes = f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}".encode("utf-8")
    b64_auth = base64.b64encode(auth_bytes).decode("utf-8")
    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/json",
    }
    payload = {
        "amount": amount,
        "currency": currency,
        "receipt": receipt,
        "notes": notes,
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.razorpay.com/v1/orders",
        data=data_bytes,
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"ERROR creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")


def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature via HMAC-SHA256.
    """
    if not RAZORPAY_KEY_SECRET:
        return False

    message = f"{order_id}|{payment_id}".encode("utf-8")
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated_signature, signature)


@app.get("/api/payments/plans")
async def get_payment_plans():
    """
    Public endpoint to fetch available credit top-up offers and public key ID.
    """
    return {
        "plans": list(CREDIT_PLANS.values()),
        "key_id": RAZORPAY_KEY_ID,
    }


@app.post("/api/payments/create-order", response_model=CreateOrderResponse)
async def create_payment_order(request: CreateOrderRequest, user: dict = Depends(get_current_user)):
    """
    Create a Razorpay order for purchasing credits.
    """
    plan = CREDIT_PLANS.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail=f"Invalid plan_id. Allowed: {list(CREDIT_PLANS.keys())}")

    user_id = user.get("user_id")
    email = user.get("email", "")
    receipt = f"rcpt_{user_id[:8]}_{int(time.time())}"

    order = _create_razorpay_order(
        amount=plan["amount"],
        currency=plan["currency"],
        receipt=receipt,
        notes={
            "user_id": user_id,
            "email": email,
            "plan_id": plan["plan_id"],
            "credits": str(plan["credits"]),
        },
    )

    return CreateOrderResponse(
        order_id=order["id"],
        amount=plan["amount"],
        currency=plan["currency"],
        key_id=RAZORPAY_KEY_ID,
        plan_id=plan["plan_id"],
        credits=plan["credits"],
        plan_name=plan["name"],
    )


@app.post("/api/payments/verify-payment", response_model=VerifyPaymentResponse)
async def verify_payment(request: VerifyPaymentRequest, user: dict = Depends(get_current_user)):
    """
    Verify payment signature, add credits to user account, and log transaction.
    """
    plan = CREDIT_PLANS.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail=f"Invalid plan_id: {request.plan_id}")

    user_id = user.get("user_id")

    # 1. Cryptographic HMAC-SHA256 signature verification
    is_valid = _verify_razorpay_signature(
        order_id=request.razorpay_order_id,
        payment_id=request.razorpay_payment_id,
        signature=request.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed: Invalid payment signature.",
        )

    # 2. Add credits to user in Supabase
    new_credits = add_user_credits(user_id=user_id, credits_to_add=plan["credits"])

    # 3. Log transaction in Supabase payments table
    record_payment(
        user_id=user_id,
        order_id=request.razorpay_order_id,
        payment_id=request.razorpay_payment_id,
        amount=plan["amount"],
        credits_added=plan["credits"],
        plan_id=request.plan_id,
        status="success",
    )

    return VerifyPaymentResponse(
        success=True,
        credits=new_credits,
        message=f"Payment verified! {plan['credits']} credits added successfully to your account.",
    )



