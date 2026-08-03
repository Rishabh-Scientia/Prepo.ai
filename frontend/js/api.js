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
};

