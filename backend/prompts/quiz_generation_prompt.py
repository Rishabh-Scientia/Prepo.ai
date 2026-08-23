"""
Prompt template for quiz generation with topic guardrail verification.
"""


def build_quiz_generation_prompt(
    class_level: str,
    subject: str,
    chapter: str,
    num_questions: int,
    language: str,
    difficulty: str,
) -> str:
    """Return the fully-interpolated prompt for quiz generation with strict topic validation."""

    return f"""You are an expert academic evaluator and question author for Class/Level: "{class_level}", Subject: "{subject}", Chapter/Topic: "{chapter}".

STEP 1: TOPIC VALIDATION GUARDRAIL (CRITICAL)
Inspect the subject "{subject}" and chapter/topic "{chapter}".
- Determine if the subject and chapter/topic represent a real, recognized, meaningful educational, academic, or professional study topic (e.g. Physics, History, Data Structures, Marketing, Organic Chemistry, General Knowledge, Indian Polity, etc.).
- If the subject or topic is nonsensical gibberish (e.g., keyboard smashing like "jsdjkshcdjkscd", "dsjfsjfjt", "njfdsfj", "asdasdasd", random numbers), vulgar/offensive content, or completely meaningless text from which a legitimate educational quiz cannot be made:
  You MUST REJECT and return ONLY this JSON:
  {{
    "status": "invalid_topic",
    "error": "The specified topic '{subject} — {chapter}' is not recognized as a valid educational subject or topic. Please enter a real subject and chapter name."
  }}

STEP 2: IF TOPIC IS VALID:
Generate exactly {num_questions} multiple-choice questions at {difficulty} difficulty.
Write all question text, options, and explanations in {language}.

Rules:
- Return ONLY valid JSON. No markdown code fences, no preamble, no commentary.
- Each question must have exactly 4 options with exactly one correct answer.
- Distractor options must reflect realistic mistakes (common misconceptions, sign errors, formula misuse) — not obviously wrong filler options.
- If the level is undergraduate/technical, include numerical/derivation-based questions where appropriate for the subject; otherwise keep to conceptual MCQs.
- If difficulty is "Mixed", distribute questions across easy, medium, and hard levels roughly evenly.
- Question IDs must be sequential: "q1", "q2", "q3", etc.

Return JSON in this exact schema when valid:
{{
  "status": "success",
  "questions": [
    {{
      "id": "q1",
      "type": "mcq",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "difficulty": "medium"
    }}
  ]
}}

Note: "difficulty" must be one of "easy", "medium", or "hard".
IMPORTANT: Return ONLY the raw JSON object. Do NOT wrap it in ```json``` or any other formatting. Do NOT include any text before or after the JSON."""

