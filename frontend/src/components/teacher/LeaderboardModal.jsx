import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { X, Trophy, RotateCcw, Loader2, Users, Calendar, AlertCircle } from 'lucide-react';

export function LeaderboardModal({ isOpen, onClose, quizId, quizTitle }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (isOpen && quizId) {
      loadResponses();
    }
  }, [isOpen, quizId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Student Leaderboard</h3>
              <p className="text-xs text-gray-500 truncate max-w-sm sm:max-w-md">
                {quizTitle || 'Shared Assessment'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadResponses}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors hover:bg-surface-100"
              title="Refresh Leaderboard"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-xs font-medium">Fetching live student responses...</span>
            </div>
          ) : responses.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Users className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No submissions yet</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Share the test link with your students. Their scores will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="border border-surface-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 w-14 text-center">Rank</th>
                    <th className="py-3 px-3.5">Student Name</th>
                    <th className="py-3 px-3.5 text-center">Score</th>
                    <th className="py-3 px-3.5 text-center">Accuracy</th>
                    <th className="py-3 px-3.5 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {responses.map((resp, idx) => {
                    const pct = Math.round((resp.score / resp.total) * 100);
                    return (
                      <tr key={resp.id || idx} className="hover:bg-surface-50/70 transition-colors">
                        <td className="py-3.5 px-3.5 text-center font-bold text-gray-600">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-3.5 font-bold text-gray-900">
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
                        <td className="py-3.5 px-3.5 text-right text-gray-500">
                          {formatDate(resp.submitted_at)}
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
          <span>Total Submissions: <strong className="text-gray-900">{responses.length}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition-all shadow-sm"
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
