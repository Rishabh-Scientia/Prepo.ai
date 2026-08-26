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

MATHEMATICAL & SCIENTIFIC FORMULAS (CRITICAL):
- Whenever a question or option contains mathematical formulas, expressions, variables, fractions, powers, roots, trigonometry, calculus, matrices, units, or chemical formulas:
  ALWAYS use standard LaTeX syntax enclosed in single dollar signs `$ ... $` for inline math or `$$ ... $$` for display math.
  Examples:
  * Expressions: `$\\tan^{{-1}} x + \\tan^{{-1}} 2x = \\frac{{\\pi}}{{4}}$`, `$\\arcsin\\left(\\frac{{1}}{{2}}\\right)$`, `$\\sin\\theta$`
  * Fractions & powers: `$\\frac{{\\pi}}{{6}}$`, `$\\frac{{\\sqrt{{3}}}}{{2}}$`, `$x^2 + y^2 = r^2$`, `$\\sqrt{{b^2 - 4ac}}$`
  * Calculus: `$\\int_{{0}}^{{\\pi}} \\sin x \\, dx$`, `$\\lim_{{x \\to 0}} \\frac{{\\sin x}}{{x}}$`
- Options containing formulas must be formatted in LaTeX (e.g. `["$\\frac{{\\pi}}{{6}}$", "$\\frac{{\\pi}}{{3}}$", "$\\frac{{\\pi}}{{4}}$", "$\\frac{{\\pi}}{{2}}$"]`).
- Never use plain text approximations like 'pi/6', 'tan^-1(x)', 'sqrt(x)' or raw unicode when LaTeX represents it cleanly.
- Ensure all LaTeX backslashes inside JSON strings are properly escaped (e.g. `\\frac`, `\\pi`, `\\theta`, `\\sqrt`).

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

