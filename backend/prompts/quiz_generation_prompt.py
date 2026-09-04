"""
Prompt template for quiz generation with structured academic progression and topic guardrail verification.
"""


def build_quiz_generation_prompt(
    class_level: str,
    subject: str,
    chapter: str,
    num_questions: int,
    language: str,
    difficulty: str,
) -> str:
    """Return the fully-interpolated prompt for quiz generation with strict topic validation and structured pedagogical blueprint."""

    return f"""You are an elite academic curriculum director, senior professor, and exam question designer for:
- Academic Level: "{class_level}"
- Subject: "{subject}"
- Chapter / Topic: "{chapter}"

═══════════════════════════════════════════════════════════════════════════════
STEP 1: TOPIC VALIDATION GUARDRAIL (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════
Inspect the subject "{subject}" and chapter/topic "{chapter}".
- Determine if the subject and chapter/topic represent a legitimate, recognized educational, academic, or professional study topic (e.g., Physics, Data Structures, Calculus, Organic Chemistry, World History, General Knowledge, Indian Polity, Microeconomics, Electrical Engineering, etc.).
- If the subject or topic is nonsensical keyboard smashing (e.g., "asdsad", "dfjkshfsjkd", "qweqwe"), vulgar/abusive, or completely devoid of educational meaning:
  You MUST REJECT and return ONLY this JSON:
  {{
    "status": "invalid_topic",
    "error": "The specified topic '{subject} — {chapter}' is not recognized as a valid educational subject or topic. Please enter a real academic subject and chapter name."
  }}

═══════════════════════════════════════════════════════════════════════════════
STEP 2: STRUCTURED QUESTION DESIGN BLUEPRINT
═══════════════════════════════════════════════════════════════════════════════
If the topic is valid, generate exactly {num_questions} high-yield, structured multiple-choice questions at "{difficulty}" difficulty.
Write all question text, options, and mathematical content in {language}.

PEDAGOGICAL PROGRESSION & STRUCTURE (MANDATORY):
1. **Curriculum Alignment**: Calibrate question depth and terminology precisely to "{class_level}". (e.g., Class 10 = CBSE/ICSE board standard; Class 12/JEE/NEET = competitive conceptual & numerical depth; B.Tech/GATE = rigorous analytical and engineering depth).
2. **Subtopic Coverage**: Each question MUST test a DIFFERENT subtopic, principle, or mechanism within "{chapter}". Do NOT ask multiple questions about the same definition or formula.
3. **Cognitive Progression (Bloom's Taxonomy)**:
   - First 30% of questions: Core concepts, fundamental definitions, key laws/theorems, and essential properties.
   - Middle 40% of questions: Practical application, standard problem-solving, diagrammatic/scenario interpretation, and formula derivation.
   - Final 30% of questions: Higher-order critical thinking, multi-step calculation, edge cases, and distinguishing between subtle distinctions.
4. **Self-Contained Stems**: Every question stem must provide all necessary context, assumptions, and values (e.g., constants like $g = 9.8\\text{{ m/s}}^2$, $\\epsilon_0$, or system parameters) so the question can be solved deterministically.
5. **High-Quality Distractors**:
   - Exactly 4 options per question (Option A, B, C, D).
   - Exactly one indisputably correct answer.
   - All 3 distractors MUST be plausible, realistic alternatives stemming from common student mistakes (e.g., inverse formula, unit conversion error, common sign oversight, or conceptual misconception) — NEVER use trivial or ridiculous fillers.
   - Keep all 4 options roughly similar in length and grammatical structure.
6. **Difficulty Calibration**:
   - If difficulty is "Easy": Focus on foundational understanding, direct application of fundamental laws, and clear conceptual identification.
   - If difficulty is "Medium": Standard board/competitive exam level requiring 1-2 reasoning steps or numerical substitution.
   - If difficulty is "Hard": Advanced multi-concept synthesis, non-trivial numerical calculations, or deep edge cases.
   - If difficulty is "Mixed": Distribute roughly 30% Easy, 40% Medium, and 30% Hard across the test.

═══════════════════════════════════════════════════════════════════════════════
MATHEMATICAL & SCIENTIFIC NOTATION (LATEX FORMATTING) — CRITICAL:
═══════════════════════════════════════════════════════════════════════════════
Whenever any question or option contains variables, mathematical expressions, fractions, powers, roots, vectors, integrals, derivatives, Greek letters, chemical formulas, or numbers with scientific units:
- ALWAYS enclose the ENTIRE mathematical term (both variable/number AND unit) inside a single `$ ... $` block:
  * Correct: `$q_1 = 2\\ \\mu\\text{{C}}$`, `$q_2 = -3\\ \\mu\\text{{C}}$`, `$r = 5\\text{{ cm}}$`, `$F = 21.6\\text{{ N}}$`
  * Correct: `$E = mc^2$`, `$\\vec{{F}} = m\\vec{{a}}$`, `$\\frac{{1}}{{4\\pi\\epsilon_0}}$`, `$\\theta = 45^\\circ$`, `$\\Omega$`
  * WRONG: `$q_1 = 2$` followed by `\\mu\\text{{C}}` outside dollar signs.
  * WRONG: Splitting formulas or putting raw LaTeX commands outside `$ ... $`.
- Inside options containing math, format the entire math value in LaTeX (e.g., `["$\\frac{{1}}{{2}}mv^2$", "$mgh$", "$\\frac{{1}}{{2}}kx^2$", "$mv$"]`).
- NEVER insert line breaks inside questions or options. Keep each question statement in a single flowing paragraph.
- Properly double-escape all backslashes in JSON strings (e.g. `\\\\frac`, `\\\\sqrt`, `\\\\mu`, `\\\\text`, `\\\\pi`).

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════════════════════
Return ONLY a valid, parseable JSON object matching this exact schema:
{{
  "status": "success",
  "questions": [
    {{
      "id": "q1",
      "type": "mcq",
      "question": "Clear, self-contained question statement with LaTeX math where applicable",
      "options": [
        "First option",
        "Second option",
        "Third option",
        "Fourth option"
      ],
      "correct_answer": "First option",
      "difficulty": "easy"
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- `correct_answer` MUST EXACTLY MATCH one of the strings inside `options`.
- `difficulty` must be one of: "easy", "medium", or "hard".
- Number of items in `questions` MUST BE EXACTLY {num_questions}.
- Output ONLY the raw JSON object. Do NOT wrap in ```json ``` code fences. Do NOT include introductory or concluding remarks.
"""
