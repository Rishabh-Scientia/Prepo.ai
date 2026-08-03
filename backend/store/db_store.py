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
                return results[0]
            return None
    except Exception as e:
        print(f"ERROR fetching attempt {attempt_id} from Supabase: {e}")
        return None


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
) -> Optional[Dict[str, Any]]:
    """
    Create a shared quiz entry in `shared_quizzes` table.
    """
    if not _API_KEY:
        return None

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/shared_quizzes"
    payload = {
        "created_by": created_by,
        "teacher_name": teacher_name,
        "subject": subject,
        "chapter": chapter,
        "class_level": class_level,
        "difficulty": difficulty,
        "language": language,
        "questions": questions,
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
        print(f"ERROR creating shared quiz: {e}")
        return None


def get_shared_quiz(quiz_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve shared quiz by ID for students.
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
                return results[0]
            return None
    except Exception as e:
        print(f"ERROR fetching shared quiz {quiz_id}: {e}")
        return None


def submit_student_response(
    quiz_id: str,
    student_name: str,
    student_answers: list,
) -> Optional[Dict[str, Any]]:
    """
    Evaluate student answers deterministically using pre-stored correct answers,
    and save response into `student_responses` table.
    """
    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz:
        return None

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

    # Insert into student_responses
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
            return {
                "submission_id": inserted.get("id"),
                "score": score,
                "total": total,
                "evaluation_results": evaluation_results,
            }
    except Exception as e:
        print(f"ERROR submitting student response: {e}")
        return None


def get_teacher_shared_quizzes(teacher_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve all shared quizzes created by a teacher with student response count.
    """
    if not _API_KEY:
        return []

    params = urllib.parse.urlencode({
        "created_by": f"eq.{teacher_id}",
        "select": "id,subject,chapter,class_level,difficulty,language,created_at,student_responses(id)",
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
            for q in quizzes:
                responses = q.get("student_responses", [])
                q["submission_count"] = len(responses) if isinstance(responses, list) else 0
                q.pop("student_responses", None)
            return quizzes
    except Exception as e:
        print(f"ERROR fetching teacher shared quizzes: {e}")
        return []


def get_quiz_student_responses(quiz_id: str, teacher_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve student submission leaderboard for a specific shared quiz (teacher only).
    """
    if not _API_KEY:
        return []

    # Verify teacher owns this quiz
    shared_quiz = get_shared_quiz(quiz_id)
    if not shared_quiz or shared_quiz.get("created_by") != teacher_id:
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
            return json.loads(res_body)
    except Exception as e:
        print(f"ERROR fetching student responses for quiz {quiz_id}: {e}")
        return []

