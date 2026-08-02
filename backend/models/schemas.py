"""
Pydantic models for request validation, response serialization, and internal data structures.
All input validation is enforced via Pydantic V2 validators.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Enums ────────────────────────────────────────────────────────────────────

class Language(str, Enum):
    ENGLISH = "English"
    HINDI = "Hindi"
    HINGLISH = "Hinglish"


class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    MIXED = "Mixed"


class QuestionType(str, Enum):
    MCQ = "mcq"
    NUMERICAL = "numerical"


# ── Request Models ───────────────────────────────────────────────────────────

class GenerateQuizRequest(BaseModel):
    """Validated input from the quiz-configuration form."""

    class_level: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Grade or academic level, e.g. 'Class 10 CBSE', 'B.Tech 3rd Sem ECE'",
    )
    subject: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Subject name, e.g. 'Physics', 'DBMS'",
    )
    chapter: str = Field(
        ...,
        min_length=1,
        max_length=300,
        description="Chapter or topic, e.g. 'Normalization in DBMS'",
    )
    num_questions: int = Field(
        ...,
        description="Number of questions to generate",
    )
    language: Language = Field(
        ...,
        description="Language for questions and explanations",
    )
    difficulty: Difficulty = Field(
        ...,
        description="Difficulty level of the quiz",
    )

    @field_validator("class_level", "subject", "chapter")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field must not be empty or whitespace-only")
        return v

    @field_validator("num_questions")
    @classmethod
    def validate_num_questions(cls, v: int) -> int:
        allowed = {5, 10, 15, 20}
        if v not in allowed:
            raise ValueError(f"num_questions must be one of {sorted(allowed)}")
        return v


class AnswerItem(BaseModel):
    """A single answer submitted by the student."""

    question_id: str = Field(..., min_length=1)
    selected_option: str = Field(..., min_length=1)


class EvaluateQuizRequest(BaseModel):
    """Validated input for quiz evaluation."""

    session_id: str = Field(..., min_length=1, description="Session identifier")
    answers: List[AnswerItem] = Field(..., min_length=1, description="Student answers")


# ── Internal / LLM-Output Models ────────────────────────────────────────────

class QuestionInternal(BaseModel):
    """Full question object stored server-side (includes correct_answer)."""

    id: str
    type: QuestionType = QuestionType.MCQ
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_answer: str
    difficulty: str

    @field_validator("correct_answer")
    @classmethod
    def answer_must_be_in_options(cls, v: str, info) -> str:
        options = info.data.get("options", [])
        if options and v not in options:
            raise ValueError(
                f"correct_answer '{v}' must exactly match one of the options: {options}"
            )
        return v


class QuizInternal(BaseModel):
    """Full quiz stored server-side."""

    questions: List[QuestionInternal]


# ── Response Models ──────────────────────────────────────────────────────────

class QuestionPublic(BaseModel):
    """Question sent to the client — correct_answer is EXCLUDED."""

    id: str
    type: QuestionType
    question: str
    options: List[str]
    difficulty: str


class GenerateQuizResponse(BaseModel):
    """Response payload from /api/generate-quiz."""

    session_id: str
    questions: List[QuestionPublic]


class ExplanationBlock(BaseModel):
    """4-part explanation for a single question."""

    confirmation: str
    core_concept: str
    reasoning: str
    why_incorrect_option_wrong: str


class QuestionResult(BaseModel):
    """Per-question result sent back after evaluation."""

    question_id: str
    question_text: str
    options: List[str]
    selected_option: str
    is_correct: bool
    correct_answer: str
    explanation: ExplanationBlock


class EvaluateQuizResponse(BaseModel):
    """Response payload from /api/evaluate-quiz."""

    score: int
    total: int
    results: List[QuestionResult]
