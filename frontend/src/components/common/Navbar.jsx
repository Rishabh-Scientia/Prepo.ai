import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Home,
  Coins, 
  User, 
  History, 
  Share2, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  PlusCircle, 
  ChevronDown, 
  CreditCard,
  Clock,
  GraduationCap,
  BookOpen,
  Zap,
  Lock
} from 'lucide-react';

export function Navbar({ 
  onNavigate, 
  currentPage, 
  profileTab = 'history',
  userMode = 'student',
  onToggleUserMode,
  hasActiveQuiz = false, 
  onResumeQuiz 
}) {
  const { 
    user, 
    isLoggedIn, 
    displayName, 
    userInitial, 
    credits, 
    plan = 'free',
    hasTeacherAccess = false,
    openSignIn, 
    openBuyCreditsModal, 
    signOut 
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract first name or fallback to 'My Account'
  const firstName = displayName ? displayName.trim().split(' ')[0] : 'Account';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page, tab) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate(page, tab);
  };

  const handleModeChange = (newMode) => {
    if (onToggleUserMode) {
      onToggleUserMode(newMode);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* LEFT: Brand Logo & Main Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <button 
            onClick={() => handleNavClick(userMode === 'teacher' ? 'profile' : 'home', 'teacher')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            {/* Minimalist modern brand mark */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
              plan === 'teacher'
                ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
                : plan === 'student'
                ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'
                : 'bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700'
            }`}>
              <span className="text-white font-black text-sm tracking-tight">P</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">
                Prepo<span className={plan === 'teacher' ? 'text-emerald-600' : plan === 'student' ? 'text-blue-600' : 'text-primary-600'}>.ai</span>
              </span>

              {/* Refined subtle tier micro-tag */}
              {plan === 'teacher' && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Teacher
                </span>
              )}
              {plan === 'student' && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  Student
                </span>
              )}
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'text-primary-700 bg-primary-50/80 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('academy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'academy'
                  ? 'text-primary-700 bg-primary-50/80 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Interactive Digital Books & AI Lessons"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
              <span>AI Academy</span>
            </button>

            {userMode === 'teacher' && (
              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentPage === 'profile' && profileTab === 'teacher'
                    ? 'text-emerald-800 bg-emerald-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Classroom</span>
              </button>
            )}

            {/* Subtle Buzz & Earn Link */}
            <button
              onClick={() => handleNavClick('buzz')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'buzz'
                  ? 'text-amber-900 bg-amber-50 font-semibold border border-amber-200/70'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-amber-50/50'
              }`}
              title="Prepo Buzz: Invite friends & Earn ₹100 Cashback"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Buzz & Earn</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                ₹100
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT: Segmented Switcher, Actions & Profile */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
          
          {/* Refined Segmented Mode Switcher */}
          <div className="inline-flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60">
            <button
              type="button"
              onClick={() => handleModeChange('student')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                userMode === 'student'
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
              title="Student Mode: Syllabus practice, MCQs & explanations"
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary-600" />
              <span>Student</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleModeChange('teacher')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                userMode === 'teacher'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
              title={hasTeacherAccess ? "Teacher Mode: Create tests & track student responses" : "Teacher Mode (Exclusive to Teacher Pack ₹49)"}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher</span>
              {!hasTeacherAccess && (
                <Lock className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-gray-200" />

          {/* Primary Action Button (Practice / Create) */}
          <button
            onClick={() => handleNavClick('config')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs hover:shadow flex items-center gap-1.5 active:scale-95 text-white ${
              userMode === 'teacher'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 opacity-90" />
            <span>{userMode === 'teacher' ? 'Class Test' : 'New Test'}</span>
          </button>

          {/* Resume Test if user has an ongoing active quiz */}
          {hasActiveQuiz && (
            <button
              onClick={() => {
                if (onResumeQuiz) onResumeQuiz();
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95 animate-pulse"
              title="You have a test in progress! Click to return."
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Refined Credits Pill */}
              <button
                onClick={openBuyCreditsModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60 rounded-lg text-xs font-medium text-amber-900 transition-all cursor-pointer group"
                title="Your balance. Click to top up."
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-900 group-hover:text-amber-900">{credits}</span>
                <span className="text-[11px] text-amber-700/80">credits</span>
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 p-1 pl-1.5 rounded-lg transition-all focus:outline-none ${
                    isDropdownOpen
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-7 h-7 text-white rounded-md flex items-center justify-center text-xs font-bold shadow-xs ${
                    plan === 'teacher' 
                      ? 'bg-emerald-700' 
                      : plan === 'student' 
                      ? 'bg-blue-700' 
                      : 'bg-primary-600'
                  }`}>
                    {userInitial}
                  </div>
                  <span className="text-xs font-medium text-gray-700 hidden lg:inline max-w-[85px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-scaleUp">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>

                      {/* Active Plan Tag */}
                      <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Plan:</span>
                        <span className={`font-semibold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                          plan === 'teacher' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : plan === 'student' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {plan === 'teacher' ? 'Teacher Pack' : plan === 'student' ? 'Student Pack' : 'Free Tier'}
                        </span>
                      </div>
                    </div>

                    {/* Mode switch option in dropdown */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50/40">
                      <button
                        onClick={() => {
                          handleModeChange(userMode === 'teacher' ? 'student' : 'teacher');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-white hover:text-primary-700 rounded-md flex items-center justify-between border border-transparent hover:border-gray-200/80 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          {userMode === 'teacher' ? <GraduationCap className="w-3.5 h-3.5 text-primary-600" /> : <BookOpen className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>Switch to {userMode === 'teacher' ? 'Student Mode' : 'Teacher Mode'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Toggle</span>
                      </button>
                    </div>

                    {/* Strictly Mode-Isolated Menu Items */}
                    <div className="py-1">
                      {userMode === 'student' ? (
                        <button
                          onClick={() => handleNavClick('profile', 'history')}
                          className={`w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-primary-50/70 hover:text-primary-700 flex items-center gap-2.5 transition-colors ${
                            currentPage === 'profile' && profileTab === 'history' ? 'bg-primary-50/70 text-primary-700 font-semibold' : ''
                          }`}
                        >
                          <History className="w-4 h-4 text-gray-400" />
                          <span>Practice History</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNavClick('profile', 'teacher')}
                          className={`w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-emerald-50/70 hover:text-emerald-800 flex items-center gap-2.5 transition-colors ${
                            currentPage === 'profile' && profileTab === 'teacher' ? 'bg-emerald-50/70 text-emerald-800 font-semibold' : ''
                          }`}
                        >
                          <Share2 className="w-4 h-4 text-emerald-600" />
                          <span>Classroom Assessments</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleNavClick('buzz');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span>Prepo Buzz</span>
                        <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">₹100</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openBuyCreditsModal();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>Pricing & Plans</span>
                        <span className="ml-auto text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{credits} left</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                          handleNavClick('home');
                        }}
                        className="w-full px-3.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-xs hover:shadow"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger & Quick User */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <button
              onClick={openBuyCreditsModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{credits}</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Only account, mode switch, and pricing — navigation is on MobileBottomNav) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3.5 space-y-3 animate-fadeIn shadow-xl">
          {/* Buzz & Earn ₹100 Mobile Banner Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleNavClick('buzz');
            }}
            className="w-full text-left px-3.5 py-2.5 text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 rounded-xl flex items-center justify-between shadow-xs active:scale-98 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Prepo Buzz & Earn ₹100</span>
            </div>
            <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full text-slate-950 font-black uppercase tracking-wider">
              Cashback
            </span>
          </button>

          {/* AI Academy Mobile Drawer Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleNavClick('academy');
            }}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between border transition cursor-pointer ${
              currentPage === 'academy'
                ? 'bg-primary-50 text-primary-800 border-primary-300 font-extrabold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span>📚 AI Academy (10 Digital Books)</span>
            </div>
            <span className="text-[10px] bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full font-bold">
              Read
            </span>
          </button>

          {/* Dual Mode Switcher Pill (Mobile) */}
          <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex items-center">
            <button
              type="button"
              onClick={() => handleModeChange('student')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                userMode === 'student'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Mode</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('teacher')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                userMode === 'teacher'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher Mode</span>
            </button>
          </div>

          {isLoggedIn ? (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 shrink-0">
                {credits} Credits
              </div>
            </div>
          ) : null}

          {hasActiveQuiz && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onResumeQuiz) onResumeQuiz();
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-bold bg-amber-50 text-amber-900 rounded-xl flex items-center gap-2.5 border border-amber-200 animate-pulse"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Resume Active Test</span>
            </button>
          )}

          {/* Sign Out / Sign In */}
          {isLoggedIn ? (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                  handleNavClick('home');
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSignIn();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition shadow-xs"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
