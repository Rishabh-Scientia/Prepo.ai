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

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    GenerateQuizRequest,
    EvaluateQuizRequest,
    GenerateQuizResponse,
    EvaluateQuizResponse,
    QuestionPublic,
    QuestionResult,
    ExplanationBlock,
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
)
from auth.verify import get_current_user
from graph.generate_graph import build_generate_graph
from graph.evaluate_graph import build_evaluate_graph

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


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "prepo-ai"}


@app.post("/api/generate-quiz", response_model=GenerateQuizResponse)
async def generate_quiz(request: GenerateQuizRequest, user: dict = Depends(get_current_user)):
    """
    Generate a quiz using the LangGraph generation pipeline.
    Returns questions WITHOUT correct answers.
    Stores the full quiz (with answers) server-side keyed by session_id.
    """

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
        question_results.append(
            QuestionResult(
                question_id=r["question_id"],
                question_text=r["question_text"],
                options=r["options"],
                selected_option=r["selected_option"],
                is_correct=r["is_correct"],
                correct_answer=r["correct_answer"],
                explanation=ExplanationBlock(
                    confirmation=explanation.get("confirmation", ""),
                    core_concept=explanation.get("core_concept", ""),
                    reasoning=explanation.get("reasoning", ""),
                    why_incorrect_option_wrong=explanation.get("why_incorrect_option_wrong", ""),
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
    email = user.get("email", "Teacher")
    teacher_name = email.split("@")[0] if "@" in email else "Teacher"

    shared = create_shared_quiz(
        created_by=user_id,
        teacher_name=teacher_name,
        subject=session_data.get("subject", "General"),
        chapter=session_data.get("chapter", "General"),
        class_level=session_data.get("class_level", "General"),
        difficulty=session_data.get("difficulty", "Medium"),
        language=session_data.get("language", "English"),
        questions=questions,
    )

    if not shared:
        raise HTTPException(status_code=500, detail="Failed to create shared quiz.")

    return {
        "shared_quiz_id": shared.get("id"),
        "subject": shared.get("subject"),
        "chapter": shared.get("chapter"),
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

    return result


@app.get("/api/teacher/shared-quizzes")
async def get_teacher_quizzes(user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Get all shared quizzes created by this teacher.
    """
    user_id = user.get("user_id")
    quizzes = get_teacher_shared_quizzes(user_id)
    return {"shared_quizzes": quizzes}


@app.get("/api/teacher/shared-quizzes/{quiz_id}/responses")
async def get_shared_quiz_leaderboard(quiz_id: str, user: dict = Depends(get_current_user)):
    """
    Teacher endpoint: Get student submission leaderboard for a specific shared quiz.
    """
    user_id = user.get("user_id")
    responses = get_quiz_student_responses(quiz_id, user_id)
    return {"responses": responses}


