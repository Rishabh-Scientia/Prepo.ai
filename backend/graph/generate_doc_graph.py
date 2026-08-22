"""
Prepo.ai — LangGraph StateGraph for Document-Based Quiz Generation

Pipeline: validate_doc_input -> generate_doc_quiz -> validate_doc_quiz_json
With automatic retry on JSON parse failure and Layer-2 Guardrail detection.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from prompts.doc_quiz_prompt import build_doc_quiz_generation_prompt
from utils.doc_parser import truncate_document_text


# ── Graph State ──────────────────────────────────────────────────────────────

class GenerateDocState(TypedDict):
    # Inputs
    document_text: str
    num_questions: int
    language: str
    difficulty: str
    subject: str
    # Internal
    raw_llm_output: str
    retry_count: int
    # Outputs
    quiz: Optional[Dict[str, Any]]
    error: Optional[str]
    guardrail_rejected: bool
    guardrail_message: Optional[str]


# ── Node Functions ───────────────────────────────────────────────────────────

def validate_doc_input(state: GenerateDocState) -> GenerateDocState:
    """Validate incoming document parameters."""
    errors = []

    text = state.get("document_text", "").strip()
    if not text:
        errors.append("Document text is required")

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


def generate_doc_quiz(state: GenerateDocState) -> GenerateDocState:
    """Invoke Groq to generate quiz based on document text."""
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

    clean_text = truncate_document_text(state["document_text"])

    prompt = build_doc_quiz_generation_prompt(
        document_text=clean_text,
        num_questions=state["num_questions"],
        language=state["language"],
        difficulty=state["difficulty"],
        subject=state.get("subject", ""),
    )

    if state.get("retry_count", 0) > 0:
        prompt += (
            "\n\nPREVIOUS ATTEMPT FAILED TO PARSE AS VALID JSON. "
            "Return ONLY raw valid JSON matching the requested schema. No markdown code blocks."
        )

    try:
        response = llm.invoke(prompt)
        raw_output = response.content
        if isinstance(raw_output, list):
            raw_output = "".join(str(chunk) for chunk in raw_output)
        return {**state, "raw_llm_output": str(raw_output)}
    except Exception as e:
        err_str = str(e)
        if "413" in err_str or "Request too large" in err_str or "rate_limit_exceeded" in err_str or "TPM" in err_str or "tokens" in err_str.lower():
            friendly_msg = "Document is too large. Please upload notes under 15–20 pages or a specific chapter."
            return {
                **state,
                "guardrail_rejected": True,
                "guardrail_message": friendly_msg,
                "error": friendly_msg,
            }
        return {**state, "error": f"LLM generation failed: {str(e)}"}


def validate_doc_quiz_json(state: GenerateDocState) -> GenerateDocState:
    """Validate JSON format, check for Layer-2 Guardrail rejection, and ensure questions integrity."""
    if state.get("error") or state.get("guardrail_rejected"):
        return state

    raw = state.get("raw_llm_output", "").strip()

    try:
        data = _extract_json_dict(raw)
    except Exception as e:
        return {
            **state,
            "error": f"Invalid JSON returned by LLM: {str(e)}",
            "quiz": None,
        }


    # Check Layer-2 Guardrail: Did LLM reject document as non-educational/unsuitable?
    if data.get("status") == "invalid_content" or "error" in data and not data.get("questions"):
        guardrail_msg = data.get("error") or "The uploaded document does not contain adequate educational material to generate a quality quiz. Please upload a clear study document or notes."
        return {
            **state,
            "guardrail_rejected": True,
            "guardrail_message": guardrail_msg,
            "error": guardrail_msg,
            "quiz": None,
        }

    questions = data.get("questions", [])
    if not isinstance(questions, list) or len(questions) == 0:
        return {
            **state,
            "error": "Generated JSON missing questions list",
            "quiz": None,
        }

    # Validate each question structure
    validated_questions = []
    for i, q in enumerate(questions):
        qid = q.get("id") or f"q{i+1}"
        question_text = q.get("question", "").strip()
        options = q.get("options", [])
        correct_answer = q.get("correct_answer", "").strip()
        diff = q.get("difficulty", "medium").lower()

        if not question_text:
            continue
        if not isinstance(options, list) or len(options) != 4:
            continue
        if not correct_answer:
            correct_answer = options[0]

        # Ensure correct_answer matches one of the options
        if correct_answer not in options:
            options[0] = correct_answer

        validated_questions.append({
            "id": qid,
            "type": "mcq",
            "question": question_text,
            "options": options,
            "correct_answer": correct_answer,
            "difficulty": diff if diff in ("easy", "medium", "hard") else "medium",
        })

    if len(validated_questions) < max(3, state["num_questions"] // 2):
        return {
            **state,
            "error": f"Generated only {len(validated_questions)} valid questions out of {state['num_questions']} requested",
            "quiz": None,
        }

    return {
        **state,
        "quiz": {"questions": validated_questions},
        "error": None,
        "guardrail_rejected": False,
    }


def should_retry(state: GenerateDocState) -> str:
    """Decide whether to retry or end the graph."""
    if state.get("guardrail_rejected"):
        return END
    if state.get("error") and state.get("retry_count", 0) < 1:
        return "retry"
    return END


def increment_retry(state: GenerateDocState) -> GenerateDocState:
    """Increment retry counter."""
    return {
        **state,
        "retry_count": state.get("retry_count", 0) + 1,
        "error": None,
    }


# ── Build the Graph ──────────────────────────────────────────────────────────

def build_generate_doc_graph():
    """Build and compile the document quiz generation StateGraph."""
    graph = StateGraph(GenerateDocState)

    graph.add_node("validate_input", validate_doc_input)
    graph.add_node("generate_quiz", generate_doc_quiz)
    graph.add_node("validate_json", validate_doc_quiz_json)
    graph.add_node("increment_retry", increment_retry)

    graph.set_entry_point("validate_input")
    graph.add_edge("validate_input", "generate_quiz")
    graph.add_edge("generate_quiz", "validate_json")

    graph.add_conditional_edges(
        "validate_json",
        should_retry,
        {
            "retry": "increment_retry",
            END: END,
        },
    )
    graph.add_edge("increment_retry", "generate_quiz")

    return graph.compile()
