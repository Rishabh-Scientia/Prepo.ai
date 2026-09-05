import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Sparkles,
  History,
  Share2,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Coins,
  PlusCircle,
  LogOut,
  Clock,
  ChevronRight,
  Layers
} from 'lucide-react';

export function DesktopSidebar({
  currentPage,
  profileTab = 'history',
  userMode = 'student',
  onToggleUserMode,
  onNavigate,
  hasActiveQuiz = false,
  onResumeQuiz,
}) {
  const {
    user,
    isLoggedIn,
    displayName,
    userInitial,
    credits,
    openSignIn,
    openBuyCreditsModal,
    signOut,
  } = useAuth();

  const isStudent = userMode === 'student';
  const firstName = displayName ? displayName.trim().split(' ')[0] : 'Account';

  const handleNav = (page, tab) => {
    onNavigate(page, tab);
  };

  const handleModeChange = (newMode) => {
    if (onToggleUserMode) onToggleUserMode(newMode);
  };

  // Navigation item component for consistency
  const NavItem = ({ icon: Icon, label, isActive, onClick, badge, iconColor, activeColor = 'primary' }) => {
    const colors = {
      primary: {
        active: 'bg-primary-50 text-primary-700 border-primary-600',
        icon: 'text-primary-600',
      },
      indigo: {
        active: 'bg-indigo-50 text-indigo-700 border-indigo-600',
        icon: 'text-indigo-600',
      },
      amber: {
        active: 'bg-amber-50 text-amber-800 border-amber-600',
        icon: 'text-amber-600',
      },
    };
    const scheme = colors[activeColor] || colors.primary;

    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all group relative ${
          isActive
            ? `${scheme.active} font-bold border-l-[3px] pl-[11px]`
            : 'text-gray-600 hover:text-gray-900 hover:bg-surface-100 border-l-[3px] border-transparent pl-[11px]'
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] shrink-0 transition-colors ${
            isActive ? scheme.icon : iconColor || 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <span className="truncate">{label}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-extrabold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-white border-r border-surface-200/90 shadow-[2px_0_8px_rgba(0,0,0,0.03)] z-30 shrink-0 overflow-y-auto sidebar-scrollbar">
      
      {/* ── BRAND HEADER ── */}
      <div className="px-5 pt-5 pb-3">
        <button
          onClick={() => handleNav(isStudent ? 'home' : 'profile', 'teacher')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div>
            <span className="font-extrabold text-[17px] text-gray-900 tracking-tight leading-none">
              Prepo<span className="text-primary-600">.ai</span>
            </span>
            <span className="block text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
              AI Assessment Engine
            </span>
          </div>
        </button>
      </div>

      {/* ── MODE SWITCHER ── */}
      <div className="px-4 pb-4">
        <div className="bg-surface-100/90 p-1 rounded-xl border border-surface-200/90 shadow-2xs flex items-center">
          <button
            type="button"
            onClick={() => handleModeChange('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              isStudent
                ? 'bg-white text-primary-700 shadow-xs ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('teacher')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              !isStudent
                ? 'bg-gradient-to-r from-indigo-600 to-primary-700 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="px-5">
        <div className="border-t border-surface-200/80" />
      </div>

      {/* ── NAVIGATION ITEMS ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Navigation
        </p>

        {isStudent ? (
          <>
            <NavItem
              icon={Home}
              label="Home"
              isActive={currentPage === 'home'}
              onClick={() => handleNav('home')}
            />
            <NavItem
              icon={Sparkles}
              label="Practice Test"
              isActive={currentPage === 'config'}
              onClick={() => handleNav('config')}
            />
            <NavItem
              icon={History}
              label="My Tests"
              isActive={currentPage === 'profile' && profileTab === 'history'}
              onClick={() => handleNav('profile', 'history')}
            />
            <NavItem
              icon={Share2}
              label="Shared Class Tests"
              isActive={currentPage === 'profile' && profileTab === 'shared'}
              onClick={() => handleNav('profile', 'shared')}
            />
          </>
        ) : (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Classroom Dashboard"
              isActive={currentPage === 'profile' && profileTab === 'teacher'}
              onClick={() => handleNav('profile', 'teacher')}
              activeColor="indigo"
            />
            <NavItem
              icon={Sparkles}
              label="Create Class Test"
              isActive={currentPage === 'config'}
              onClick={() => handleNav('config')}
              activeColor="indigo"
            />
          </>
        )}

        {/* Resume Test — Persistent CTA */}
        {hasActiveQuiz && (
          <button
            type="button"
            onClick={onResumeQuiz}
            className="w-full mt-2 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 animate-pulse transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Resume Active Test</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        )}
      </nav>

      {/* ── CREDITS WIDGET ── */}
      {isLoggedIn && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={openBuyCreditsModal}
            className="w-full flex items-center gap-3 px-3.5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 rounded-xl transition-all hover:shadow-xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold block leading-tight">
                Credits
              </span>
              <span className="text-base font-extrabold text-amber-900 leading-tight">{credits}</span>
            </div>
            <PlusCircle className="w-4 h-4 text-amber-500/70 group-hover:text-amber-600 shrink-0 transition-colors" />
          </button>
        </div>
      )}

      {/* ── DIVIDER ── */}
      <div className="px-5">
        <div className="border-t border-surface-200/80" />
      </div>

      {/* ── USER CARD + SIGN OUT ── */}
      <div className="px-4 py-4">
        {isLoggedIn ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-2.5 bg-surface-50/80 rounded-xl border border-surface-200/60">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{firstName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                handleNav('home');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openSignIn}
            className="w-full py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl transition-all shadow-xs hover:shadow-sm"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </aside>
  );
}

export default DesktopSidebar;
