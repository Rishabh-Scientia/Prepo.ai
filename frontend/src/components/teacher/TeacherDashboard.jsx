import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LeaderboardModal from './LeaderboardModal';
import ShareQuizModal from './ShareQuizModal';
import ConfirmModal from '../common/ConfirmModal';
import { 
  Share2, 
  Trophy, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  Layers, 
  Loader2, 
  PlusCircle, 
  AlertCircle 
} from 'lucide-react';

export function TeacherDashboard({ onCreateQuiz, onShowToast }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedLeaderboardQuiz, setSelectedLeaderboardQuiz] = useState(null);
  const [selectedShareQuizId, setSelectedShareQuizId] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTeacherQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTeacherSharedQuizzes();
      if (data && data.shared_quizzes) {
        setQuizzes(data.shared_quizzes);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      setError(err.message || 'Could not load your shared quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherQuizzes();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    const targetId = quizToDelete.id;
    setDeletingId(targetId);
    try {
      await api.deleteSharedQuiz(targetId);
      setQuizzes((prev) => prev.filter((q) => q.id !== targetId));
      if (onShowToast) onShowToast('Shared quiz deleted successfully', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Could not delete quiz', 'error');
    } finally {
      setQuizToDelete(null);
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
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn pb-20">
      
      {/* ── HEADER ── */}
      <div className="bg-white rounded-card border border-surface-200 shadow-subtle p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary-600" />
            Teacher Shared Quizzes & Leaderboards
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage links shared with students and view instant grading responses
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateQuiz}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-card transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create & Share New Quiz</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── QUIZZES LIST ── */}
      {loading ? (
        <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          <span className="text-sm font-medium">Loading your shared quizzes...</span>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-card border border-surface-200 shadow-subtle space-y-3">
          <Share2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No shared quizzes yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Generate any quiz and click <strong>"Share with Students"</strong> to create a unique test link for your classroom.
          </p>
          <button
            type="button"
            onClick={onCreateQuiz}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-card transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate First Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : '?';

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-card border border-surface-200 shadow-subtle p-5 flex flex-col justify-between hover:border-primary-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {quiz.subject}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(quiz.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {quiz.chapter || quiz.class_level}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                    <span>{quiz.class_level}</span>
                    <span>•</span>
                    <span>{questionCount} Questions</span>
                    <span>•</span>
                    <span>{quiz.difficulty || 'Medium'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-surface-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedShareQuizId(quiz.id)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                      title="Share Quiz Link & Code"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLeaderboardQuiz(quiz)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition flex items-center gap-1.5 shadow-sm hover:shadow-md"
                      title="View Student Leaderboard"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Leaderboard</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuizToDelete(quiz)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    title="Delete Shared Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LEADERBOARD MODAL ── */}
      {selectedLeaderboardQuiz && (
        <LeaderboardModal
          isOpen={!!selectedLeaderboardQuiz}
          onClose={() => setSelectedLeaderboardQuiz(null)}
          quizId={selectedLeaderboardQuiz.id}
          quizTitle={`${selectedLeaderboardQuiz.subject} — ${selectedLeaderboardQuiz.chapter}`}
        />
      )}

      {/* ── SHARE MODAL ── */}
      {selectedShareQuizId && (
        <ShareQuizModal
          isOpen={!!selectedShareQuizId}
          onClose={() => setSelectedShareQuizId(null)}
          sharedQuizId={selectedShareQuizId}
          onShowToast={onShowToast}
        />
      )}

      {/* ── CONFIRM DELETE MODAL ── */}
      {quizToDelete && (
        <ConfirmModal
          isOpen={!!quizToDelete}
          title="Delete Shared Quiz?"
          description={`Are you sure you want to delete "${quizToDelete.subject} - ${quizToDelete.chapter}"? Students will no longer be able to submit responses.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setQuizToDelete(null)}
          confirmText="Delete Quiz"
          isDanger={true}
          isLoading={deletingId !== null}
        />
      )}
    </div>
  );
}

export default TeacherDashboard;
