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
  Clock, 
  EyeOff, 
  Power, 
  Users, 
  Loader2, 
  PlusCircle, 
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Layers,
  X as XIcon,
  CheckCircle2
} from 'lucide-react';

export function TeacherDashboard({ onCreateQuiz, onShowToast }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedLeaderboardQuiz, setSelectedLeaderboardQuiz] = useState(null);
  const [selectedShareQuiz, setSelectedShareQuiz] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'closed'

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

  const handleToggleActive = async (quiz) => {
    const targetId = quiz.id;
    const currentActive = quiz.is_active !== false;
    const newActive = !currentActive;

    // Optimistic local update
    setQuizzes((prev) =>
      prev.map((q) => (q.id === targetId ? { ...q, is_active: newActive } : q))
    );
    setTogglingId(targetId);

    try {
      await api.updateSharedQuizSettings(targetId, { is_active: newActive });
      if (onShowToast) {
        onShowToast(
          newActive 
            ? 'Assessment is now active & accepting responses.' 
            : 'Submissions closed for this assessment.',
          'success'
        );
      }
    } catch (err) {
      // Revert state
      setQuizzes((prev) =>
        prev.map((q) => (q.id === targetId ? { ...q, is_active: currentActive } : q))
      );
      if (onShowToast) onShowToast(err.message || 'Failed to update test status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateQuizSettings = (quizId, newSettings) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, ...newSettings } : q))
    );
    setSelectedShareQuiz((prev) =>
      prev && prev.id === quizId ? { ...prev, ...newSettings } : prev
    );
  };

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

  // Filter calculations
  const availableClasses = Array.from(
    new Set(quizzes.map((q) => q.class_level).filter(Boolean))
  ).sort();

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (quiz.subject || '').toLowerCase().includes(q);
      const matchChap = (quiz.chapter || '').toLowerCase().includes(q);
      const matchClass = (quiz.class_level || '').toLowerCase().includes(q);
      if (!matchSub && !matchChap && !matchClass) return false;
    }

    if (selectedClass !== 'All') {
      if ((quiz.class_level || '') !== selectedClass) return false;
    }

    const isActive = quiz.is_active !== false;
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'closed' && isActive) return false;

    return true;
  });

  const totalSubmissions = quizzes.reduce((acc, q) => acc + (q.submission_count || 0), 0);
  const activeQuizzesCount = quizzes.filter((q) => q.is_active !== false).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn pb-20">
      
      {/* ── HEADER ── */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-primary-100">
            <Sparkles className="w-3 h-3 text-primary-600" />
            Teacher Classroom Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            Teacher Dashboard & Assessment Center
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
            Create class tests, set timers, track student submissions, and review real-time AI leaderboard analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateQuiz}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-primary-200" />
          <span>Create New Class Test</span>
        </button>
      </div>

      {/* ── QUICK METRICS CARDS ── */}
      {quizzes.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-200 shadow-xs text-center">
            <Layers className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{quizzes.length}</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-tight">Total Assessments</p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-200 shadow-xs text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{activeQuizzesCount}</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-tight">Accepting Responses</p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-200 shadow-xs text-center">
            <Users className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{totalSubmissions}</p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-tight">Total Submissions</p>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      {quizzes.length > 0 && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-xs p-3.5 mb-6 flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, chapter, or grade..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-surface-50 border border-surface-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class-wise Filter Dropdown & Status */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs font-semibold rounded-xl bg-surface-50 border border-surface-200 hover:border-surface-300 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition outline-none text-gray-800 cursor-pointer appearance-none"
              >
                <option value="All">All Classes & Grades</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Tabs */}
            <div className="p-1 bg-surface-100 rounded-xl border border-surface-200 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('closed')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'closed'
                    ? 'bg-gray-700 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Closed
              </button>
            </div>

            {/* Reset Filters button */}
            {(searchQuery || selectedClass !== 'All' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('All');
                  setStatusFilter('all');
                }}
                className="px-2.5 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-surface-200 transition shrink-0"
                title="Reset Filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

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
      ) : filteredQuizzes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-subtle space-y-3 animate-fadeIn">
          <Search className="w-9 h-9 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-800">No quizzes match your search filters</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query, class grade, or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('All');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-gray-800 text-xs font-bold rounded-xl border border-surface-300 transition shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => {
            const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : '?';
            const isActive = quiz.is_active !== false;
            const hasTimer = Boolean(quiz.time_limit_minutes && quiz.time_limit_minutes > 0);
            const isScoreHidden = quiz.show_results === false;

            return (
              <div
                key={quiz.id}
                className={`bg-white rounded-card border shadow-subtle p-5 flex flex-col justify-between transition ${
                  isActive ? 'border-surface-200 hover:border-primary-300' : 'border-gray-200 bg-gray-50/60 opacity-90'
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        {quiz.subject}
                      </span>
                      {/* Active Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        <span>{isActive ? 'Accepting' : 'Closed'}</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(quiz.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {quiz.chapter || quiz.class_level}
                  </h3>

                  {/* Meta Tags & Badges */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="bg-surface-100 px-2 py-0.5 rounded font-medium text-gray-600 border border-surface-200">
                      {quiz.class_level}
                    </span>
                    <span className="bg-surface-100 px-2 py-0.5 rounded font-medium text-gray-600 border border-surface-200">
                      {quiz.difficulty || 'Medium'}
                    </span>
                    {hasTimer && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{quiz.time_limit_minutes}m Limit</span>
                      </span>
                    )}
                    {isScoreHidden && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-purple-600" />
                        <span>Scores Hidden</span>
                      </span>
                    )}
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{quiz.submission_count || 0} Submissions</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-4 pt-3.5 border-t border-surface-100 space-y-2">
                  {/* Primary Row: Share & Leaderboard */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!isActive}
                      onClick={() => isActive && setSelectedShareQuiz(quiz)}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 shadow-2xs ${
                        isActive
                          ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200 cursor-pointer active:scale-98'
                          : 'text-gray-400 bg-gray-100/80 border-gray-200 opacity-40 cursor-not-allowed pointer-events-none'
                      }`}
                      title={isActive ? "Share Quiz Link & Controls" : "Test disabled — enable responses to share"}
                    >
                      <Share2 className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLeaderboardQuiz(quiz)}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-sm active:scale-98"
                      title="View Student Responses & Leaderboard"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Leaderboard</span>
                      {(quiz.submission_count || 0) > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-extrabold">
                          {quiz.submission_count}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Secondary Controls: Status Toggle & Delete */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(quiz)}
                      disabled={togglingId === quiz.id}
                      title={isActive ? 'Disable/Close Submissions' : 'Enable/Accept Submissions'}
                      className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {togglingId === quiz.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className={`w-3 h-3 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                      )}
                      <span>{isActive ? 'Accepting Responses' : 'Submissions Closed'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizToDelete(quiz)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100 shrink-0"
                      title="Delete Shared Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* ── SHARE & SETTINGS MODAL ── */}
      {selectedShareQuiz && (
        <ShareQuizModal
          isOpen={!!selectedShareQuiz}
          onClose={() => setSelectedShareQuiz(null)}
          sharedQuizId={selectedShareQuiz.id}
          initialSettings={selectedShareQuiz}
          onUpdateSettings={handleUpdateQuizSettings}
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
