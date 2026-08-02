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

    for q in quiz["questions"]:
        qid = q["id"]
        selected = answer_map.get(qid, "")
        is_correct = selected == q["correct_answer"]

        if is_correct:
            correct_count += 1

        scored.append({
            "question_id": qid,
            "question_text": q["question"],
            "options": q["options"],
            "selected_option": selected,
            "correct_answer": q["correct_answer"],
            "is_correct": is_correct,
        })

    return {
        **state,
        "scored_results": scored,
        "score": correct_count,
        "total": total,
    }


def generate_explanations(state: EvaluateState) -> EvaluateState:
    """Call Groq (Llama 3.3 70B) to generate 4-part explanations for all questions."""

    if state.get("error"):
        return state

    scored = state["scored_results"]
    language = state.get("language", "English")

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    llm = ChatGroq(
        model=model,
        groq_api_key=api_key,
        temperature=0.4,
    )

    prompt = build_explanation_prompt(scored, language)

    try:
        response = llm.invoke(prompt)
        raw = response.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            first_newline = raw.index("\n")
            raw = raw[first_newline + 1:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

        parsed = json.loads(raw)
        explanations_map = parsed.get("explanations", {})

    except Exception as e:
        # If explanation generation fails, provide fallback explanations
        explanations_map = {}
        for item in scored:
            explanations_map[item["question_id"]] = {
                "confirmation": "Correct!" if item["is_correct"] else "Incorrect.",
                "core_concept": "Explanation could not be generated at this time.",
                "reasoning": "Please review the correct answer and try to understand the concept.",
                "why_incorrect_option_wrong": "Explanation unavailable due to a temporary error.",
            }

    # Merge explanations into scored results
    for item in scored:
        qid = item["question_id"]
        explanation = explanations_map.get(qid, {
            "confirmation": "Correct!" if item["is_correct"] else "Incorrect.",
            "core_concept": "Explanation not available.",
            "reasoning": "Explanation not available.",
            "why_incorrect_option_wrong": "Explanation not available.",
        })
        item["explanation"] = explanation

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
