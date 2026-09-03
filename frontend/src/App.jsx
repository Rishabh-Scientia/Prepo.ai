import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ErrorModal from './components/common/ErrorModal';
import SignInModal from './components/auth/SignInModal';
import SignUpModal from './components/auth/SignUpModal';
import BuyCreditsModal from './components/billing/BuyCreditsModal';
import CreditLimitModal from './components/billing/CreditLimitModal';
import ShareQuizModal from './components/teacher/ShareQuizModal';

import HeroSection from './components/home/HeroSection';
import QuizGenerator from './components/quiz/QuizGenerator';
import DocQuizGenerator from './components/quiz/DocQuizGenerator';
import QuizAttempt from './components/quiz/QuizAttempt';
import QuizResults from './components/quiz/QuizResults';
import UserProfile from './components/profile/UserProfile';
import StudentQuizEntry from './components/student/StudentQuizEntry';

import { Sparkles, FileText, ArrowLeft, Layers } from 'lucide-react';

export function App() {
  const { isLoggedIn, openSignIn, openCreditLimitModal, fetchCredits } = useAuth();

  // Navigation State: 'home' | 'config' | 'attempt' | 'results' | 'profile' | 'student'
  const [currentPage, setCurrentPage] = useState('home');
  const [profileTab, setProfileTab] = useState('history');
  const [configMode, setConfigMode] = useState('topic'); // 'topic' | 'doc'
  const [prefilledSubject, setPrefilledSubject] = useState(null);

  // Active Quiz State
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Student Shared Quiz ID from query string
  const [studentQuizId, setStudentQuizId] = useState(null);

  // Teacher Shared Quiz Modal State
  const [sharedQuizIdForModal, setSharedQuizIdForModal] = useState(null);

  // Global Toast & Error Modal
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAction, setLastAction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Check URL query parameters for ?quiz_id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get('quiz_id');
    if (qId) {
      setStudentQuizId(qId);
      setCurrentPage('student');
    }
  }, []);

  const handleNavigate = (page, tab = 'history') => {
    // Protected pages check
    if (['config', 'profile'].includes(page) && !isLoggedIn) {
      openSignIn();
      return;
    }

    if (page === 'profile') {
      setProfileTab(tab);
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Quiz Config from Hero
  const handleStartQuizFromHero = (mode = 'topic') => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }
    setConfigMode(mode);
    setPrefilledSubject(null);
    setCurrentPage('config');
  };

  // Quick subject chip clicked from Hero
  const handleSelectSubjectFromHero = (sub) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }
    setPrefilledSubject(sub);
    setConfigMode('topic');
    setCurrentPage('config');
  };

  // Topic Quiz Generation
  const handleGenerateTopicQuiz = async (config) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    try {
      setIsGenerating(true);
      setLastAction(() => () => handleGenerateTopicQuiz(config));

      const data = await api.generateQuiz(config);
      await fetchCredits();

      setActiveQuizData({
        session_id: data.session_id,
        questions: data.questions,
        config: {
          subject: config.subject,
          chapter: config.chapter,
          class_level: config.class_level,
          difficulty: config.difficulty,
          num_questions: config.num_questions,
        },
      });

      setCurrentPage('attempt');
    } catch (err) {
      if (err.isCreditLimit) {
        openCreditLimitModal();
      } else {
        setErrorMessage(err.message || 'Quiz generation failed.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Document Quiz Generation
  const handleGenerateDocQuiz = async (formData, filename) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    try {
      setIsGenerating(true);
      setLastAction(() => () => handleGenerateDocQuiz(formData, filename));

      const data = await api.generateQuizFromDoc(formData);
      await fetchCredits();

      setActiveQuizData({
        session_id: data.session_id,
        questions: data.questions,
        config: {
          subject: filename,
          chapter: 'Uploaded Document',
          class_level: 'Custom Document',
        },
      });

      setCurrentPage('attempt');
    } catch (err) {
      if (err.isCreditLimit) {
        openCreditLimitModal();
      } else {
        setErrorMessage(err.message || 'Document quiz generation failed.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async (sessionId, answers, timeElapsed) => {
    try {
      setIsEvaluating(true);
      setLastAction(() => () => handleSubmitQuiz(sessionId, answers, timeElapsed));

      const res = await api.evaluateQuiz(sessionId, answers);

      setEvaluationResults({
        score: res.score,
        total: res.total,
        results: res.results,
        config: activeQuizData?.config || {},
        timeElapsed,
      });

      setCurrentPage('results');
    } catch (err) {
      setErrorMessage(err.message || 'Could not evaluate answers.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Teacher Share Quiz Action
  const handleShareCurrentQuiz = async () => {
    if (!activeQuizData?.session_id) return;
    try {
      const res = await api.shareQuiz(activeQuizData.session_id);
      if (res && res.shared_quiz_id) {
        setSharedQuizIdForModal(res.shared_quiz_id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate share link.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-100 text-gray-800">
      
      {/* ── NAVBAR (Hidden in guest student test attempt) ── */}
      {currentPage !== 'student' && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      {/* ── MAIN BODY CONTENT ── */}
      <main className="flex-1">
        
        {/* 1. HOME PAGE */}
        {currentPage === 'home' && (
          <HeroSection
            onStartQuiz={handleStartQuizFromHero}
            onSelectSubject={handleSelectSubjectFromHero}
          />
        )}

        {/* 2. CONFIG PAGE */}
        {currentPage === 'config' && (
          <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
            
            {/* Mode Toggle (Topic vs Document) */}
            <div className="max-w-2xl mx-auto mb-6 flex items-center justify-center p-1 bg-surface-200/80 rounded-card border border-surface-300">
              <button
                type="button"
                onClick={() => setConfigMode('topic')}
                className={`flex-1 py-2 text-xs font-bold rounded-card transition flex items-center justify-center gap-2 ${
                  configMode === 'topic'
                    ? 'bg-white text-primary-700 shadow-subtle'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>Generate from Syllabus Topic</span>
              </button>

              <button
                type="button"
                onClick={() => setConfigMode('doc')}
                className={`flex-1 py-2 text-xs font-bold rounded-card transition flex items-center justify-center gap-2 ${
                  configMode === 'doc'
                    ? 'bg-white text-primary-700 shadow-subtle'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 text-primary-600" />
                <span>Generate from Document (PDF/Doc)</span>
              </button>
            </div>

            {configMode === 'topic' ? (
              <QuizGenerator
                initialValues={prefilledSubject}
                onGenerate={handleGenerateTopicQuiz}
                isLoading={isGenerating}
              />
            ) : (
              <DocQuizGenerator
                onGenerateFromDoc={handleGenerateDocQuiz}
                isLoading={isGenerating}
              />
            )}
          </div>
        )}

        {/* 3. ATTEMPT PAGE */}
        {currentPage === 'attempt' && activeQuizData && (
          <QuizAttempt
            quizData={activeQuizData}
            onSubmit={handleSubmitQuiz}
            onExit={() => setCurrentPage('home')}
            isEvaluating={isEvaluating}
          />
        )}

        {/* 4. RESULTS PAGE */}
        {currentPage === 'results' && evaluationResults && (
          <QuizResults
            resultsData={evaluationResults}
            onRetake={() => setCurrentPage('config')}
            onShareQuiz={isLoggedIn ? handleShareCurrentQuiz : null}
            onShowToast={showToast}
          />
        )}

        {/* 5. USER PROFILE & TEACHER DASHBOARD */}
        {currentPage === 'profile' && (
          <UserProfile
            initialTab={profileTab}
            onCreateQuiz={() => handleNavigate('config')}
            onShowToast={showToast}
          />
        )}

        {/* 6. GUEST STUDENT TEST MODE */}
        {currentPage === 'student' && studentQuizId && (
          <StudentQuizEntry
            quizId={studentQuizId}
            onExitToHome={() => {
              window.history.replaceState({}, '', '/');
              setStudentQuizId(null);
              setCurrentPage('home');
            }}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* ── FOOTER ── */}
      {currentPage === 'home' && <Footer />}

      {/* ── MODALS ── */}
      <SignInModal />
      <SignUpModal />
      <BuyCreditsModal onShowToast={showToast} />
      <CreditLimitModal />

      {sharedQuizIdForModal && (
        <ShareQuizModal
          isOpen={!!sharedQuizIdForModal}
          onClose={() => setSharedQuizIdForModal(null)}
          sharedQuizId={sharedQuizIdForModal}
          onShowToast={showToast}
        />
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage}
        onRetry={lastAction ? () => {
          const act = lastAction;
          setErrorMessage('');
          act();
        } : null}
        onClose={() => setErrorMessage('')}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}

export default App;
