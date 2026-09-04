import { supabase } from '../config/supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://prepo-ai-fojm.onrender.com');

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error('You must be signed in to perform this action. Please sign in and try again.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

function formatApiError(err, fallback = 'An unexpected error occurred.') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err.detail === 'string') return err.detail;
  if (Array.isArray(err.detail)) {
    return err.detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(', ');
  }
  if (typeof err.detail === 'object' && err.detail !== null) {
    return err.detail.message || err.detail.msg || JSON.stringify(err.detail);
  }
  if (err.message) return err.message;
  return fallback;
}

export const api = {
  /** Health check */
  async health() {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Backend service is currently unavailable.');
    return res.json();
  },

  /** Generate Quiz from structured topics */
  async generateQuiz(config) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/generate-quiz`, {
      method: 'POST',
      headers,
      body: JSON.stringify(config),
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (res.status === 403) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(formatApiError(err, 'Credit limit reached. Please purchase credits to generate quizzes.'));
      error.isCreditLimit = true;
      throw error;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Quiz generation failed (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Generate Quiz from uploaded Document (PDF / DOCX / TXT) */
  async generateQuizFromDoc(formData) {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error('You must be signed in to upload study notes. Please sign in and try again.');
    }

    const res = await fetch(`${API_BASE}/api/generate-quiz-from-doc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (res.status === 403) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(formatApiError(err, 'Credit limit reached. Please purchase credits to generate quizzes.'));
      error.isCreditLimit = true;
      throw error;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Document quiz generation failed (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Evaluate submitted quiz answers */
  async evaluateQuiz(sessionId, answers) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/evaluate-quiz`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        answers,
      }),
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Quiz evaluation failed (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Get personal attempt history */
  async getUserAttempts() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/user/attempts`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch attempt history (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Get specific attempt details by ID */
  async getAttemptById(attemptId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/user/attempts/${attemptId}`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch attempt (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Delete a past attempt */
  async deleteUserAttempt(attemptId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/user/attempts/${attemptId}`, {
      method: 'DELETE',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to delete attempt (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Share quiz with students (creates shared quiz entry) */
  async shareQuiz(sessionId, settings = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/quiz/share`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: sessionId, ...settings }),
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to share quiz (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Teacher: Update shared quiz settings (is_active, time_limit_minutes, show_results) */
  async updateSharedQuizSettings(quizId, settings) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes/${quizId}/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(settings),
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to update quiz settings (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Public: Fetch shared quiz */
  async getSharedQuiz(quizId) {
    const res = await fetch(`${API_BASE}/api/quiz/shared/${quizId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Shared quiz not found (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Public: Submit student answers to shared quiz */
  async submitSharedQuiz(quizId, studentName, answers) {
    const res = await fetch(`${API_BASE}/api/quiz/shared/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: studentName,
        answers,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to submit test (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Teacher: Get all quizzes shared by this teacher */
  async getTeacherSharedQuizzes() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch shared quizzes (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Teacher: Get student responses leaderboard for a quiz */
  async getQuizResponses(quizId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes/${quizId}/responses`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch student responses (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Teacher: Delete a shared quiz */
  async deleteSharedQuiz(quizId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes/${quizId}`, {
      method: 'DELETE',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to delete shared quiz (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Teacher: Seed 4 realistic AI mock student responses for this quiz */
  async seedMockResponses(quizId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/teacher/shared-quizzes/${quizId}/seed-mock-responses`, {
      method: 'POST',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to generate mock responses (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Get remaining user credits */
  async getUserCredits() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/user/credits`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch user credits (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Get available payment pricing plans */
  async getPaymentPlans() {
    const res = await fetch(`${API_BASE}/api/payments/plans`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to fetch payment plans (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Create Razorpay order */
  async createPaymentOrder(planId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/payments/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan_id: planId }),
    });

    if (res.status === 401) throw new Error('Please sign in to buy credits.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Failed to create payment order (HTTP ${res.status})`));
    }
    return res.json();
  },

  /** Verify completed Razorpay payment */
  async verifyPayment(paymentData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/payments/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData),
    });

    if (res.status === 401) throw new Error('Session expired during payment verification. Please sign in again.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatApiError(err, `Payment verification failed (HTTP ${res.status})`));
    }
    return res.json();
  },
};
