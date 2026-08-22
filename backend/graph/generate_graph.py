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
    # Guardrail
    guardrail_rejected: Optional[bool]
    guardrail_message: Optional[str]
    # Outputs
    quiz: Optional[Dict[str, Any]]
    error: Optional[str]


# ── Node Functions ───────────────────────────────────────────────────────────

import re


def is_likely_gibberish_topic(text: str) -> bool:
    """
    Layer-1 Heuristic Guardrail:
    Detect keyboard smashing, random consonant strings, and non-words.
    """
    if not text or len(text.strip()) < 2:
        return True

    cleaned = text.strip().lower()
    words = cleaned.split()

    for word in words:
        # If word is 5+ characters with 0 vowels and not digits
        if len(word) >= 5 and not any(c in "aeiouy" for c in word) and not word.isdigit():
            return True
        # Check excessive consecutive consonants (>= 6 in a row)
        consonant_count = 0
        for char in word:
            if char in "bcdfghjklmnpqrstvwxz":
                consonant_count += 1
                if consonant_count >= 6:
                    return True
            else:
                consonant_count = 0
        # Check same character repeated >= 4 times (e.g. "aaaa", "zzzz")
        if re.search(r"(.)\1{3,}", word):
            return True

    return False


def validate_input(state: GenerateState) -> GenerateState:
    """Sanity-check incoming filters and run Layer-1 Guardrail on subject/topic."""

    errors = []

    subject = state.get("subject", "").strip()
    chapter = state.get("chapter", "").strip()
    class_level = state.get("class_level", "").strip()

    if not class_level:
        errors.append("class_level is required")
    if not subject:
        errors.append("subject is required")
    if not chapter:
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

    # Layer-1 Heuristic Guardrail check for gibberish
    if is_likely_gibberish_topic(subject):
        msg = "The entered subject does not appear to be a valid educational subject. Please enter a real subject (e.g., Physics, History, Biology)."
        return {**state, "error": msg, "guardrail_rejected": True, "guardrail_message": msg}

    if is_likely_gibberish_topic(chapter):
        msg = "The entered chapter/topic does not appear to be a valid topic. Please enter a meaningful topic (e.g., Thermodynamics, Data Structures, Indian History)."
        return {**state, "error": msg, "guardrail_rejected": True, "guardrail_message": msg}

    if is_likely_gibberish_topic(class_level):
        msg = "Please enter a valid class or grade level."
        return {**state, "error": msg, "guardrail_rejected": True, "guardrail_message": msg}

    return state


def _extract_json_dict(raw: str) -> dict:
    """Robustly extract and parse JSON object from LLM response."""
    if not raw or not raw.strip():
        raise ValueError("Empty response received from LLM")

    text = raw.strip()

    # 1. Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 2. Extract substring between outermost { and }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start : end + 1]
        return json.loads(candidate)

    raise ValueError(f"No JSON object found in LLM output: {text[:120]}...")


def generate_quiz(state: GenerateState) -> GenerateState:
    """Call Groq to generate quiz questions."""

    if state.get("error") or state.get("guardrail_rejected"):
        return state

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    llm = ChatGroq(
        model=model,
        groq_api_key=api_key,
        temperature=0.4,
        model_kwargs={"response_format": {"type": "json_object"}},
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
        if isinstance(raw_output, list):
            raw_output = "".join(str(chunk) for chunk in raw_output)
    except Exception as e:
        return {**state, "error": f"LLM call failed: {str(e)}"}

    return {**state, "raw_llm_output": str(raw_output)}


def validate_quiz_json(state: GenerateState) -> GenerateState:
    """Parse LLM output as JSON, check Layer-2 Guardrail, and validate against schema."""

    if state.get("error") or state.get("guardrail_rejected"):
        return state

    raw = state.get("raw_llm_output", "")

    try:
        parsed = _extract_json_dict(raw)
    except Exception as e:
        retry_count = state.get("retry_count", 0)
        if retry_count < 1:
            return {
                **state,
                "retry_count": retry_count + 1,
                "quiz": None,
                "raw_llm_output": "",
            }
        return {**state, "error": f"Failed to parse LLM output as JSON: {str(e)}"}

    # Check Layer-2 Guardrail: Did LLM reject topic as nonsensical/invalid?
    if parsed.get("status") in ("invalid_topic", "invalid_content") or ("error" in parsed and not parsed.get("questions")):
        guardrail_msg = parsed.get("error") or "The entered subject/topic is not recognized as a valid academic topic. Please enter a real subject and chapter name."
        return {
            **state,
            "guardrail_rejected": True,
            "guardrail_message": guardrail_msg,
            "error": guardrail_msg,
            "quiz": None,
        }

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
