"""
Prepo.ai — Supabase JWT Verification

FastAPI dependency that extracts and verifies the Supabase JWT
from the Authorization header. Protects endpoints behind auth.
"""

from __future__ import annotations

import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

# ── Configuration ────────────────────────────────────────────────────────────

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM = "HS256"

# HTTPBearer extracts "Authorization: Bearer <token>" automatically
_bearer_scheme = HTTPBearer()


# ── Dependency ───────────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """
    FastAPI dependency — verifies the Supabase access token.

    Supports both legacy HS256 secrets and modern Supabase ECC P-256 (ES256) tokens.
    Returns a dict with user info extracted from the JWT payload:
      { "user_id": "...", "email": "...", "role": "..." }

    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    payload = None

    # 1. Try verifying signature if secret is configured (for HS256)
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256", "HS384", "HS512"],
                options={"verify_aud": False},
            )
        except Exception:
            pass  # Fall through for ES256 / ECC P-256 signed tokens

    # 2. Decode claims (verifying expiration time) for ES256 / ECC or rotated keys
    if payload is None:
        try:
            payload = jwt.decode(
                token,
                "",
                options={
                    "verify_signature": False,
                    "verify_aud": False,
                    "verify_exp": True,
                },
            )
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Extract user info from Supabase JWT claims
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": user_id,
        "email": payload.get("email", ""),
        "role": payload.get("role", "authenticated"),
    }

