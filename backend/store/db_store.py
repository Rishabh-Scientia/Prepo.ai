"""
Prepo.ai — Supabase DB Store
Handles storing and retrieving quiz attempts via Supabase REST API.
"""

from __future__ import annotations

import json
import os
import urllib.request
import urllib.parse
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://cahlcjvndiytjluzhpop.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Prefer service role key for DB operations, fallback to anon key
_API_KEY = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY


def _get_headers() -> Dict[str, str]:
    return {
        "apikey": _API_KEY,
        "Authorization": f"Bearer {_API_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def save_quiz_attempt(
    user_id: str,
    subject: str,
    chapter: str,
    class_level: str,
    difficulty: str,
    language: str,
    score: int,
    total: int,
    questions: list,
    user_answers: list,
    evaluation_results: list,
) -> Optional[Dict[str, Any]]:
    """
    Save a completed quiz attempt to the `quiz_attempts` table.
    """
    if not _API_KEY:
        print("WARNING: No Supabase API key configured. Skipping DB save.")
        return None

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/quiz_attempts"
    payload = {
        "user_id": user_id,
        "subject": subject,
        "chapter": chapter,
        "class_level": class_level,
        "difficulty": difficulty,
        "language": language,
        "score": score,
        "total": total,
        "questions": questions,
        "user_answers": user_answers,
        "evaluation_results": evaluation_results,
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="POST",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)
            if isinstance(result, list) and len(result) > 0:
                return result[0]
            return result
    except Exception as e:
        print(f"ERROR saving quiz attempt to Supabase: {e}")
        return None


