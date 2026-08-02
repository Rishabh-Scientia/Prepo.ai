"""
LangGraph StateGraph for quiz generation.

Pipeline: validate_input -> generate_quiz -> validate_quiz_json
With a conditional retry edge on JSON validation failure (max 1 retry).
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from prompts.quiz_generation_prompt import build_quiz_generation_prompt
from models.schemas import (
    GenerateQuizRequest,
    QuestionInternal,
    QuizInternal,
    Difficulty,
)


# ── Graph State ──────────────────────────────────────────────────────────────

class GenerateState(TypedDict):
    # Inputs
    class_level: str
    subject: str
    chapter: str
    num_questions: int
    language: str
    difficulty: str
    # Internal
    raw_llm_output: str
    retry_count: int
    # Outputs
    quiz: Optional[Dict[str, Any]]
    error: Optional[str]


# ── Node Functions ───────────────────────────────────────────────────────────

def validate_input(state: GenerateState) -> GenerateState:
    """Sanity-check incoming filters. Rejects with a clear error if invalid."""

    errors = []

    if not state.get("class_level", "").strip():
        errors.append("class_level is required")
    if not state.get("subject", "").strip():
        errors.append("subject is required")
    if not state.get("chapter", "").strip():
        errors.append("chapter is required")

    num_q = state.get("num_questions", 0)
    if num_q not in (5, 10, 15, 20):
        errors.append(f"num_questions must be 5, 10, 15, or 20 (got {num_q})")

    valid_languages = {"English", "Hindi", "Hinglish"}
    if state.get("language", "") not in valid_languages:
        errors.append(f"language must be one of {valid_languages}")

    valid_difficulties = {"Easy", "Medium", "Hard", "Mixed"}
    if state.get("difficulty", "") not in valid_difficulties:
        errors.append(f"difficulty must be one of {valid_difficulties}")

    if errors:
        return {**state, "error": "; ".join(errors)}

    return state


def generate_quiz(state: GenerateState) -> GenerateState:
    """Call Groq (Llama 3.3 70B) to generate quiz questions."""

    if state.get("error"):
        return state

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    llm = ChatGroq(
        model=model,
        groq_api_key=api_key,
        temperature=0.7,
    )

    # On retry, add a stricter instruction
    extra_instruction = ""
    if state.get("retry_count", 0) > 0:
        extra_instruction = (
            "\n\nPREVIOUS ATTEMPT FAILED: Your response was not valid JSON. "
            "Return ONLY a raw JSON object. Do NOT use markdown code fences (```). "
            "Do NOT include any text before or after the JSON object."
        )

    prompt = build_quiz_generation_prompt(
        class_level=state["class_level"],
        subject=state["subject"],
        chapter=state["chapter"],
        num_questions=state["num_questions"],
        language=state["language"],
        difficulty=state["difficulty"],
    ) + extra_instruction

    try:
        response = llm.invoke(prompt)
        raw_output = response.content
    except Exception as e:
        return {**state, "error": f"LLM call failed: {str(e)}"}

    return {**state, "raw_llm_output": raw_output}


def validate_quiz_json(state: GenerateState) -> GenerateState:
    """Parse LLM output as JSON and validate against schema."""

    if state.get("error"):
        return state

    raw = state.get("raw_llm_output", "")

    # Strip markdown fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening fence
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        retry_count = state.get("retry_count", 0)
        if retry_count < 1:
            return {
                **state,
                "retry_count": retry_count + 1,
                "quiz": None,
                "raw_llm_output": "",
            }
        return {**state, "error": f"Failed to parse LLM output as JSON after retry: {str(e)}"}

    # Validate structure
    if "questions" not in parsed:
        retry_count = state.get("retry_count", 0)
        if retry_count < 1:
            return {
                **state,
                "retry_count": retry_count + 1,
                "quiz": None,
                "raw_llm_output": "",
            }
        return {**state, "error": "LLM output missing 'questions' key after retry"}

    # Validate each question through Pydantic
    try:
        questions = []
        for i, q in enumerate(parsed["questions"]):
            # Ensure ID exists
            if "id" not in q:
                q["id"] = f"q{i + 1}"
            # Default type
            if "type" not in q:
                q["type"] = "mcq"
            # Default difficulty
            if "difficulty" not in q:
                q["difficulty"] = state["difficulty"].lower()

            validated = QuestionInternal(**q)
            questions.append(validated.model_dump())

        quiz = QuizInternal(questions=[QuestionInternal(**q) for q in questions])
        return {**state, "quiz": quiz.model_dump(), "error": None}

    except Exception as e:
        retry_count = state.get("retry_count", 0)
        if retry_count < 1:
            return {
                **state,
                "retry_count": retry_count + 1,
                "quiz": None,
                "raw_llm_output": "",
            }
        return {**state, "error": f"Quiz validation failed after retry: {str(e)}"}


# ── Routing ──────────────────────────────────────────────────────────────────

def should_retry_or_end(state: GenerateState) -> str:
    """Determine whether to retry generation or proceed to END."""
    if state.get("error"):
        return "end"
    if state.get("quiz") is None and state.get("retry_count", 0) > 0:
        # Need to retry — go back to generate_quiz
        return "retry"
    return "end"


# ── Build Graph ──────────────────────────────────────────────────────────────

def build_generate_graph():
    """Construct and compile the quiz generation StateGraph."""

    graph = StateGraph(GenerateState)

    # Add nodes
    graph.add_node("validate_input", validate_input)
    graph.add_node("generate_quiz", generate_quiz)
    graph.add_node("validate_quiz_json", validate_quiz_json)

    # Set entry point
    graph.set_entry_point("validate_input")

    # Wire edges
    graph.add_conditional_edges(
        "validate_input",
        lambda s: "end" if s.get("error") else "continue",
        {"end": END, "continue": "generate_quiz"},
    )

    graph.add_edge("generate_quiz", "validate_quiz_json")

    graph.add_conditional_edges(
        "validate_quiz_json",
        should_retry_or_end,
        {"retry": "generate_quiz", "end": END},
    )

    return graph.compile()
