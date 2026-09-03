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


def invoke_groq_safe(
    prompt: str,
    model: str,
    api_key: str,
    temperature: float = 0.3,
    max_tokens: int = 6000,
) -> str:
    """
    Safely invoke Groq with automatic fallback.
    1. First attempt: with response_format={"type": "json_object"}.
    2. Fallback: if server-side json_validate_failed (HTTP 400) occurs,
       re-invoke on the same model without response_format so LLM text
       can be extracted and parsed by _extract_json_dict.
    """
    try:
        llm = ChatGroq(
            model=model,
            groq_api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens,
            model_kwargs={"response_format": {"type": "json_object"}},
        )
        response = llm.invoke(prompt)
        raw = response.content
        if isinstance(raw, list):
            raw = "".join(str(chunk) for chunk in raw)
        return str(raw)
    except Exception as e:
        err_msg = str(e)
        if "json_validate_failed" in err_msg or "Failed to validate JSON" in err_msg or "400" in err_msg:
            llm_fallback = ChatGroq(
                model=model,
                groq_api_key=api_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            response = llm_fallback.invoke(prompt)
            raw = response.content
            if isinstance(raw, list):
                raw = "".join(str(chunk) for chunk in raw)
            return str(raw)
        raise


def generate_doc_quiz(state: GenerateDocState) -> GenerateDocState:
    """Invoke Groq to generate quiz based on document text with resilient fallback."""
    if state.get("error") or state.get("guardrail_rejected"):
        return state

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

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
            "Return ONLY raw valid JSON starting with { and ending with }. No markdown code blocks."
        )

    try:
        raw_output = invoke_groq_safe(
            prompt=prompt,
            model=model,
            api_key=api_key,
            temperature=0.3,
            max_tokens=6000,
        )
        return {**state, "raw_llm_output": str(raw_output), "error": None}
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
        
        retry_count = state.get("retry_count", 0)
        if retry_count < 1:
            return {
                **state,
                "error": "Failed to generate questions. Retrying...",
            }
            
        if "json_validate_failed" in err_str or "Failed to validate JSON" in err_str:
            friendly_err = "Could not generate questions from document. Please try again."
        else:
            friendly_err = f"Document quiz generation failed: {err_str}"
            
        return {**state, "error": friendly_err}


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

        # Auto-wrap and normalize LaTeX in options and correct_answer
        cleaned_options = []
        for opt in options:
            opt_str = re.sub(r"\s+", " ", str(opt)).strip()
            opt_str = opt_str.replace("$$", "$").replace("\\[", "$").replace("\\]", "$")
            # Auto-prefix bare trig & greek words if backslash is missing
            opt_str = re.sub(
                r"(?<!\\)\b(theta|alpha|beta|gamma|delta|pi|sigma|omega|phi|lambda|sin|cos|tan|sec|csc|cot)\b",
                r"\\\1",
                opt_str
            )
            if "$" not in opt_str and ("\\" in opt_str or "^" in opt_str or "_" in opt_str):
                opt_str = f"${opt_str}$"
            cleaned_options.append(opt_str)

        corr = re.sub(r"\s+", " ", str(correct_answer)).strip()
        corr = corr.replace("$$", "$").replace("\\[", "$").replace("\\]", "$")
        corr = re.sub(
            r"(?<!\\)\b(theta|alpha|beta|gamma|delta|pi|sigma|omega|phi|lambda|sin|cos|tan|sec|csc|cot)\b",
            r"\\\1",
            corr
        )
        if "$" not in corr and ("\\" in corr or "^" in corr or "_" in corr):
            corr = f"${corr}$"

        if corr not in cleaned_options and options:
            for orig_opt, clean_opt in zip(options, cleaned_options):
                if re.sub(r"\s+", " ", str(orig_opt)).strip() == re.sub(r"\s+", " ", str(correct_answer)).strip():
                    corr = clean_opt
                    break

        correct_answer = corr
        options = cleaned_options

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
