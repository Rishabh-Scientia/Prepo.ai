import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Components
import Navbar from './components/common/Navbar';
import MobileBottomNav from './components/common/MobileBottomNav';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ErrorModal from './components/common/ErrorModal';
import LoadingModal from './components/common/LoadingModal';
import SignInModal from './components/auth/SignInModal';
import SignUpModal from './components/auth/SignUpModal';
import BuyCreditsModal from './components/billing/BuyCreditsModal';
import CreditLimitModal from './components/billing/CreditLimitModal';
import ShareQuizModal from './components/teacher/ShareQuizModal';
import TeacherQuizSuccessModal from './components/teacher/TeacherQuizSuccessModal';

import HeroSection from './components/home/HeroSection';
import QuizGenerator from './components/quiz/QuizGenerator';
import DocQuizGenerator from './components/quiz/DocQuizGenerator';
import QuizAttempt from './components/quiz/QuizAttempt';
import QuizResults from './components/quiz/QuizResults';
import UserProfile from './components/profile/UserProfile';
import StudentQuizEntry from './components/student/StudentQuizEntry';

import { Sparkles, FileText, ArrowLeft, Layers } from 'lucide-react';

export function App() {
  const { 
    isLoggedIn, 
    openSignIn, 
    openBuyCreditsModal, 
    openCreditLimitModal, 
    fetchCredits, 
    credits 
  } = useAuth();

  // Navigation State: 'home' | 'config' | 'attempt' | 'results' | 'profile' | 'student'
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quiz_id')) return 'student';

      const savedPage = sessionStorage.getItem('prepo_current_page');
      if (savedPage === 'attempt') {
        const savedQuiz = localStorage.getItem('prepo_active_quiz_data');
        if (savedQuiz) {
          try {
            const parsed = JSON.parse(savedQuiz);
            if (parsed && parsed.questions && parsed.questions.length > 0) {
              return 'attempt';
            }
          } catch {}
        }
        return 'home';
      }
      if (savedPage === 'results') {
        const savedResults = localStorage.getItem('prepo_evaluation_results');
        if (savedResults) return 'results';
        return 'home';
      }
      return savedPage || 'home';
    } catch {
      return 'home';
    }
  });

  const [profileTab, setProfileTab] = useState(() => {
    try {
      return sessionStorage.getItem('prepo_profile_tab') || 'history';
    } catch {
      return 'history';
    }
  });

  const [configMode, setConfigMode] = useState(() => {
    try {
      return sessionStorage.getItem('prepo_config_mode') || 'topic';
    } catch {
      return 'topic';
    }
  });
  const [prefilledSubject, setPrefilledSubject] = useState(null);

  // Dual User Mode: 'student' | 'teacher'
  const [userMode, setUserMode] = useState(() => {
    try {
      return localStorage.getItem('prepo_user_mode') || 'student';
    } catch {
      return 'student';
    }
  });

  // Active Quiz State (persisted so reload never loses spent credits / generated questions)
  const [activeQuizData, setActiveQuizData] = useState(() => {
    try {
      const saved = localStorage.getItem('prepo_active_quiz_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [evaluationResults, setEvaluationResults] = useState(() => {
    try {
      const saved = localStorage.getItem('prepo_evaluation_results');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMeta, setGeneratingMeta] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Student Shared Quiz ID from query string
  const [studentQuizId, setStudentQuizId] = useState(null);

  // Teacher Shared Quiz Modal State
  const [sharedQuizIdForModal, setSharedQuizIdForModal] = useState(null);

  // Teacher Quiz Created Success Modal State (Share vs Solve choice)
  const [teacherSuccessQuiz, setTeacherSuccessQuiz] = useState(null);

  // Global Toast & Error Modal
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAction, setLastAction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Sync state to storage to prevent loss on refresh
  useEffect(() => {
    try {
      if (currentPage !== 'student') {
        sessionStorage.setItem('prepo_current_page', currentPage);
      }
    } catch {}
  }, [currentPage]);

  useEffect(() => {
    try {
      sessionStorage.setItem('prepo_profile_tab', profileTab);
    } catch {}
  }, [profileTab]);

  useEffect(() => {
    try {
      sessionStorage.setItem('prepo_config_mode', configMode);
    } catch {}
  }, [configMode]);

  useEffect(() => {
    try {
      if (activeQuizData) {
        localStorage.setItem('prepo_active_quiz_data', JSON.stringify(activeQuizData));
      } else {
        localStorage.removeItem('prepo_active_quiz_data');
      }
    } catch {}
  }, [activeQuizData]);

  useEffect(() => {
    try {
      if (evaluationResults) {
        localStorage.setItem('prepo_evaluation_results', JSON.stringify(evaluationResults));
      } else {
        localStorage.removeItem('prepo_evaluation_results');
      }
    } catch {}
  }, [evaluationResults]);

  // Protect against accidental browser reload / close during active test attempt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentPage === 'attempt' && activeQuizData) {
        e.preventDefault();
        e.returnValue = 'You have a test in progress. Are you sure you want to leave or reload?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentPage, activeQuizData]);

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

    // Protect active ongoing test from accidental exit
    if (currentPage === 'attempt' && activeQuizData && page !== 'attempt') {
      const confirmLeave = window.confirm(
        'You have an active test in progress!\n\nAre you sure you want to navigate away? Your answers are saved, and you can resume anytime using "Resume Test" in the navbar.'
      );
      if (!confirmLeave) return;
    }

    if (page === 'profile') {
      setProfileTab(tab);
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle between Student Mode and Teacher Mode
  const handleToggleUserMode = (newMode) => {
    setUserMode(newMode);
    try {
      localStorage.setItem('prepo_user_mode', newMode);
    } catch {}

    if (newMode === 'teacher') {
      if (!isLoggedIn) {
        openSignIn();
        showToast('Please sign in to access Teacher Classroom Suite', 'info');
        return;
      }
      setProfileTab('teacher');
      setCurrentPage('profile');
      showToast('Switched to Teacher Mode 👨‍🏫', 'success');
    } else {
      if (currentPage === 'profile' && profileTab === 'teacher') {
        setCurrentPage('home');
      }
      showToast('Switched to Student Mode 🎓', 'success');
    }
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
      setGeneratingMeta({
        title: 'Generating AI Practice Test',
        subtitle: `${config.subject} • ${config.chapter} (${config.class_level})`,
      });
      setLastAction(() => () => handleGenerateTopicQuiz(config));

      const data = await api.generateQuiz(config);
      await fetchCredits();

      const quizPayload = {
        session_id: data.session_id,
        questions: data.questions,
        config: {
          subject: config.subject,
          chapter: config.chapter,
          class_level: config.class_level,
          difficulty: config.difficulty,
          num_questions: config.num_questions,
        },
      };

      setActiveQuizData(quizPayload);

      if (userMode === 'teacher') {
        // In Teacher Mode: Pop open choices to Share or Solve
        setTeacherSuccessQuiz(quizPayload);
      } else {
        // In Student Mode: Start test attempt directly
        setCurrentPage('attempt');
      }
    } catch (err) {
      if (err.isCreditLimit) {
        openCreditLimitModal();
      } else {
        setErrorMessage(err.message || 'Quiz generation failed.');
      }
    } finally {
      setIsGenerating(false);
      setGeneratingMeta(null);
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
      setGeneratingMeta({
        title: 'Extracting AI Quiz from Document',
        subtitle: `Analyzing ${filename} and formulating conceptual MCQs...`,
      });
      setLastAction(() => () => handleGenerateDocQuiz(formData, filename));

      const data = await api.generateQuizFromDoc(formData);
      await fetchCredits();

      const docPayload = {
        session_id: data.session_id,
        questions: data.questions,
        config: {
          subject: filename,
          chapter: 'Uploaded Document',
          class_level: 'Custom Document',
        },
      };

      setActiveQuizData(docPayload);

      if (userMode === 'teacher') {
        setTeacherSuccessQuiz(docPayload);
      } else {
        setCurrentPage('attempt');
      }
    } catch (err) {
      if (err.isCreditLimit) {
        openCreditLimitModal();
      } else {
        setErrorMessage(err.message || 'Document quiz generation failed.');
      }
    } finally {
      setIsGenerating(false);
      setGeneratingMeta(null);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async (sessionId, answers, timeElapsed) => {
    try {
      setIsEvaluating(true);
      setLastAction(() => () => handleSubmitQuiz(sessionId, answers, timeElapsed));

      const res = await api.evaluateQuiz(sessionId, answers);

      const quizSessionId = sessionId || activeQuizData?.session_id;
      setEvaluationResults({
        score: res.score,
        total: res.total,
        results: res.results,
        config: activeQuizData?.config || {},
        timeElapsed,
        session_id: quizSessionId,
      });

      // Clear active ongoing quiz now that it has been evaluated
      setActiveQuizData(null);
      try {
        localStorage.removeItem('prepo_active_quiz_data');
      } catch {}

      setCurrentPage('results');
    } catch (err) {
      setErrorMessage(err.message || 'Could not evaluate answers.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Teacher Share Quiz Action
  const handleShareCurrentQuiz = async () => {
    const sessId = activeQuizData?.session_id || evaluationResults?.session_id;
    if (!sessId) {
      showToast('No active quiz found to share.', 'error');
      return;
    }
    try {
      const res = await api.shareQuiz(sessId);
      if (res && res.shared_quiz_id) {
        setSharedQuizIdForModal(res.shared_quiz_id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate share link.', 'error');
    }
  };

  // Teacher Success Modal Handlers
  const handleTeacherShareFromModal = async () => {
    if (!teacherSuccessQuiz?.session_id) return;
    try {
      const res = await api.shareQuiz(teacherSuccessQuiz.session_id);
      if (res && res.shared_quiz_id) {
        setTeacherSuccessQuiz(null);
        setSharedQuizIdForModal(res.shared_quiz_id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate share link.', 'error');
    }
  };

  const handleTeacherSolveFromModal = () => {
    setTeacherSuccessQuiz(null);
    setCurrentPage('attempt');
  };

  const handleTeacherGoToDashboard = () => {
    setTeacherSuccessQuiz(null);
    handleNavigate('profile', 'teacher');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-100 text-gray-800">
      
      {/* ── NAVBAR (Hidden in active quiz attempt & guest student test) ── */}
      {currentPage !== 'student' && currentPage !== 'attempt' && (
        <Navbar 
          onNavigate={handleNavigate} 
          currentPage={currentPage} 
          profileTab={profileTab}
          userMode={userMode}
          onToggleUserMode={handleToggleUserMode}
          hasActiveQuiz={!!activeQuizData && currentPage !== 'attempt'}
          onResumeQuiz={() => setCurrentPage('attempt')}
        />
      )}

      {/* ── MAIN BODY CONTENT ── */}
      <main className="flex-1 pb-20 md:pb-0">
        
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
            <div className="max-w-xl mx-auto mb-6 p-1.5 bg-surface-200/80 backdrop-blur-sm rounded-2xl border border-surface-300 grid grid-cols-2 gap-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setConfigMode('topic')}
                className={`py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-center select-none ${
                  configMode === 'topic'
                    ? 'bg-white text-primary-800 font-bold shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-white/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  configMode === 'topic' ? 'bg-primary-100 text-primary-700' : 'bg-surface-300/60 text-gray-500'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs sm:text-sm font-bold tracking-tight truncate">
                    Syllabus Topics
                  </div>
                  <div className="text-[10px] text-gray-500 hidden sm:block truncate">
                    Subject & grade based
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfigMode('doc')}
                className={`py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-center select-none ${
                  configMode === 'doc'
                    ? 'bg-white text-primary-800 font-bold shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-white/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  configMode === 'doc' ? 'bg-primary-100 text-primary-700' : 'bg-surface-300/60 text-gray-500'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs sm:text-sm font-bold tracking-tight truncate">
                    Upload Document
                  </div>
                  <div className="text-[10px] text-gray-500 hidden sm:block truncate">
                    PDF, DOCX or Notes
                  </div>
                </div>
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
            onRetake={() => {
              setActiveQuizData(null);
              setEvaluationResults(null);
              try {
                localStorage.removeItem('prepo_active_quiz_data');
                localStorage.removeItem('prepo_evaluation_results');
              } catch {}
              setCurrentPage('config');
            }}
            onShareQuiz={isLoggedIn && userMode === 'teacher' ? handleShareCurrentQuiz : null}
            onShowToast={showToast}
          />
        )}

        {/* 5. USER PROFILE & TEACHER DASHBOARD */}
        {currentPage === 'profile' && (
          <UserProfile
            initialTab={profileTab}
            userMode={userMode}
            onToggleUserMode={handleToggleUserMode}
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
      {currentPage === 'home' && <Footer onNavigate={handleNavigate} />}

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

      {/* Teacher Quiz Created Choices Modal */}
      {teacherSuccessQuiz && (
        <TeacherQuizSuccessModal
          isOpen={!!teacherSuccessQuiz}
          onClose={() => setTeacherSuccessQuiz(null)}
          quizData={teacherSuccessQuiz}
          onShareQuiz={handleTeacherShareFromModal}
          onSolveQuiz={handleTeacherSolveFromModal}
          onGoToDashboard={handleTeacherGoToDashboard}
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

      {/* ── AI QUIZ GENERATION LOADING POPUP ── */}
      <LoadingModal
        isOpen={isGenerating}
        type="generate"
        title={generatingMeta?.title || (configMode === 'doc' ? 'Extracting AI Quiz from Document' : 'Generating AI Practice Test')}
        subtitle={generatingMeta?.subtitle || 'Formulating high-yield exam questions with 4-part AI reasoning...'}
      />

      {/* ── MOBILE BOTTOM NAVIGATION BAR (Native App Style as in Photo 3) ── */}
      {currentPage !== 'student' && currentPage !== 'attempt' && (
        <MobileBottomNav
          currentPage={currentPage}
          profileTab={profileTab}
          userMode={userMode}
          credits={credits}
          onNavigate={handleNavigate}
          onOpenCredits={openBuyCreditsModal}
          onToggleMode={handleToggleUserMode}
        />
      )}

    </div>
  );
}

export default App;
