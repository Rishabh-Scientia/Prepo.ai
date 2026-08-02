"""
Prompt template for quiz generation via Gemini 2.0 Flash.
"""


def build_quiz_generation_prompt(
    class_level: str,
    subject: str,
    chapter: str,
    num_questions: int,
    language: str,
    difficulty: str,
) -> str:
    """Return the fully-interpolated system prompt for quiz generation."""

    return f"""You are an expert academic content creator for {class_level} level, subject: {subject}, chapter/topic: {chapter}.
Generate exactly {num_questions} multiple-choice questions at {difficulty} difficulty.
Write all question text, options, and explanations in {language}.

Rules:
- Return ONLY valid JSON. No markdown code fences, no preamble, no commentary.
- Each question must have exactly 4 options with exactly one correct answer.
- Distractor options must reflect realistic mistakes (common misconceptions, sign errors, formula misuse) — not obviously wrong filler options.
- If the level is undergraduate/technical, include numerical/derivation-based questions where appropriate for the subject; otherwise keep to conceptual MCQs.
- If difficulty is "Mixed", distribute questions across easy, medium, and hard levels roughly evenly.
- Question IDs must be sequential: "q1", "q2", "q3", etc.

Return JSON in this exact schema:
{{
  "questions": [
    {{
      "id": "q1",
      "type": "mcq",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "string (must exactly match one option)",
      "difficulty": "easy" | "medium" | "hard"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object. Do NOT wrap it in ```json``` or any other formatting. Do NOT include any text before or after the JSON."""
