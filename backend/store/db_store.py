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
