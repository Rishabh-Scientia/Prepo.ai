"""
LangGraph StateGraph for quiz evaluation.

Pipeline: evaluate_answers (deterministic) -> generate_explanations (LLM) -> build_summary
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from prompts.explanation_prompt import build_explanation_prompt


# ── Graph State ──────────────────────────────────────────────────────────────

class EvaluateState(TypedDict):
    # Inputs
    quiz: Dict[str, Any]  # Full quiz with correct answers
    answers: List[Dict[str, str]]  # [{question_id, selected_option}]
    language: str  # Language for explanations
    # Internal
    scored_results: List[Dict[str, Any]]
    score: int
    total: int
    # Outputs
    results: Optional[List[Dict[str, Any]]]
    error: Optional[str]


# ── Node Functions ───────────────────────────────────────────────────────────

def evaluate_answers(state: EvaluateState) -> EvaluateState:
    """
    Deterministic MCQ scoring.
    Compare selected option to correct_answer for each question.
    """

    quiz = state["quiz"]
    answers = state["answers"]

    # Build a lookup from question_id -> question
    question_map = {q["id"]: q for q in quiz["questions"]}

    # Build a lookup from question_id -> selected_option
    answer_map = {a["question_id"]: a["selected_option"] for a in answers}

    scored = []
    correct_count = 0
    total = len(quiz["questions"])

    letter_indices = {"A": 0, "B": 1, "C": 2, "D": 3}

    for q in quiz["questions"]:
        qid = q["id"]
        selected = answer_map.get(qid, "")
        correct = q.get("correct_answer", "")
        options = q.get("options", [])

        is_correct = False
        normalized_selected = selected

        if selected:
            # 1. Direct match with correct answer
            if selected.strip() == correct.strip():
                is_correct = True
                normalized_selected = correct
            # 2. If client passed letter 'A', 'B', 'C', 'D'
            elif selected.upper() in letter_indices:
                idx = letter_indices[selected.upper()]
                if 0 <= idx < len(options):
                    normalized_selected = options[idx]
                    if normalized_selected.strip() == correct.strip():
                        is_correct = True
            # 3. If correct_answer was stored as letter 'A', 'B', 'C', 'D'
            elif correct.upper() in letter_indices:
                corr_idx = letter_indices[correct.upper()]
                if 0 <= corr_idx < len(options) and options[corr_idx].strip() == selected.strip():
                    is_correct = True

        if is_correct:
            correct_count += 1

        scored.append({
            "question_id": qid,
            "question_text": q["question"],
            "options": options,
            "selected_option": normalized_selected,
            "correct_answer": correct,
            "is_correct": is_correct,
        })

    return {
        **state,
        "scored_results": scored,
        "score": correct_count,
        "total": total,
    }


LATEX_COMMANDS = {
    "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota",
    "kappa", "lambda", "mu", "nu", "xi", "pi", "rho", "sigma", "tau", "upsilon",
    "phi", "chi", "psi", "omega", "Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi",
    "Sigma", "Upsilon", "Phi", "Psi", "Omega",
    "sin", "cos", "tan", "cot", "sec", "csc", "arcsin", "arccos", "arctan",
    "sinh", "cosh", "tanh", "coth", "log", "ln", "lim", "exp", "max", "min",
    "frac", "dfrac", "tfrac", "sqrt", "int", "iint", "iiint", "oint", "sum", "prod",
    "partial", "nabla", "infty", "cdot", "times", "div", "pm", "mp", "approx",
    "neq", "le", "ge", "leq", "geq", "equiv", "sim", "propto", "subset", "subseteq",
    "cup", "cap", "in", "notin", "forall", "exists", "to", "rightarrow", "leftarrow",
    "Rightarrow", "Leftarrow", "Leftrightarrow", "implies", "iff",
    "text", "textbf", "textit", "mathrm", "mathbf", "mathit", "vec", "hat", "bar",
    "dot", "ddot", "tilde", "overline", "underline", "left", "right", "begin", "end"
}
_LATEX_PATTERN = "|".join(sorted(LATEX_COMMANDS, key=len, reverse=True))
_LATEX_REGEX = re.compile(rf"(?<!\\)\\({_LATEX_PATTERN})(?![a-zA-Z])")


def _sanitize_json_latex(text: str) -> str:
    """
    Ensure LaTeX commands like \\frac, \\times, \\theta inside raw JSON strings
    are double-escaped so json.loads does not parse \\f into form feed (\\x0c)
    or \\t into tab (\\x09) or \\b into backspace (\\x08).
    """
    return _LATEX_REGEX.sub(r"\\\\\1", text)


def _clean_explanation_field(val: Any) -> str:
    """Clean and restore LaTeX control characters from an explanation field."""
    if not val:
        return ""
    s = str(val).replace("\x0c", r"\f").replace("\x08", r"\b")
    s = re.sub(r"(?<!\\)int_", r"\\int_", s)
    s = re.sub(r"(?<!\\)sum_", r"\\sum_", s)
    s = re.sub(r"(?<!\\)lim_", r"\\lim_", s)
    s = re.sub(r"(?<!\\)frac\{", r"\\frac{", s)
    s = re.sub(r"(?<!\\)sqrt\{", r"\\sqrt{", s)
    return s.strip()


def find_explanation_for_question(explanations_map: dict, qid: str, index: int) -> dict:
    """
    Intelligently find the explanation object for a question from LLM output.
    Handles:
    - Exact match: "q4"
    - Case-insensitive: "Q4", "q4"
    - Numeric index: "4", 4, index (3 or 4)
    - Named prefix: "question_4", "Question 4", "Question4"
    - Fallback by positional index in list/dict values
    """
    if not isinstance(explanations_map, dict):
        return {}

    # 1. Exact match
    if qid in explanations_map and isinstance(explanations_map[qid], dict):
        return explanations_map[qid]

    # 2. Case-insensitive
    qid_lower = str(qid).lower().strip()
    for k, v in explanations_map.items():
        if str(k).lower().strip() == qid_lower and isinstance(v, dict):
            return v

    # 3. Numeric extraction: "q4" -> "4"
    num_match = re.search(r"\d+", str(qid))
    if num_match:
        q_num = num_match.group(0)
        # Check "4", 4, "Question 4", "question_4"
        for k, v in explanations_map.items():
            k_str = str(k).lower().strip()
            k_num = re.search(r"\d+", k_str)
            if k_num and k_num.group(0) == q_num and isinstance(v, dict):
                return v

    # 4. By positional index
    values = [v for v in explanations_map.values() if isinstance(v, dict)]
    if index < len(values):
        return values[index]

    return {}


def _extract_json_dict(raw: str) -> dict:
    """Robustly extract and parse JSON object from LLM response."""
    if not raw or not raw.strip():
        raise ValueError("Empty response received from LLM")

    text = raw.strip()

    # 1. Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    # 2. Sanitize LaTeX commands in raw JSON text to preserve backslashes
    sanitized = _sanitize_json_latex(cleaned)

    try:
        return json.loads(sanitized)
    except Exception:
        pass

    # 3. Extract substring between outermost { and }
    start = sanitized.find("{")
    end = sanitized.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = sanitized[start : end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # 4. Fallback on original text if needed
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
    max_tokens: int = 4096,
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


def generate_explanations(state: EvaluateState) -> EvaluateState:
    """Generate 4-part explanations for all questions using LLM."""

    if state.get("error"):
        return state

    scored = state["scored_results"]
    language = state.get("language", "English")

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_EVAL_MODEL", os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"))

    prompt = build_explanation_prompt(scored, language)

    explanations_map = {}
    try:
        raw = invoke_groq_safe(
            prompt=prompt,
            model=model,
            api_key=api_key,
            temperature=0.3,
            max_tokens=4096,
        )
        parsed = _extract_json_dict(raw)

        # Robustly extract explanations_map from parsed dict
        raw_exp = parsed.get("explanations")
        if isinstance(raw_exp, dict):
            explanations_map = raw_exp
        elif isinstance(raw_exp, list):
            temp_map = {}
            for exp in raw_exp:
                if isinstance(exp, dict):
                    k = exp.get("question_id") or exp.get("id")
                    if k:
                        temp_map[str(k)] = exp
            explanations_map = temp_map
        elif isinstance(parsed, dict):
            explanations_map = parsed

    except Exception as e:
        print(f"Explanation generation warning: {e}")

    # Merge explanations into scored results
    for i, item in enumerate(scored):
        qid = item["question_id"]
        exp_data = find_explanation_for_question(explanations_map, qid, i)

        confirmation = _clean_explanation_field(exp_data.get("confirmation"))
        if not confirmation:
            confirmation = "Correct!" if item["is_correct"] else "Incorrect."

        core_concept = _clean_explanation_field(exp_data.get("core_concept"))
        if not core_concept:
            core_concept = f"Core concept for question: {item.get('question_text', '')[:70]}"

        reasoning = _clean_explanation_field(exp_data.get("reasoning"))
        if not reasoning:
            reasoning = f"The correct answer is {item.get('correct_answer', '')}."

        why_wrong = _clean_explanation_field(exp_data.get("why_incorrect_option_wrong"))
        if not why_wrong:
            if item["is_correct"]:
                why_wrong = "Good job selecting the correct option! Always double check your steps."
            else:
                why_wrong = f"Selected option '{item.get('selected_option', '')}' is incorrect. Review the step-by-step reasoning."

        item["explanation"] = {
            "confirmation": confirmation,
            "core_concept": core_concept,
            "reasoning": reasoning,
            "why_incorrect_option_wrong": why_wrong,
        }

    return {**state, "scored_results": scored}


def build_summary(state: EvaluateState) -> EvaluateState:
    """Aggregate the final response payload."""

    if state.get("error"):
        return state

    results = []
    for item in state["scored_results"]:
        results.append({
            "question_id": item["question_id"],
            "question_text": item["question_text"],
            "options": item["options"],
            "selected_option": item["selected_option"],
            "is_correct": item["is_correct"],
            "correct_answer": item["correct_answer"],
            "explanation": item["explanation"],
        })

    return {
        **state,
        "results": results,
    }


# ── Build Graph ──────────────────────────────────────────────────────────────

def build_evaluate_graph():
    """Construct and compile the quiz evaluation StateGraph."""

    graph = StateGraph(EvaluateState)

    # Add nodes
    graph.add_node("evaluate_answers", evaluate_answers)
    graph.add_node("generate_explanations", generate_explanations)
    graph.add_node("build_summary", build_summary)

    # Set entry point
    graph.set_entry_point("evaluate_answers")

    # Linear pipeline
    graph.add_edge("evaluate_answers", "generate_explanations")
    graph.add_edge("generate_explanations", "build_summary")
    graph.add_edge("build_summary", END)

    return graph.compile()
