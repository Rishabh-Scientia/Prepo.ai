import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import ExplanationCard from '../explanations/ExplanationCard';
import { 
  X, 
  Trophy, 
  RotateCcw, 
  Loader2, 
  Users, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  FileCheck
} from 'lucide-react';

export function LeaderboardModal({ isOpen, onClose, quizId, quizTitle }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const [inspectingStudent, setInspectingStudent] = useState(null);

  const loadResponses = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.getQuizResponses(quizId);
      if (data && data.responses) {
        // Sort highest score first
        const sorted = [...data.responses].sort((a, b) => (b.score / b.total) - (a.score / a.total));
        setResponses(sorted);
      } else {
        setResponses([]);
      }
    } catch (err) {
      setError(err.message || 'Could not load student responses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedMockResponses = async () => {
    if (!quizId) return;
    try {
      setSeeding(true);
      setError('');
      await api.seedMockResponses(quizId);
      await loadResponses();
    } catch (err) {
      setError(err.message || 'Failed to simulate mock student responses.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (isOpen && quizId) {
      setInspectingStudent(null);
      loadResponses();
    }
  }, [isOpen, quizId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (inspectingStudent) {
          setInspectingStudent(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectingStudent, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

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

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-100 flex items-center justify-between">
          {inspectingStudent ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-700 transition flex items-center gap-1 text-xs font-bold"
                title="Back to Leaderboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-gray-900">
                    {inspectingStudent.student_name || 'Student Submission'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                    {inspectingStudent.score} / {inspectingStudent.total} ({Math.round((inspectingStudent.score / inspectingStudent.total) * 100)}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-md">
                  Submitted {formatDate(inspectingStudent.submitted_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Student Responses & Rankings</h3>
                <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-md">
                  {quizTitle || 'Classroom Assessment'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!inspectingStudent && (
              <>
                <button
                  type="button"
                  onClick={handleSeedMockResponses}
                  disabled={seeding || loading}
                  className="px-2.5 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                  title="Add 4 simulated student responses"
                >
                  {seeding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  )}
                  <span className="hidden sm:inline">+4 AI Demo</span>
                </button>
                <button
                  onClick={loadResponses}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors hover:bg-surface-100"
                  title="Refresh Submissions"
                >
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-surface-50/40">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-xs font-medium">Fetching student submissions...</span>
            </div>
          ) : inspectingStudent ? (
            /* ── STUDENT DETAILED RESPONSE INSPECTOR VIEW ── */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-white rounded-xl border border-surface-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Showing answer sheet and 4-part AI reasoning for <strong>{inspectingStudent.student_name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ {inspectingStudent.score} Correct
                  </span>
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    ✕ {inspectingStudent.total - inspectingStudent.score} Incorrect
                  </span>
                </div>
              </div>

              {/* Questions Breakdown */}
              {Array.isArray(inspectingStudent.evaluation_results) && inspectingStudent.evaluation_results.length > 0 ? (
                <div className="space-y-4">
                  {inspectingStudent.evaluation_results.map((res, idx) => (
                    <ExplanationCard key={idx} result={res} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-surface-200 text-gray-500 space-y-2">
                  <p className="text-sm font-bold text-gray-700">Detailed question log unavailable for this attempt</p>
                  <p className="text-xs text-gray-400">Total Score: {inspectingStudent.score} / {inspectingStudent.total}</p>
                </div>
              )}
            </div>
          ) : responses.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 text-gray-400 flex items-center justify-center mx-auto border border-surface-200">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">No student submissions yet</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Share the test link with your class, or click below to simulate 4 AI student responses to test the response viewer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedMockResponses}
                disabled={seeding}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold rounded-xl transition shadow-sm inline-flex items-center gap-2 active:scale-95"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Simulating Submissions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simulate 4 AI Student Responses</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ── SUBMISSIONS TABLE ── */
            <div className="border border-surface-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">Rank</th>
                    <th className="py-3 px-3.5">Student Name</th>
                    <th className="py-3 px-3.5 text-center">Score</th>
                    <th className="py-3 px-3.5 text-center">Accuracy</th>
                    <th className="py-3 px-3.5 text-right hidden sm:table-cell">Submitted At</th>
                    <th className="py-3 px-3.5 text-right">Responses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {responses.map((resp, idx) => {
                    const pct = Math.round((resp.score / resp.total) * 100);
                    return (
                      <tr 
                        key={resp.id || idx} 
                        onClick={() => setInspectingStudent(resp)}
                        className="hover:bg-primary-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3 text-center font-bold text-gray-600">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-3.5 font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {resp.student_name || 'Anonymous Student'}
                        </td>
                        <td className="py-3.5 px-3.5 text-center font-mono font-bold text-gray-800">
                          {resp.score} / {resp.total}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              pct >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pct >= 50
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right text-gray-500 hidden sm:table-cell">
                          {formatDate(resp.submitted_at)}
                        </td>
                        <td className="py-3.5 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingStudent(resp);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-50 px-6 py-4 border-t border-surface-200 flex items-center justify-between text-xs text-gray-500">
          {inspectingStudent ? (
            <button
              type="button"
              onClick={() => setInspectingStudent(null)}
              className="px-3.5 py-1.5 font-bold text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Submissions</span>
            </button>
          ) : (
            <span>Total Submissions: <strong className="text-gray-900">{responses.length}</strong></span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LeaderboardModal;

