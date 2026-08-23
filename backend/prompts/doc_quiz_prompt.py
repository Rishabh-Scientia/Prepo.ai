"""
Prepo.ai — Prompt Template for Document-Based Quiz Generation

Enforces strict grounding on the uploaded document text and provides
a Layer-2 Guardrail if the document is non-educational or unsuitable for a quiz.
"""

from __future__ import annotations


def build_doc_quiz_generation_prompt(
    document_text: str,
    num_questions: int,
    language: str,
    difficulty: str,
    subject: str = "",
) -> str:
    """
    Return the fully-interpolated prompt for generating a quiz from document text.
    Includes quality guardrail instructions.
    """
    subject_hint = f"Subject / Context: {subject}\n" if subject else ""

    return f"""You are an expert educational examiner and question author.
Your task is to analyze the source document below and generate a high-quality practice quiz based STRICTLY on its contents.

{subject_hint}Target Difficulty: {difficulty}
Number of Questions Required: {num_questions}
Language of Questions & Options: {language}

--- SOURCE DOCUMENT START ---
{document_text}
--- SOURCE DOCUMENT END ---

CRITICAL INSTRUCTIONS & GUARDRAILS:

1. CONTENT SUITABILITY GUARDRAIL:
   - First, inspect the document. If the document is NOT educational study material (e.g. it is just random receipts, invoices, error logs, meaningless symbols, spam, or contains insufficient factual information to create {num_questions} distinct, meaningful MCQs), do NOT hallucinate or make up fake facts.
   - Instead, return ONLY this JSON:
     {{"status": "invalid_content", "error": "The uploaded document does not contain sufficient educational concepts or study material to generate a quality quiz. Please upload a good document (notes, chapter PDF, or study material) with clear text."}}

2. IF DOCUMENT IS VALID (STUDY MATERIAL / NOTES / CHAPTER):
   - Generate exactly {num_questions} multiple-choice questions at {difficulty} difficulty in {language}.
   - Every question and its correct answer MUST be directly verifiable and grounded in the source document above.
   - Distractors (incorrect options) must be realistic and believable, but unambiguously incorrect based on the document.
   - Each question must have exactly 4 options with exactly one correct answer.
   - Question IDs must be sequential: "q1", "q2", "q3", etc.

Return JSON in this EXACT schema when valid:
{{
  "status": "success",
  "questions": [
    {{
      "id": "q1",
      "type": "mcq",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "difficulty": "medium"
    }}
  ]
}}

Note: "difficulty" must be one of "easy", "medium", or "hard".
IMPORTANT: Return ONLY the raw JSON object. Do NOT use markdown fences (```json). Do NOT add preamble or commentary before or after."""