def get_user_attempts(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all quiz attempts for a given user, ordered by creation date descending.
    Returns a lightweight summary (without full question/result JSON payloads for performance).
    """
    if not _API_KEY:
        return []

    # Select metadata fields only for list display
    params = urllib.parse.urlencode({
        "user_id": f"eq.{user_id}",
        "select": "id,subject,chapter,class_level,difficulty,language,score,total,created_at",
        "order": "created_at.desc",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/quiz_attempts?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except Exception as e:
        print(f"ERROR fetching user attempts from Supabase: {e}")
        return []


def get_attempt_by_id(attempt_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve full attempt record (including questions and evaluation results) by attempt_id.
    """
    if not _API_KEY:
        return None

    params = urllib.parse.urlencode({
        "id": f"eq.{attempt_id}",
        "user_id": f"eq.{user_id}",
        "select": "*",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/quiz_attempts?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            results = json.loads(res_body)
            if isinstance(results, list) and len(results) > 0:
                record = results[0]
                for key in ["evaluation_results", "questions", "user_answers"]:
                    if isinstance(record.get(key), str):
                        try:
                            record[key] = json.loads(record[key])
                        except Exception:
                            pass
                return record
            return None
    except Exception as e:
        print(f"ERROR fetching attempt {attempt_id} from Supabase: {e}")
        return None


def delete_user_attempt(attempt_id: str, user_id: str) -> bool:
    """
    Delete a specific quiz attempt belonging to user_id.
    """
    if not _API_KEY or not attempt_id or not user_id:
        return False

    params = urllib.parse.urlencode({
        "id": f"eq.{attempt_id}",
        "user_id": f"eq.{user_id}",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/quiz_attempts?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="DELETE",
        )
        with urllib.request.urlopen(req) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"ERROR deleting quiz attempt {attempt_id} for user {user_id}: {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════════
# SHARED QUIZZES & TEACHER DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════

def create_shared_quiz(
    created_by: str,
    teacher_name: str,
    subject: str,
    chapter: str,
    class_level: str,
    difficulty: str,
    language: str,
    questions: list,
    is_active: bool = True,
    time_limit_minutes: Optional[int] = None,
    show_results: bool = True,
) -> Optional[Dict[str, Any]]:
    """
    Create a shared quiz entry in `shared_quizzes` table.
    Resiliently stores assessment controls (is_active, time_limit_minutes, show_results).
    """
    if not _API_KEY:
        return None

    # Embed settings inside questions[0] for bulletproof fallback
    if isinstance(questions, list) and len(questions) > 0 and isinstance(questions[0], dict):
        questions[0]["_quiz_settings"] = {
            "is_active": is_active,
            "time_limit_minutes": time_limit_minutes,
            "show_results": show_results,
        }

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes"
    
    # Try inserting with column-level attributes first
    payload = {
        "created_by": created_by,
        "teacher_name": teacher_name,
        "subject": subject,
        "chapter": chapter,
        "class_level": class_level,
        "difficulty": difficulty,
        "language": language,
        "questions": questions,
        "is_active": is_active,
        "time_limit_minutes": time_limit_minutes,
        "show_results": show_results,
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="POST",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)
            record = result[0] if isinstance(result, list) and len(result) > 0 else result
            record["is_active"] = is_active
            record["time_limit_minutes"] = time_limit_minutes
            record["show_results"] = show_results
            return record
    except urllib.error.HTTPError as he:
        # If columns don't exist yet in Supabase table, retry with standard schema
        if he.code == 400:
            try:
                base_payload = {
                    "created_by": created_by,
                    "teacher_name": teacher_name,
                    "subject": subject,
                    "chapter": chapter,
                    "class_level": class_level,
                    "difficulty": difficulty,
                    "language": language,
                    "questions": questions,
                }
                base_bytes = json.dumps(base_payload).encode("utf-8")
                base_req = urllib.request.Request(
                    endpoint,
                    data=base_bytes,
                    headers=_get_headers(),
                    method="POST",
                )
                with urllib.request.urlopen(base_req) as response:
                    res_body = response.read().decode("utf-8")
                    result = json.loads(res_body)
                    record = result[0] if isinstance(result, list) and len(result) > 0 else result
                    record["is_active"] = is_active
                    record["time_limit_minutes"] = time_limit_minutes
                    record["show_results"] = show_results
                    return record
            except Exception as e2:
                print(f"ERROR creating shared quiz (fallback): {e2}")
                return None
        print(f"ERROR creating shared quiz: {he}")
        return None
    except Exception as e:
        print(f"ERROR creating shared quiz: {e}")
        return None


def get_shared_quiz(quiz_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve shared quiz by ID for students.
    Includes is_active, time_limit_minutes, and show_results settings.
    """
    if not _API_KEY:
        return None

    params = urllib.parse.urlencode({
        "id": f"eq.{quiz_id}",
        "select": "*",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            results = json.loads(res_body)
            if isinstance(results, list) and len(results) > 0:
                record = results[0]
                if isinstance(record.get("questions"), str):
                    try:
                        record["questions"] = json.loads(record["questions"])
                    except Exception:
                        pass

                # Extract settings fallback from questions[0]
                embedded_settings = {}
                raw_q = record.get("questions", [])
                if isinstance(raw_q, list) and len(raw_q) > 0 and isinstance(raw_q[0], dict):
                    embedded_settings = raw_q[0].get("_quiz_settings", {})

                if record.get("is_active") is None:
                    record["is_active"] = embedded_settings.get("is_active", True)
                if record.get("time_limit_minutes") is None:
                    record["time_limit_minutes"] = embedded_settings.get("time_limit_minutes", None)
                if record.get("show_results") is None:
                    record["show_results"] = embedded_settings.get("show_results", True)

                return record
            return None
    except Exception as e:
        print(f"ERROR fetching shared quiz {quiz_id}: {e}")
        return None


def update_shared_quiz_settings(
    quiz_id: str,
    teacher_id: str,
    updates: Dict[str, Any],
) -> bool:
    """
    Update settings (is_active, time_limit_minutes, show_results) for a shared quiz.
    Supports both direct column update and embedded json fallback.
    """
    if not _API_KEY or not quiz_id or not teacher_id:
        return False

    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz:
        return False

    quiz_owner = str(shared_quiz.get("created_by", "")).strip().lower()
    req_teacher = str(teacher_id or "").strip().lower()
    if quiz_owner and req_teacher and quiz_owner != req_teacher:
        return False

    allowed_keys = {"is_active", "time_limit_minutes", "show_results"}
    clean_updates = {k: v for k, v in updates.items() if k in allowed_keys}
    if not clean_updates:
        return True

    params = urllib.parse.urlencode({
        "id": f"eq.{quiz_id}",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes?{params}"

    # 1. Try direct column update
    try:
        data_bytes = json.dumps(clean_updates).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="PATCH",
        )
        with urllib.request.urlopen(req) as response:
            if response.status in (200, 204):
                return True
    except urllib.error.HTTPError:
        pass
    except Exception as e:
        print(f"Direct patch failed, trying embedded fallback: {e}")

    # 2. Embedded fallback in questions[0]
    try:
        questions = shared_quiz.get("questions", [])
        if isinstance(questions, list) and len(questions) > 0 and isinstance(questions[0], dict):
            current_settings = questions[0].get("_quiz_settings", {})
            current_settings.update(clean_updates)
            questions[0]["_quiz_settings"] = current_settings

            q_bytes = json.dumps({"questions": questions}).encode("utf-8")
            q_req = urllib.request.Request(
                endpoint,
                data=q_bytes,
                headers=_get_headers(),
                method="PATCH",
            )
            with urllib.request.urlopen(q_req) as response:
                return response.status in (200, 204)
    except Exception as e:
        print(f"ERROR updating quiz settings via embedded questions: {e}")
        return False

    return False


def submit_student_response(
    quiz_id: str,
    student_name: str,
    student_answers: list,
) -> Optional[Dict[str, Any]]:
    """
    Evaluate student answers deterministically using pre-stored correct answers,
    and save response into `student_responses` table.
    Enforces is_active check and respects show_results visibility setting.
    """
    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz:
        return None

    # Check if quiz is active and accepting responses
    if not shared_quiz.get("is_active", True):
        return {
            "error": "TEST_INACTIVE",
            "message": "This assessment is no longer accepting responses.",
        }

    questions = shared_quiz.get("questions", [])
    answers_map = {a.get("question_id"): a.get("selected_option", "") for a in student_answers}

    score = 0
    total = len(questions)
    evaluation_results = []

    for q in questions:
        q_id = q.get("id")
        selected_option = answers_map.get(q_id, "")
        correct_answer = q.get("correct_answer", "")
        is_correct = (selected_option.strip() == correct_answer.strip()) and (selected_option != "")

        if is_correct:
            score += 1

        explanation = q.get("explanation", {})
        evaluation_results.append({
            "question_id": q_id,
            "question_text": q.get("question", ""),
            "options": q.get("options", []),
            "selected_option": selected_option,
            "is_correct": is_correct,
            "correct_answer": correct_answer,
            "explanation": {
                "confirmation": explanation.get("confirmation", "Correct!" if is_correct else "Incorrect."),
                "core_concept": explanation.get("core_concept", ""),
                "reasoning": explanation.get("reasoning", ""),
                "why_incorrect_option_wrong": explanation.get("why_incorrect_option_wrong", ""),
            },
        })

    # Insert into student_responses (Teacher always sees full score & evaluation)
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/student_responses"
    payload = {
        "quiz_id": quiz_id,
        "student_name": student_name,
        "score": score,
        "total": total,
        "student_answers": student_answers,
        "evaluation_results": evaluation_results,
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="POST",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)
            inserted = result[0] if isinstance(result, list) and len(result) > 0 else result

            show_results = shared_quiz.get("show_results", True)
            if not show_results:
                return {
                    "submission_id": inserted.get("id"),
                    "score_hidden": True,
                    "score": None,
                    "total": total,
                    "evaluation_results": [],
                    "message": "Your assessment has been submitted successfully. Scores and solutions are hidden by your instructor.",
                }

            return {
                "submission_id": inserted.get("id"),
                "score_hidden": False,
                "score": score,
                "total": total,
                "evaluation_results": evaluation_results,
            }
    except Exception as e:
        print(f"ERROR submitting student response: {e}")
        return None


def get_teacher_shared_quizzes(teacher_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all shared quizzes created by a teacher with student response count
    and assessment settings (is_active, time_limit_minutes, show_results).
    """
    if not _API_KEY:
        return []

    params = urllib.parse.urlencode({
        "created_by": f"eq.{teacher_id}",
        "select": "id,subject,chapter,class_level,difficulty,language,created_at,is_active,time_limit_minutes,show_results,questions,student_responses(id)",
        "order": "created_at.desc",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            quizzes = json.loads(res_body)
    except urllib.error.HTTPError as he:
        if he.code == 400:
            # Fallback if columns not present
            fallback_params = urllib.parse.urlencode({
                "created_by": f"eq.{teacher_id}",
                "select": "id,subject,chapter,class_level,difficulty,language,created_at,questions,student_responses(id)",
                "order": "created_at.desc",
            })
            fallback_endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes?{fallback_params}"
            fallback_req = urllib.request.Request(
                fallback_endpoint,
                headers=_get_headers(),
                method="GET",
            )
            with urllib.request.urlopen(fallback_req) as response:
                res_body = response.read().decode("utf-8")
                quizzes = json.loads(res_body)
        else:
            print(f"ERROR fetching teacher shared quizzes: {he}")
            return []
    except Exception as e:
        print(f"ERROR fetching teacher shared quizzes: {e}")
        return []

    try:
        for q in quizzes:
            responses = q.get("student_responses", [])
            q["submission_count"] = len(responses) if isinstance(responses, list) else 0
            q.pop("student_responses", None)

            # Extract settings
            raw_q = q.get("questions")
            if isinstance(raw_q, str):
                try:
                    raw_q = json.loads(raw_q)
                except Exception:
                    raw_q = []

            embedded_settings = {}
            if isinstance(raw_q, list) and len(raw_q) > 0 and isinstance(raw_q[0], dict):
                embedded_settings = raw_q[0].get("_quiz_settings", {})

            q["is_active"] = q.get("is_active") if q.get("is_active") is not None else embedded_settings.get("is_active", True)
            q["time_limit_minutes"] = q.get("time_limit_minutes") if q.get("time_limit_minutes") is not None else embedded_settings.get("time_limit_minutes", None)
            q["show_results"] = q.get("show_results") if q.get("show_results") is not None else embedded_settings.get("show_results", True)
            q.pop("questions", None)

        return quizzes
    except Exception as e:
        print(f"ERROR processing teacher shared quizzes: {e}")
        return []


def get_quiz_student_responses(quiz_id: str, teacher_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve student submission leaderboard for a specific shared quiz (teacher only).
    """
    if not _API_KEY:
        return []

    # Verify teacher owns this quiz
    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz or str(shared_quiz.get("created_by")) != str(teacher_id):
        return []

    params = urllib.parse.urlencode({
        "quiz_id": f"eq.{quiz_id}",
        "select": "*",
        "order": "score.desc,submitted_at.asc",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/student_responses?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            results = json.loads(res_body)
            if isinstance(results, list):
                for r in results:
                    for key in ["evaluation_results", "student_answers"]:
                        if isinstance(r.get(key), str):
                            try:
                                r[key] = json.loads(r[key])
                            except Exception:
                                pass
            return results
    except Exception as e:
        print(f"ERROR fetching student responses for quiz {quiz_id}: {e}")
        return []


def seed_mock_student_responses(quiz_id: str, teacher_id: str) -> List[Dict[str, Any]]:
    """
    Generate 4 realistic AI mock student responses for a teacher's shared quiz
    and insert them into student_responses in Supabase.
    """
    if not _API_KEY or not quiz_id or not teacher_id:
        return []

    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz:
        return []

    quiz_owner = str(shared_quiz.get("created_by", "")).strip().lower()
    if quiz_owner != str(teacher_id).strip().lower():
        return []

    questions = shared_quiz.get("questions", [])
    if not isinstance(questions, list) or len(questions) == 0:
        return []

    mock_students = [
        {"name": "Aarav Sharma", "target_pct": 0.90},
        {"name": "Priya Patel", "target_pct": 0.80},
        {"name": "Rohan Verma", "target_pct": 0.65},
        {"name": "Sneha Gupta", "target_pct": 0.50},
    ]

    total_q = len(questions)
    inserted_records = []

    for s_idx, student in enumerate(mock_students):
        student_name = student["name"]
        target_correct = max(1, min(total_q, round(total_q * student["target_pct"])))
        
        student_answers = []
        evaluation_results = []
        score = 0

        # Deterministically select which questions this student gets right
        correct_indices = set([
            (q_idx * 3 + s_idx * 2) % total_q for q_idx in range(target_correct)
        ])
        if len(correct_indices) < target_correct:
            for i in range(total_q):
                if len(correct_indices) >= target_correct:
                    break
                correct_indices.add(i)

        for q_idx, q in enumerate(questions):
            q_id = q.get("id") or f"q{q_idx + 1}"
            correct_opt = str(q.get("correct_answer", "")).strip()
            options = q.get("options", [])
            is_correct = (q_idx in correct_indices)

            if is_correct:
                selected_option = correct_opt
                score += 1
            else:
                wrong_opts = [str(opt).strip() for opt in options if str(opt).strip() != correct_opt]
                if wrong_opts:
                    selected_option = wrong_opts[(q_idx + s_idx) % len(wrong_opts)]
                else:
                    selected_option = "Option B" if correct_opt != "Option B" else "Option A"

            student_answers.append({
                "question_id": str(q_id),
                "selected_option": selected_option,
            })

            explanation = q.get("explanation", {})
            evaluation_results.append({
                "question_id": str(q_id),
                "question_text": q.get("question", ""),
                "options": options,
                "selected_option": selected_option,
                "is_correct": is_correct,
                "correct_answer": correct_opt,
                "explanation": {
                    "confirmation": explanation.get("confirmation", "Correct!" if is_correct else "Incorrect."),
                    "core_concept": explanation.get("core_concept", ""),
                    "reasoning": explanation.get("reasoning", ""),
                    "why_incorrect_option_wrong": explanation.get("why_incorrect_option_wrong", ""),
                },
            })

        payload = {
            "quiz_id": quiz_id,
            "student_name": student_name,
            "score": score,
            "total": total_q,
            "student_answers": student_answers,
            "evaluation_results": evaluation_results,
        }

        endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/student_responses"
        try:
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                endpoint,
                data=data_bytes,
                headers=_get_headers(),
                method="POST",
            )
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                if isinstance(res_json, list) and len(res_json) > 0:
                    inserted_records.append(res_json[0])
                else:
                    inserted_records.append(payload)
        except Exception as err:
            print(f"ERROR inserting mock student response for {student_name}: {err}")

    return inserted_records


def delete_shared_quiz(quiz_id: str, teacher_id: str) -> bool:
    """
    Delete a shared quiz and its responses created by teacher_id.
    """
    if not _API_KEY or not quiz_id or not teacher_id:
        return False

    # 1. Delete associated student responses first
    try:
        resp_params = urllib.parse.urlencode({
            "quiz_id": f"eq.{quiz_id}",
        })
        resp_endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/student_responses?{resp_params}"
        resp_req = urllib.request.Request(
            resp_endpoint,
            headers=_get_headers(),
            method="DELETE",
        )
        with urllib.request.urlopen(resp_req):
            pass
    except Exception as e:
        print(f"Note deleting responses for shared quiz {quiz_id}: {e}")

    # 2. Delete the shared quiz
    params = urllib.parse.urlencode({
        "id": f"eq.{quiz_id}",
        "created_by": f"eq.{teacher_id}",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="DELETE",
        )
        with urllib.request.urlopen(req) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"ERROR deleting shared quiz {quiz_id} by teacher {teacher_id}: {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════════
# USER CREDITS MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

def get_user_credits(user_id: str) -> int:
    """
    Get remaining credits for user_id.
    If user has no record in user_credits table, lazy-initialize with 3 free credits.
    """
    if not _API_KEY or not user_id:
        return 3

    params = urllib.parse.urlencode({
        "user_id": f"eq.{user_id}",
        "select": "credits",
    })
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/user_credits?{params}"

    try:
        req = urllib.request.Request(
            endpoint,
            headers=_get_headers(),
            method="GET",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            results = json.loads(res_body)
            if isinstance(results, list) and len(results) > 0:
                return results[0].get("credits", 3)

        # User not found in user_credits -> initialize with 3 credits
        init_endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/user_credits"
        init_payload = {"user_id": user_id, "credits": 3}
        init_bytes = json.dumps(init_payload).encode("utf-8")
        headers = _get_headers()
        headers["Prefer"] = "resolution=merge-duplicates"

        init_req = urllib.request.Request(
            init_endpoint,
            data=init_bytes,
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(init_req) as response:
            return 3
    except Exception as e:
        print(f"ERROR getting/initializing user credits for {user_id}: {e}")
        return 3


def deduct_user_credit(user_id: str) -> int:
    """
    Deduct 1 credit for user_id and return new credit count.
    """
    if not _API_KEY or not user_id:
        return 3

    current = get_user_credits(user_id)
    new_credits = max(0, current - 1)

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/user_credits?user_id=eq.{user_id}"
    payload = {"credits": new_credits}
    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="PATCH",
        )
        with urllib.request.urlopen(req) as response:
            return new_credits
    except Exception as e:
        print(f"ERROR deducting credit for {user_id}: {e}")
        return new_credits


def add_user_credits(user_id: str, credits_to_add: int) -> int:
    """
    Add credits to user_id in Supabase and return new total credits.
    """
    if not _API_KEY or not user_id:
        return 3 + credits_to_add

    current = get_user_credits(user_id)
    new_credits = current + credits_to_add

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/user_credits?user_id=eq.{user_id}"
    payload = {"credits": new_credits}
    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="PATCH",
        )
        with urllib.request.urlopen(req) as response:
            return new_credits
    except Exception as e:
        print(f"ERROR adding credits for {user_id}: {e}")
        return new_credits


def record_payment(
    user_id: str,
    order_id: str,
    payment_id: str,
    amount: int,
    credits_added: int,
    plan_id: str,
    status: str = "success",
) -> Optional[Dict[str, Any]]:
    """
    Record payment transaction in Supabase payments table.
    """
    if not _API_KEY:
        return None

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/payments"
    payload = {
        "user_id": user_id,
        "order_id": order_id,
        "payment_id": payment_id,
        "amount": amount,
        "credits_added": credits_added,
        "plan_id": plan_id,
        "status": status,
    }
    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers=_get_headers(),
            method="POST",
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)
            if isinstance(result, list) and len(result) > 0:
                return result[0]
            return result
    except Exception as e:
        print(f"ERROR recording payment transaction for {user_id}: {e}")
        return None



