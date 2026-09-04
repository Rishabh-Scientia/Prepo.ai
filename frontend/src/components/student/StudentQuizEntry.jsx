import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import QuizAttempt from '../quiz/QuizAttempt';
import QuizResults from '../quiz/QuizResults';
import { 
  User, 
  BookOpen, 
  Layers, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Lock, 
  CheckCircle2, 
  X, 
  EyeOff 
} from 'lucide-react';

export function StudentQuizEntry({ quizId, onExitToHome, onShowToast }) {
  const [quizInfo, setQuizInfo] = useState(null);
  const [studentName, setStudentName] = useState(() => {
    try {
      return sessionStorage.getItem(`prepo_student_name_${quizId}`) || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`prepo_student_step_${quizId}`);
      if (saved === 'attempt') return 'attempt';
      return 'entry';
    } catch {
      return 'entry';
    }
  }); // 'entry' | 'attempt' | 'results' | 'results_hidden'
  const [resultsData, setResultsData] = useState(null);
  const [isClosedWindow, setIsClosedWindow] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuizDetails();
    }
  }, [quizId]);

  useEffect(() => {
    try {
      if (quizId && studentName) {
        sessionStorage.setItem(`prepo_student_name_${quizId}`, studentName);
      }
    } catch {}
  }, [quizId, studentName]);

  useEffect(() => {
    try {
      if (quizId) {
        sessionStorage.setItem(`prepo_student_step_${quizId}`, step);
      }
    } catch {}
  }, [quizId, step]);

  // Protect student against accidental refresh during ongoing assessment
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step === 'attempt') {
        e.preventDefault();
        e.returnValue = 'You have a test in progress. Are you sure you want to reload or leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  const loadQuizDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSharedQuiz(quizId);
      setQuizInfo(data);
    } catch (err) {
      setError(err.message || 'Shared quiz was not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAssessment = () => {
    try {
      window.close();
    } catch {}
    setIsClosedWindow(true);
  };

  const handleStartTest = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your full name to start the test.');
      return;
    }
    setError('');
    setStep('attempt');
  };

  const handleStudentSubmit = async (sessionId, answers, timeElapsed) => {
    try {
      setSubmitting(true);
      const res = await api.submitSharedQuiz(quizId, studentName.trim(), answers);

      // Clean up stored attempt state
      try {
        sessionStorage.removeItem(`prepo_student_step_${quizId}`);
      } catch {}

      if (res && res.score_hidden) {
        setResultsData({
          score_hidden: true,
          total: res.total || quizInfo?.questions?.length || 0,
          studentName: studentName.trim(),
          timeElapsed,
          message: res.message || 'Your responses have been recorded successfully.',
        });
        setStep('results_hidden');
        return;
      }

      setResultsData({
        score: res.score,
        total: res.total,
        results: res.evaluation_results,
        config: {
          subject: quizInfo?.subject,
          chapter: quizInfo?.chapter,
          class_level: quizInfo?.class_level,
          difficulty: quizInfo?.difficulty,
        },
        timeElapsed,
      });
      setStep('results');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to submit test.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Peaceful Closed Tab screen
  if (isClosedWindow) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-surface-200 text-center shadow-elevated space-y-4 animate-scaleUp">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Assessment Complete</h3>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
          Your test responses have been successfully recorded. You can now close this browser window or tab.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center gap-3 animate-fadeIn">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="text-sm font-medium">Loading assessment from your instructor...</span>
      </div>
    );
  }

  // Quiz Not Found / Expired Error
  if (error && !quizInfo) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-card border border-surface-200 text-center shadow-subtle space-y-4 animate-scaleUp">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Quiz Not Available</h3>
        <p className="text-xs text-gray-600">{error}</p>
        <button
          type="button"
          onClick={handleCloseAssessment}
          className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-card hover:bg-black transition flex items-center gap-1.5 mx-auto"
        >
          <X className="w-4 h-4" />
          <span>Close Window</span>
        </button>
      </div>
    );
  }

  // Instructor Closed / Disabled Assessment
  if (quizInfo && quizInfo.is_active === false) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-card border border-amber-200 text-center shadow-elevated space-y-5 animate-scaleUp relative">
        <button
          type="button"
          onClick={handleCloseAssessment}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-surface-100 transition"
          title="Close Assessment"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Submissions Closed
          </span>
          <h2 className="text-xl font-extrabold text-gray-900">
            Sorry, this test is no longer taking responses
          </h2>
          <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
            The instructor has closed or disabled submissions for this assessment. If you believe this is a mistake, please contact your teacher.
          </p>
        </div>

        {/* Assessment Card Summary */}
        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Subject:</span>
            <span className="font-bold text-gray-800">{quizInfo.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Chapter:</span>
            <span className="font-bold text-gray-800">{quizInfo.chapter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Instructor:</span>
            <span className="font-bold text-gray-800">{quizInfo.teacher_name || 'Teacher'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCloseAssessment}
          className="w-full py-2.5 px-4 bg-surface-100 hover:bg-surface-200 text-gray-800 font-bold text-xs rounded-xl border border-surface-300 transition flex items-center justify-center gap-2 shadow-xs"
        >
          <X className="w-4 h-4 text-gray-600" />
          <span>Close Assessment Window</span>
        </button>
      </div>
    );
  }

  // Active Quiz Attempt
  if (step === 'attempt' && quizInfo) {
    return (
      <QuizAttempt
        quizData={{
          session_id: quizId,
          questions: quizInfo.questions || [],
          config: {
            subject: quizInfo.subject,
            chapter: quizInfo.chapter,
            class_level: quizInfo.class_level,
            time_limit_minutes: quizInfo.time_limit_minutes,
          },
        }}
        onSubmit={handleStudentSubmit}
        onExit={handleCloseAssessment}
        isEvaluating={submitting}
      />
    );
  }

  // Normal Scorecard Results Screen
  if (step === 'results' && resultsData) {
    return (
      <QuizResults
        resultsData={resultsData}
        isStudentMode={true}
        onCloseAssessment={handleCloseAssessment}
        onShowToast={onShowToast}
      />
    );
  }

  // Private / Hidden Scorecard Confirmation Screen
  if (step === 'results_hidden' && resultsData) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-card border border-surface-200 shadow-elevated text-center space-y-6 animate-scaleUp relative">
        <button
          type="button"
          onClick={handleCloseAssessment}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-surface-100 transition"
          title="Close Assessment"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Submission Recorded
          </span>
          <h2 className="text-xl font-extrabold text-gray-900">
            Assessment Submitted Successfully!
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
            Great job, <strong>{resultsData.studentName}</strong>! Your answers have been recorded in your teacher’s gradebook.
          </p>
        </div>

        {/* Private Results Note */}
        <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 text-xs text-purple-900 text-left flex items-start gap-3">
          <EyeOff className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Scores & Solutions Kept Private</div>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              Your instructor has chosen to keep scores and step-by-step solutions private. Your teacher will announce or share the results directly.
            </p>
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Student Name:</span>
            <span className="font-bold text-gray-800">{resultsData.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Questions Submitted:</span>
            <span className="font-bold text-gray-800">{resultsData.total} Questions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Time Taken:</span>
            <span className="font-bold text-gray-800">{formatTime(resultsData.timeElapsed || 0)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCloseAssessment}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
        >
          <X className="w-4 h-4" />
          <span>Close Assessment Window</span>
        </button>
      </div>
    );
  }

  // Student Entry Screen
  const hasTimer = Boolean(quizInfo?.time_limit_minutes && quizInfo?.time_limit_minutes > 0);
  const isScoreHidden = quizInfo?.show_results === false;

  return (
    <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 bg-white rounded-card border border-surface-200 shadow-elevated animate-scaleUp">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-bold text-primary-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Test Mode</span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">{quizInfo?.subject}</h2>
        <p className="text-sm font-semibold text-gray-600 mt-1">{quizInfo?.chapter}</p>
        <p className="text-xs text-gray-400 mt-0.5">Created by {quizInfo?.teacher_name || 'Your Teacher'}</p>
      </div>

      {/* Test Meta Grid */}
      <div className={`bg-surface-50 rounded-card border border-surface-200 p-4 mb-5 grid gap-2 text-center text-xs ${
        hasTimer ? 'grid-cols-4' : 'grid-cols-3'
      }`}>
        <div>
          <span className="text-gray-400 block text-[10px]">Class / Level</span>
          <span className="font-bold text-gray-800 truncate block">{quizInfo?.class_level}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">Questions</span>
          <span className="font-bold text-gray-800">{quizInfo?.questions?.length || 0} MCQs</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">Difficulty</span>
          <span className="font-bold text-gray-800">{quizInfo?.difficulty || 'Medium'}</span>
        </div>
        {hasTimer && (
          <div className="bg-amber-50 rounded-lg p-1 border border-amber-200">
            <span className="text-amber-700 block text-[10px] font-bold">Time Limit</span>
            <span className="font-extrabold text-amber-900 flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3 text-amber-600" />
              {quizInfo.time_limit_minutes}m
            </span>
          </div>
        )}
      </div>

      {/* Timer Notice */}
      {hasTimer && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong>Timed Assessment:</strong> You will have <strong>{quizInfo.time_limit_minutes} minutes</strong>. The countdown begins as soon as you click <em>Start Assessment</em>. When time runs out, your answers will auto-submit.
          </div>
        </div>
      )}

      {/* Score Hidden Notice */}
      {isScoreHidden && (
        <div className="mb-5 p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
          <EyeOff className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong>Instructor Policy:</strong> Test scores and solutions are kept private for this test and will be submitted directly to your teacher.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-card bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleStartTest} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Your Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              required
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-surface-300 rounded-card focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-card transition shadow-sm flex items-center justify-center gap-2"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default StudentQuizEntry;
