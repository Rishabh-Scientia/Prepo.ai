import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import QuestionCard from './QuestionCard';
import QuestionPalette from './QuestionPalette';
import LoadingModal from '../common/LoadingModal';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function QuizAttempt({
  quizData, // { session_id, questions, config }
  onSubmit,
  onExit,
  isEvaluating,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const autoSubmittedRef = useRef(false);

  const timeLimitMinutes = quizData?.config?.time_limit_minutes;
  const totalAllowedSeconds = timeLimitMinutes ? timeLimitMinutes * 60 : null;
  const remainingSeconds = totalAllowedSeconds !== null ? Math.max(0, totalAllowedSeconds - secondsElapsed) : null;

  // Restore saved answers from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`prepo_attempt_${quizData.session_id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
        if (parsed.secondsElapsed) setSecondsElapsed(parsed.secondsElapsed);
      }
    } catch {
      // ignore
    }
  }, [quizData.session_id]);

  // Live Timer — uninterrupted counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [quizData.session_id]);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionIndex };
      try {
        localStorage.setItem(
          `prepo_attempt_${quizData.session_id}`,
          JSON.stringify({
            selectedAnswers: updated,
            secondsElapsed,
          })
        );
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleScrollToQuestion = (questionId) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinalSubmit = () => {
    setShowSubmitModal(false);
    
    // Transform answers for backend schema — send actual option text so matching is 100% accurate
    const formattedAnswers = quizData.questions.map((q, idx) => {
      const qId = q.id || q.question_id || `q${idx + 1}`;
      const optIdx = selectedAnswers[qId] !== undefined 
        ? selectedAnswers[qId] 
        : (selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : undefined);

      const selected_option = (optIdx !== undefined && q.options && q.options[optIdx] !== undefined)
        ? String(q.options[optIdx])
        : (optIdx !== undefined && OPTION_LETTERS[optIdx] ? OPTION_LETTERS[optIdx] : '');

      return {
        question_id: String(qId),
        selected_option: selected_option || '',
      };
    });

    localStorage.removeItem(`prepo_attempt_${quizData.session_id}`);
    onSubmit(quizData.session_id, formattedAnswers, secondsElapsed);
  };

  // Auto-Submit on Timeout
  useEffect(() => {
    if (!timeLimitMinutes || autoSubmittedRef.current || isEvaluating) return;

    if (remainingSeconds !== null && remainingSeconds <= 0) {
      autoSubmittedRef.current = true;
      handleFinalSubmit();
    }
  }, [remainingSeconds, timeLimitMinutes, isEvaluating]);

  const questions = quizData?.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn pb-24">
      
      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-surface-200 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-subtle mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              {quizData.config?.subject || 'Practice Test'}
            </span>
            <span className="text-xs text-gray-500 truncate hidden sm:inline">
              {quizData.config?.chapter || quizData.config?.class_level}
            </span>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-3">
          {timeLimitMinutes ? (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-card text-xs font-bold border transition ${
              remainingSeconds <= 60
                ? 'bg-red-50 border-red-300 text-red-700 animate-pulse ring-1 ring-red-400'
                : remainingSeconds <= 300
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-surface-100 border-surface-200 text-gray-700'
            }`}>
              <Clock className={`w-3.5 h-3.5 ${
                remainingSeconds <= 60 ? 'text-red-600' : remainingSeconds <= 300 ? 'text-amber-600' : 'text-primary-600'
              }`} />
              <span className="font-mono">{formatTime(remainingSeconds)}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 hidden sm:inline">left</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-100 border border-surface-200 rounded-card text-xs font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            disabled={isEvaluating}
            className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-card transition shadow-sm flex items-center gap-1.5"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Grading...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timeout Warning Banner (< 1 min) */}
      {timeLimitMinutes && remainingSeconds !== null && remainingSeconds <= 60 && remainingSeconds > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between gap-2 animate-pulse shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Less than 1 minute remaining! Assessment will automatically submit when time reaches 00:00.</span>
          </div>
          <span className="font-mono font-extrabold text-sm">{remainingSeconds}s</span>
        </div>
      )}

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Questions List */}
        <div className="lg:col-span-3 space-y-6">
          {questions.map((question, idx) => (
            <QuestionCard
              key={question.id || idx}
              question={question}
              index={idx}
              selectedOption={selectedAnswers[question.id]}
              onSelectOption={handleSelectOption}
            />
          ))}

          {/* Bottom Submit Trigger */}
          <div className="p-6 bg-white rounded-card border border-surface-200 text-center shadow-subtle">
            <h4 className="text-sm font-bold text-gray-900">Finished answering all questions?</h4>
            <p className="text-xs text-gray-500 mt-1">
              You have answered {answeredCount} out of {questions.length} questions.
            </p>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              disabled={isEvaluating}
              className="mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-card transition shadow-sm inline-flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Assessment</span>
            </button>
          </div>
        </div>

        {/* Sidebar Palette */}
        <div className="hidden lg:block sticky top-32 space-y-4">
          <QuestionPalette
            questions={questions}
            selectedAnswers={selectedAnswers}
            onSelectQuestion={handleScrollToQuestion}
          />

          <div className="bg-surface-50 rounded-card border border-surface-200 p-4 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-primary-600"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-surface-100 border border-surface-300"></span>
              <span>Unanswered ({unansweredCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowSubmitModal(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-200 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center tracking-tight">Ready to Submit?</h3>
            
            <div className="my-5 p-4 bg-surface-50 rounded-xl border border-surface-200 space-y-2.5 text-xs">
              <div className="flex justify-between font-medium text-gray-700">
                <span>Total Questions:</span>
                <span className="font-bold text-gray-900">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Answered Questions:</span>
                <span>{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Unanswered Questions:</span>
                  <span>{unansweredCount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 pt-2 border-t border-surface-200 font-medium">
                <span>Time Taken:</span>
                <span className="font-mono font-bold text-gray-800">{formatTime(secondsElapsed)}</span>
              </div>
              {timeLimitMinutes && remainingSeconds !== null && (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>Time Remaining:</span>
                  <span className="font-mono">{formatTime(remainingSeconds)}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You have unattempted questions. They will be marked as incorrect.</span>
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition shadow-sm"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── GRADING / EVALUATION LOADING POPUP ── */}
      <LoadingModal
        isOpen={isEvaluating}
        type="evaluate"
        title="Grading Your Assessment"
        subtitle={`Evaluating ${answeredCount} of ${questions.length} questions for ${quizData?.config?.subject || 'Practice Test'} with 4-part AI reasoning...`}
      />
    </div>
  );
}

export default QuizAttempt;
