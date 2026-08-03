# 🚀 Prepo.ai — AI-Powered Adaptive Quiz & Assessment Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.0.26-orange.svg)](https://github.com/langchain-ai/langgraph)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-purple.svg)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Prepo.ai** is a full-stack, AI-powered assessment platform designed for students and educators. It dynamically generates custom multiple-choice quizzes tailored to any academic level, subject, or chapter, provides instant scoring with step-by-step AI-generated explanations, and enables teachers to share quizzes with students via unique links with live response leaderboards.

---

## 🌟 Key Features

### 🎯 1. Custom AI Quiz Generation
- **Tailored Filtering**: Select Grade/Class Level (e.g. *Class 10 CBSE*, *B.Tech 3rd Sem ECE*, *NEET Dropper*), Subject, Chapter/Topic, Question Count (5, 10, 15, 20), Difficulty (*Easy*, *Medium*, *Hard*, *Mixed*), and Language (*English*, *Hindi*, *Hinglish*).
- **Orchestrated via LangGraph & Groq (Llama 3.3 70B)**: Structured JSON generation with automatic retries on validation failure.

### ⚡ 2. Instant Scoring & AI Explanations
- **Deterministic Grading**: 0ms score calculation by comparing student choices to correct options.
- **Detailed Step-by-Step AI Explanations**: 4-part breakdown per question:
  - **Verdict**: Clear confirmation of right/wrong selection.
  - **Core Concept**: Fundamental principle being tested.
  - **Step-by-Step Reasoning**: Full derivation or logic.
  - **Misconception Analysis**: Explaining why distractor options are incorrect.

### 🔒 3. Supabase Authentication Layer
- User registration and login using Supabase Auth SDK.
- Support for **Full Name** user metadata.
- Secure FastAPI backend dependency verifying Supabase JWTs (supporting both legacy `HS256` and modern `ES256` ECC P-256 tokens).

### 📊 4. User Profile & Attempt History
- Personal dashboard displaying avatar, full name, email, and total quizzes attempted.
- History list with score badges (color-coded by percentage: Green, Blue, Amber, Red).
- **View Response**: One-click review to reload full score breakdowns and step-by-step AI explanations for any past attempt.

### 🔗 5. Teacher Share & Student Test Mode (Google Forms Style)
- **1-Click Share**: Teachers can share any generated quiz via a unique link (`?quiz_id=UUID`).
- **Zero API Delay / Zero Rate Limit Risk**: Pre-generated explanations are stored at share time, so 50+ students can submit simultaneously with instant 0.1s grading.
- **Student Mode**: Students enter their Full Name to take tests without needing an account.
- **Live Teacher Leaderboard**: Teachers can view student submission counts, scores, percentages, and timestamps in real-time.

---

## 🏗️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (CDN), Custom Design System Tokens |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic V2 |
| **AI Orchestration** | LangGraph, LangChain, Groq API (`llama-3.3-70b-versatile`) |
| **Auth & Database** | Supabase Auth (JWT), Supabase Postgres (REST API), `python-jose` |
| **Deployment** | Render (Backend Web Service), Vercel (Frontend Static Hosting) |

---

## 📁 Repository Structure

```
Prepo.ai/
├── backend/
│   ├── auth/
│   │   ├── __init__.py
│   │   └── verify.py          # FastAPI Supabase JWT verification dependency
│   ├── graph/
│   │   ├── generate_graph.py   # LangGraph pipeline for quiz generation
│   │   └── evaluate_graph.py   # LangGraph pipeline for evaluation & explanations
│   ├── models/
│   │   └── schemas.py          # Pydantic V2 request & response models
│   ├── prompts/
│   │   ├── quiz_generation_prompt.py
│   │   └── evaluation_prompt.py
│   ├── store/
│   │   ├── session_store.py    # In-memory session cache
│   │   └── db_store.py         # Supabase REST API helper (quiz_attempts, shared_quizzes)
│   ├── main.py                 # FastAPI application & REST endpoints
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Virtual environment
├── frontend/
│   ├── css/
│   │   └── theme.css           # Custom W3Schools-style design tokens & utility styles
│   ├── js/
│   │   ├── auth.js             # Supabase JS SDK client & auth orchestration
│   │   ├── api.js              # HTTP client attaching JWT Bearer tokens
│   │   └── app.js              # Main application state, navigation & UI handlers
│   └── index.html              # Single Page Application (SPA) structure
├── render.yaml                 # Render deployment configuration
├── .env                        # Local environment variables
└── README.md                   # Project documentation
```

---

## 🔧 Database Setup (Supabase SQL)

Run the following SQL queries in your **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Quiz Attempts (Personal History)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    class_level TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    language TEXT DEFAULT 'English',
    score INT NOT NULL,
    total INT NOT NULL,
    questions JSONB,
    user_answers JSONB,
    evaluation_results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- 2. Shared Quizzes (Teacher Share Link)
CREATE TABLE IF NOT EXISTS shared_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by UUID NOT NULL,
    teacher_name TEXT DEFAULT 'Teacher',
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    class_level TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    language TEXT DEFAULT 'English',
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view shared quizzes" ON shared_quizzes FOR SELECT USING (true);
CREATE POLICY "Teachers can insert shared quizzes" ON shared_quizzes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Teachers can manage their own shared quizzes" ON shared_quizzes FOR ALL USING (auth.uid() = created_by);

-- 3. Student Responses (Student Submissions)
CREATE TABLE IF NOT EXISTS student_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES shared_quizzes(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    student_answers JSONB NOT NULL,
    evaluation_results JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit quiz responses" ON student_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can view responses for their shared quizzes" ON student_responses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shared_quizzes
        WHERE shared_quizzes.id = student_responses.quiz_id
        AND shared_quizzes.created_by = auth.uid()
    )
);
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Python 3.11+
- Supabase Account & Project
- Groq API Key

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Rishabh-Scientia/Prepo.ai.git
cd Prepo.ai

# Activate virtual environment (Windows)
.\backend\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

### 3. Run FastAPI Backend
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will run at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 4. Serve Frontend
Open `frontend/index.html` in a web browser or serve with Live Server:
```bash
npx serve frontend
```

---

## 🚀 Deployment

- **Backend**: Deployed on **Render** (Python Web Service running `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`).
- **Frontend**: Deployed on **Vercel** pointing to Render backend API URL.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Rishabh-Scientia/Prepo.ai/issues).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
