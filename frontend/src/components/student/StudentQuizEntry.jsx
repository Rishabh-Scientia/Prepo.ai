import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import QuizAttempt from '../quiz/QuizAttempt';
import QuizResults from '../quiz/QuizResults';
import { User, BookOpen, Layers, Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export function StudentQuizEntry({ quizId, onExitToHome, onShowToast }) {
  const [quizInfo, setQuizInfo] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('entry'); // 'entry' | 'attempt' | 'results'
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    if (quizId) {
      loadQuizDetails();
    }
  }, [quizId]);

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
      setResultsData({
        score: res.score,
        total: res.total,
        results: res.results,
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

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="text-sm font-medium">Loading test from your instructor...</span>
      </div>
    );
  }

  if (error && !quizInfo) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-card border border-surface-200 text-center shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Quiz Not Available</h3>
        <p className="text-xs text-gray-600">{error}</p>
        <button
          onClick={onExitToHome}
          className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-card hover:bg-primary-700 transition"
        >
          Go to Prepo.ai Homepage
        </button>
      </div>
    );
  }

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
          },
        }}
        onSubmit={handleStudentSubmit}
        onExit={onExitToHome}
        isEvaluating={submitting}
      />
    );
  }

  if (step === 'results' && resultsData) {
    return (
      <QuizResults
        resultsData={resultsData}
        onRetake={onExitToHome}
        onShowToast={onShowToast}
      />
    );
  }

  // Entry Screen
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

      <div className="bg-surface-50 rounded-card border border-surface-200 p-4 mb-6 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-gray-400 block">Class / Level</span>
          <span className="font-bold text-gray-800 truncate block">{quizInfo?.class_level}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Questions</span>
          <span className="font-bold text-gray-800">{quizInfo?.questions?.length || 0} MCQs</span>
        </div>
        <div>
          <span className="text-gray-400 block">Difficulty</span>
          <span className="font-bold text-gray-800">{quizInfo?.difficulty || 'Medium'}</span>
        </div>
      </div>

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
