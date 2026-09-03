import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ConfirmModal from '../common/ConfirmModal';
import QuizResults from '../quiz/QuizResults';
import { 
  History, 
  Calendar, 
  Trash2, 
  Eye, 
  Loader2, 
  AlertCircle, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function AttemptHistory({ onCreateQuiz, onShowToast }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected attempt for detailed review
  const [selectedAttemptData, setSelectedAttemptData] = useState(null);
  const [attemptToDelete, setAttemptToDelete] = useState(null);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUserAttempts();
      if (data && data.attempts) {
        setAttempts(data.attempts);
      } else {
        setAttempts([]);
      }
    } catch (err) {
      setError(err.message || 'Could not load your past attempts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const handleViewAttempt = async (attempt) => {
    // If questions and evaluation_results are already in the attempt object
    if (attempt.evaluation_results && Array.isArray(attempt.evaluation_results)) {
      setSelectedAttemptData({
        score: attempt.score,
        total: attempt.total,
        results: attempt.evaluation_results,
        config: {
          subject: attempt.subject,
          chapter: attempt.chapter,
          class_level: attempt.class_level,
          difficulty: attempt.difficulty,
        },
      });
      return;
    }

    try {
      const full = await api.getAttemptById(attempt.id);
      setSelectedAttemptData({
        score: full.score,
        total: full.total,
        results: full.evaluation_results || [],
        config: {
          subject: full.subject,
          chapter: full.chapter,
          class_level: full.class_level,
          difficulty: full.difficulty,
        },
      });
    } catch (err) {
      if (onShowToast) onShowToast('Could not load detailed response.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!attemptToDelete) return;
    try {
      await api.deleteUserAttempt(attemptToDelete.id);
      setAttempts((prev) => prev.filter((a) => a.id !== attemptToDelete.id));
      if (onShowToast) onShowToast('Attempt deleted successfully', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Could not delete attempt', 'error');
    } finally {
      setAttemptToDelete(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (selectedAttemptData) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedAttemptData(null)}
          className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1 mb-2"
        >
          ← Back to Attempt History
        </button>

        <QuizResults
          resultsData={selectedAttemptData}
          onRetake={onCreateQuiz}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          <span className="text-sm font-medium">Loading your attempt history...</span>
        </div>
      ) : attempts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-card border border-surface-200 shadow-subtle space-y-3">
          <History className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No attempts recorded yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Take a mock test to track your syllabus mastery and review AI solutions anytime.
          </p>
          <button
            type="button"
            onClick={onCreateQuiz}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-card transition shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Practice Test</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attempts.map((att) => {
            const pct = Math.round((att.score / att.total) * 100);

            let scoreBadgeColor = 'bg-red-50 text-red-700 border-red-200';
            if (pct >= 80) scoreBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (pct >= 60) scoreBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (pct >= 40) scoreBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={att.id}
                className="bg-white rounded-card border border-surface-200 shadow-subtle p-5 flex flex-col justify-between hover:border-primary-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {att.subject}
                    </span>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreBadgeColor}`}>
                      {att.score} / {att.total} ({pct}%)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {att.chapter || att.class_level}
                  </h3>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{att.class_level}</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(att.created_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleViewAttempt(att)}
                    className="px-3 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-card transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View AI Solutions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttemptToDelete(att)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition hover:bg-red-50"
                    title="Delete Attempt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {attemptToDelete && (
        <ConfirmModal
          isOpen={!!attemptToDelete}
          title="Delete Attempt Record"
          description={`Are you sure you want to delete the attempt for "${attemptToDelete.subject} - ${attemptToDelete.chapter}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setAttemptToDelete(null)}
          confirmText="Delete Record"
          isDanger={true}
        />
      )}
    </div>
  );
}

export default AttemptHistory;
