/**
 * Prepo.ai — API Client
 * Handles all HTTP communication with the FastAPI backend.
 * Attaches Supabase auth token to protected endpoints.
 */

// Render backend URL (falls back to local dev if on localhost)
const API_BASE = window.BACKEND_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8000" : "https://prepo-ai-fojm.onrender.com");

/**
 * Get authorization headers with the current Supabase access token
 * @returns {Promise<object>} Headers object with Authorization bearer token
 */
async function getAuthHeaders() {
    const { accessToken } = await auth.getSession();
    if (!accessToken) {
        throw new Error("You must be signed in to perform this action. Please sign in and try again.");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
    };
}

const api = {
    /**
     * Health check
     * @returns {Promise<object>}
     */
    async health() {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) throw new Error("Backend is not reachable");
        return res.json();
    },

    /**
     * Generate a quiz
     * @param {object} config - { class_level, subject, chapter, num_questions, language, difficulty }
     * @returns {Promise<{ session_id: string, questions: Array }>}
     */
    async generateQuiz(config) {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/generate-quiz`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(config),
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Quiz generation failed (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Evaluate submitted answers
     * @param {string} sessionId
     * @param {Array<{ question_id: string, selected_option: string }>} answers
     * @returns {Promise<{ score: number, total: number, results: Array }>}
     */
    async evaluateQuiz(sessionId, answers) {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/evaluate-quiz`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                session_id: sessionId,
                answers: answers,
            }),
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Quiz evaluation failed (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Fetch all past quiz attempts for logged-in user
     * @returns {Promise<{ attempts: Array }>}
     */
    async getUserAttempts() {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/user/attempts`, {
            method: "GET",
            headers: headers,
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to fetch attempt history (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Fetch full detailed breakdown for a specific attempt
     * @param {string} attemptId
     * @returns {Promise<object>}
     */
    async getAttemptById(attemptId) {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/user/attempts/${attemptId}`, {
            method: "GET",
            headers: headers,
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to fetch quiz attempt (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Share a generated quiz session with students
     * @param {string} sessionId
     * @returns {Promise<{ shared_quiz_id: string }>}
     */
    async shareQuiz(sessionId) {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/quiz/share`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ session_id: sessionId }),
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to share quiz (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Public: Fetch shared quiz questions for students
     * @param {string} quizId
     * @returns {Promise<object>}
     */
    async getSharedQuiz(quizId) {
        const res = await fetch(`${API_BASE}/api/quiz/shared/${quizId}`);

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Shared quiz not found (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Public: Submit student answers with name
     * @param {string} quizId
     * @param {string} studentName
     * @param {Array} answers
     * @returns {Promise<object>}
     */
    async submitSharedQuiz(quizId, studentName, answers) {
        const res = await fetch(`${API_BASE}/api/quiz/shared/${quizId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_name: studentName,
                answers: answers,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to submit test (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Teacher: Fetch all quizzes shared by this teacher
     * @returns {Promise<{ shared_quizzes: Array }>}
     */
    async getTeacherSharedQuizzes() {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes`, {
            method: "GET",
            headers: headers,
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to fetch shared quizzes (HTTP ${res.status})`);
        }

        return res.json();
    },

    /**
     * Teacher: Fetch student leaderboard responses for a shared quiz
     * @param {string} quizId
     * @returns {Promise<{ responses: Array }>}
     */
    async getQuizResponses(quizId) {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes/${quizId}/responses`, {
            method: "GET",
            headers: headers,
        });

        if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Failed to fetch student responses (HTTP ${res.status})`);
        }

        return res.json();
    },
};

