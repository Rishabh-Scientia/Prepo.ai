import React, { useState, useEffect } from 'react';
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-card border border-surface-200 shadow-elevated w-full max-w-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-card bg-amber-50 text-amber-700 flex items-center justify-center">
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
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded transition hover:bg-surface-100"
              title="Refresh Leaderboard"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-xs">Fetching live student responses...</span>
            </div>
          ) : responses.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">No submissions yet</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Share the test link with your students. Their scores will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="border border-surface-200 rounded-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-center">Accuracy</th>
                    <th className="py-2.5 px-3 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {responses.map((resp, idx) => {
                    const pct = Math.round((resp.score / resp.total) * 100);
                    return (
                      <tr key={resp.id || idx} className="hover:bg-surface-50/70 transition">
                        <td className="py-3 px-3 text-center font-bold text-gray-500">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900">
                          {resp.student_name || 'Anonymous Student'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-gray-800">
                          {resp.score} / {resp.total}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              pct >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pct >= 50
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500">
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
        <div className="bg-surface-50 px-5 py-3 border-t border-surface-200 flex items-center justify-between text-xs text-gray-500">
          <span>Total Submissions: <strong>{responses.length}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 font-bold text-gray-700 bg-white border border-surface-300 rounded-card hover:bg-surface-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
