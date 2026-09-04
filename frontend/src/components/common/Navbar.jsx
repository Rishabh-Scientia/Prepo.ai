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
  Check
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
    openSignIn, 
    openBuyCreditsModal, 
    signOut 
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract first name or fallback to 'My Account'
  const firstName = displayName ? displayName.trim().split(' ')[0] : 'My Account';

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
    <nav className="bg-white/95 backdrop-blur-md border-b border-surface-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleNavClick(userMode === 'teacher' ? 'profile' : 'home', 'teacher')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-gray-900 tracking-tight">Prepo<span className="text-primary-600">.ai</span></span>
              <span className="hidden lg:inline-block text-[9px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                {userMode === 'teacher' ? 'Classroom Suite' : 'AI Mock Tests'}
              </span>
            </div>
          </button>

          {/* Dual Mode Switcher Pill (Desktop) */}
          <div className="hidden sm:flex items-center bg-surface-100/90 p-1 rounded-xl border border-surface-200 shadow-2xs ml-1">
            <button
              type="button"
              onClick={() => handleModeChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                userMode === 'student'
                  ? 'bg-white text-primary-700 shadow-xs ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Student Mode: Self practice, syllabus MCQs, and detailed 4-part AI explanations"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                userMode === 'teacher'
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-700 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Teacher Mode: Create classroom tests, track live student leaderboards, and share with 1 click"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
          </div>
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {/* Conditional Navigation Links based on Mode */}
          {userMode === 'student' ? (
            <>
              {/* Home */}
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  currentPage === 'home'
                    ? 'text-primary-700 bg-primary-50 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              {/* Student Practice Test CTA */}
              <button
                onClick={() => handleNavClick('config')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 active:scale-95 ${
                  currentPage === 'config'
                    ? 'bg-primary-700 text-white ring-2 ring-primary-300'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-200" />
                <span>Practice Test</span>
              </button>

              {/* Attempt History */}
              {isLoggedIn && (
                <button
                  onClick={() => handleNavClick('profile', 'history')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentPage === 'profile' && profileTab === 'history'
                      ? 'text-primary-700 bg-primary-50 font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>My History</span>
                </button>
              )}
            </>
          ) : (
            <>
              {/* Teacher Dashboard */}
              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  currentPage === 'profile' && profileTab === 'teacher'
                    ? 'text-indigo-700 bg-indigo-50 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Classroom Dashboard</span>
              </button>

              {/* Create Class Test CTA */}
              <button
                onClick={() => handleNavClick('config')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 active:scale-95 ${
                  currentPage === 'config'
                    ? 'bg-indigo-700 text-white ring-2 ring-indigo-300'
                    : 'bg-gradient-to-r from-indigo-600 to-primary-700 hover:from-indigo-700 hover:to-primary-800 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Create Class Test</span>
              </button>

              {/* Past Attempts Tab */}
              {isLoggedIn && (
                <button
                  onClick={() => handleNavClick('profile', 'history')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentPage === 'profile' && profileTab === 'history'
                      ? 'text-primary-700 bg-primary-50 font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Personal Practice</span>
                </button>
              )}
            </>
          )}

          {/* Resume Test if user has an ongoing active quiz */}
          {hasActiveQuiz && (
            <button
              onClick={() => {
                if (onResumeQuiz) onResumeQuiz();
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center gap-1.5 shadow-sm ring-2 ring-amber-300 ring-offset-1 animate-pulse transition-all active:scale-95"
              title="You have a test in progress! Click to return."
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Resume Test</span>
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Credits Badge */}
              <button
                onClick={openBuyCreditsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 rounded-lg text-xs font-bold text-amber-800 transition-all hover:shadow-xs group"
                title="Click to buy more credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>{credits}</span>
                <PlusCircle className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-600" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 p-1 pl-2 rounded-lg transition-all focus:outline-none ${
                    isDropdownOpen
                      ? 'bg-primary-50 border border-primary-200 shadow-xs'
                      : 'hover:bg-surface-100 border border-transparent hover:border-surface-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">
                    {userInitial}
                  </div>
                  <span className="text-xs font-bold text-gray-800 hidden lg:inline max-w-[100px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-surface-200 rounded-2xl shadow-elevated overflow-hidden z-50 animate-scaleUp">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-surface-50 to-surface-100 border-b border-surface-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-xs">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>

                      {/* Active Mode indicator inside dropdown */}
                      <div className="mt-2.5 pt-2 border-t border-surface-200/80 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Active Mode:</span>
                        <div className="inline-flex items-center gap-1 font-bold text-primary-700 bg-white px-2 py-0.5 rounded-md border border-surface-200">
                          {userMode === 'teacher' ? (
                            <>
                              <BookOpen className="w-3 h-3 text-indigo-600" />
                              <span>Teacher Mode</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-3 h-3 text-primary-600" />
                              <span>Student Mode</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode switch option in dropdown */}
                    <div className="p-2 border-b border-surface-200 bg-surface-50/50">
                      <button
                        onClick={() => {
                          handleModeChange(userMode === 'teacher' ? 'student' : 'teacher');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-gray-700 hover:bg-white hover:text-primary-700 rounded-lg flex items-center justify-between border border-transparent hover:border-surface-200 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          {userMode === 'teacher' ? <GraduationCap className="w-4 h-4 text-primary-600" /> : <BookOpen className="w-4 h-4 text-indigo-600" />}
                          <span>Switch to {userMode === 'teacher' ? 'Student Mode' : 'Teacher Mode'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">Toggle</span>
                      </button>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('profile', 'teacher')}
                        className={`w-full px-4 py-2.5 text-left text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2.5 transition-colors ${
                          currentPage === 'profile' && profileTab === 'teacher' ? 'bg-primary-50/70 text-primary-700 font-bold' : ''
                        }`}
                      >
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold">Teacher Dashboard</span>
                        {userMode === 'teacher' && (
                          <span className="ml-auto text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </button>

                      <button
                        onClick={() => handleNavClick('profile', 'history')}
                        className={`w-full px-4 py-2.5 text-left text-xs text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2.5 transition-colors ${
                          currentPage === 'profile' && profileTab === 'history' ? 'bg-primary-50/70 text-primary-700 font-bold' : ''
                        }`}
                      >
                        <History className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">Attempt History</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openBuyCreditsModal();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">Buy Credits</span>
                        <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{credits}</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-surface-200 py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                          handleNavClick('home');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-semibold"
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
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl transition-all shadow-xs hover:shadow-sm"
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
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{credits}</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-surface-100 focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-3 space-y-2 animate-fadeIn shadow-lg">
          {/* Dual Mode Switcher Pill (Mobile) */}
          <div className="bg-surface-100 p-1 rounded-xl border border-surface-200 flex items-center mb-2">
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
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-700 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher Mode</span>
            </button>
          </div>

          {isLoggedIn ? (
            <div className="pb-3 mb-2 border-b border-surface-200">
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Contextual links for Mobile */}
          {userMode === 'student' ? (
            <>
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'home' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <Home className="w-4 h-4 text-primary-600" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavClick('config')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'config' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>Practice Test</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'profile' && profileTab === 'teacher' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Classroom Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('config')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'config' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Create Class Test</span>
              </button>
            </>
          )}

          {hasActiveQuiz && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onResumeQuiz) onResumeQuiz();
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-bold bg-amber-50 text-amber-900 rounded-lg flex items-center gap-2.5 border border-amber-200 animate-pulse"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Resume Active Test</span>
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleNavClick('profile', 'history')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'profile' && profileTab === 'history' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <History className="w-4 h-4 text-gray-400" />
                <span>Attempt History</span>
              </button>

              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'profile' && profileTab === 'teacher' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                <span>Teacher Shared Tests</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openBuyCreditsModal();
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50/70 rounded-lg flex items-center gap-2.5 border border-amber-100"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Buy Credits ({credits} available)</span>
              </button>

              <div className="pt-2 border-t border-surface-200 mt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                    handleNavClick('home');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSignIn();
              }}
              className="w-full mt-2 py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition shadow-xs"
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
