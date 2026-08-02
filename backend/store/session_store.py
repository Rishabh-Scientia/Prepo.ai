"""
Thread-safe in-memory session store.

Stores generated quizzes (with correct answers) keyed by session_id.
Designed to be swapped for a database-backed store in the future without
changing the public interface.
"""

from __future__ import annotations

import threading
from typing import Any, Dict, Optional


class SessionStore:
    """Simple in-memory key-value store protected by a threading lock."""

    def __init__(self) -> None:
        self._store: Dict[str, Any] = {}
        self._lock = threading.Lock()

    def save(self, session_id: str, data: Any) -> None:
        """Persist quiz data for a session."""
        with self._lock:
            self._store[session_id] = data

    def get(self, session_id: str) -> Optional[Any]:
        """Retrieve quiz data by session_id. Returns None if not found."""
        with self._lock:
            return self._store.get(session_id)

    def delete(self, session_id: str) -> bool:
        """Remove a session. Returns True if it existed."""
        with self._lock:
            return self._store.pop(session_id, None) is not None

    def exists(self, session_id: str) -> bool:
        """Check whether a session exists."""
        with self._lock:
            return session_id in self._store


# Singleton instance used across the application
session_store = SessionStore()
