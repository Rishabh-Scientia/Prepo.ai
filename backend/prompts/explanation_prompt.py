"""
Prompt template for generating 4-part explanations after quiz evaluation.
"""

from typing import List, Dict


def build_explanation_prompt(
    questions_with_answers: List[Dict],
    language: str,
) -> str:
    """
    Build a prompt that asks the LLM to generate explanations for all questions
    in a single call (batched for efficiency).

    Each item in questions_with_answers should have:
      - question_id
      - question_text
      - options
      - selected_option
      - correct_answer
      - is_correct
    """

    question_blocks = []
    for item in questions_with_answers:
        block = f"""Question ID: {item["question_id"]}
Question: {item["question_text"]}
Options: {", ".join(item["options"])}
Student selected: {item["selected_option"]}
Correct answer: {item["correct_answer"]}
Student was: {"CORRECT" if item["is_correct"] else "INCORRECT"}"""
        question_blocks.append(block)

    all_questions = "\n\n---\n\n".join(question_blocks)

    return f"""You are an expert academic tutor. For each question below, generate a detailed explanation in {language}.

{all_questions}

For EACH question, produce a JSON object with these four fields:
1. "confirmation": one line confirming whether the student's answer was correct or incorrect.
2. "core_concept": the underlying concept/formula/theorem this question tests.
3. "reasoning": a step-by-step explanation of why the correct answer is right.
4. "why_incorrect_option_wrong": if the student was wrong, explain specifically why their selected option is wrong or misleading (name the specific misconception/error type). If the student was correct, briefly note the most common mistake others make on this question instead.

MATHEMATICAL & SCIENTIFIC FORMULAS:
- Whenever explaining mathematical formulas, steps, derivations, equations, fractions, powers, roots, or trigonometric expressions:
  ALWAYS use standard LaTeX syntax enclosed in `$ ... $` (e.g. `$\\tan^{{-1}} x$`, `$\\frac{{\\pi}}{{4}}$`, `$\\sin^2\\theta + \\cos^2\\theta = 1$`).
- Ensure all LaTeX backslashes inside JSON strings are properly escaped (e.g. `\\frac`, `\\pi`, `\\theta`, `\\sqrt`).

Return ONLY a valid JSON object with this exact structure — no markdown fences, no extra text:
{{
  "explanations": {{
    "q1": {{
      "confirmation": "...",
      "core_concept": "...",
      "reasoning": "...",
      "why_incorrect_option_wrong": "..."
    }},
    "q2": {{ ... }}
  }}
}}

IMPORTANT: The keys in "explanations" must match the Question IDs exactly. Return ONLY the JSON object."""
