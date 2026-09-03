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
  ArrowRight,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';

export function AttemptHistory({ onCreateQuiz, onShowToast }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected attempt for detailed review
  const [selectedAttemptData, setSelectedAttemptData] = useState(null);
  const [attemptToDelete, setAttemptToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    const deleteId = attemptToDelete.id;
    setDeletingId(deleteId);
    try {
      await api.deleteUserAttempt(deleteId);
      setAttempts((prev) => prev.filter((a) => a.id !== deleteId));
      if (onShowToast) onShowToast('Attempt deleted successfully', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Could not delete attempt', 'error');
    } finally {
      setAttemptToDelete(null);
      setDeletingId(null);
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

  const getScoreGradient = (pct) => {
    if (pct >= 80) return 'from-emerald-500 to-emerald-600';
    if (pct >= 60) return 'from-blue-500 to-blue-600';
    if (pct >= 40) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  const getScoreLabel = (pct) => {
    if (pct >= 90) return 'Excellent';
    if (pct >= 75) return 'Great';
    if (pct >= 50) return 'Good';
    return 'Needs Practice';
  };

  if (selectedAttemptData) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedAttemptData(null)}
          className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
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
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
          <span className="text-sm font-medium">Loading your attempt history...</span>
        </div>
      ) : attempts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-surface-200 shadow-subtle space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No attempts recorded yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Take a mock test to track your syllabus mastery and review AI solutions anytime.
          </p>
          <button
            type="button"
            onClick={onCreateQuiz}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Practice Test</span>
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
              <BookOpen className="w-5 h-5 text-primary-500 mx-auto mb-1.5" />
              <p className="text-2xl font-extrabold text-gray-900">{attempts.length}</p>
              <p className="text-[11px] text-gray-500 font-medium">Total Tests</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-2xl font-extrabold text-gray-900">
                {Math.round(attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / attempts.length)}%
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Avg. Score</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
              <Award className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
              <p className="text-2xl font-extrabold text-gray-900">
                {Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)))}%
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Best Score</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
              <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1.5" />
              <p className="text-2xl font-extrabold text-gray-900">
                {attempts.reduce((acc, a) => acc + a.total, 0)}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Questions Solved</p>
            </div>
          </div>

          {/* Attempt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attempts.map((att) => {
              const pct = Math.round((att.score / att.total) * 100);
              const isDeleting = deletingId === att.id;

              return (
                <div
                  key={att.id}
                  className={`bg-white rounded-xl border border-surface-200 shadow-subtle overflow-hidden hover:shadow-elevated hover:border-primary-200 transition-all group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Card Header with Score Bar */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                            {att.subject}
                          </span>
                          {att.difficulty && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-surface-100 px-2 py-0.5 rounded-full">
                              {att.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                          {att.chapter || att.class_level || 'Practice Quiz'}
                        </h3>
                      </div>

                      {/* Circular Score Badge */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreGradient(pct)} flex flex-col items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-lg font-extrabold text-white leading-none">{pct}%</span>
                        <span className="text-[8px] font-bold text-white/80 uppercase">{att.score}/{att.total}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(pct)} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="px-5 py-2 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-medium">{att.class_level}</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(att.created_at)}
                    </span>
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 py-3 border-t border-surface-100 bg-surface-50/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleViewAttempt(att)}
                      className="px-4 py-2 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all flex items-center gap-2 hover:shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View AI Solutions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttemptToDelete(att)}
                      className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition-all hover:bg-rose-50 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete Attempt"
                      aria-label="Delete Attempt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {attemptToDelete && (
        <ConfirmModal
          isOpen={!!attemptToDelete}
          title="Delete Test Attempt?"
          description={`Are you sure you want to delete your past attempt for "${attemptToDelete.subject}${attemptToDelete.chapter ? ` — ${attemptToDelete.chapter}` : ''}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setAttemptToDelete(null)}
          confirmText="Delete Record"
          isDanger={true}
          isLoading={deletingId !== null}
        />
      )}
    </div>
  );
}

export default AttemptHistory;
