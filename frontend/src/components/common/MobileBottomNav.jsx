import React from 'react';
import { 
  Home, 
  History, 
  Plus, 
  Coins, 
  BookOpen, 
  LayoutDashboard,
  GraduationCap
} from 'lucide-react';

export function MobileBottomNav({ 
  currentPage, 
  profileTab = 'history', 
  userMode = 'student', 
  credits = 0, 
  onNavigate, 
  onOpenCredits,
  onToggleMode
}) {
  const isStudent = userMode === 'student';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-200/90 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        
        {/* TAB 1: Home (Student) or Dashboard (Teacher) */}
        {isStudent ? (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentPage === 'home' ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Home className={`w-5 h-5 ${currentPage === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('profile', 'teacher')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentPage === 'profile' && profileTab === 'teacher' ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentPage === 'profile' && profileTab === 'teacher' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
          </button>
        )}

        {/* TAB 2: My Tests (Student) or Assessments (Teacher) */}
        {isStudent ? (
          <button
            type="button"
            onClick={() => onNavigate('profile', 'history')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentPage === 'profile' && profileTab === 'history' ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <History className={`w-5 h-5 ${currentPage === 'profile' && profileTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 font-medium">My Tests</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('profile', 'teacher')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentPage === 'profile' && profileTab === 'teacher' ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${currentPage === 'profile' && profileTab === 'teacher' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 font-medium">Assessments</span>
          </button>
        )}

        {/* TAB 3 (CENTER): Elevated Action Button (+) */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-4">
          <button
            type="button"
            onClick={() => onNavigate('config')}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-elevated border-2 border-white active:scale-90 transition-transform ${
              isStudent
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-primary-500/30'
                : 'bg-gradient-to-br from-indigo-600 to-primary-700 shadow-indigo-500/30'
            } ${currentPage === 'config' ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
            aria-label={isStudent ? 'Generate Practice Test' : 'Create Class Test'}
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
          <span className="text-[9px] font-bold text-gray-700 mt-1 truncate">
            {isStudent ? 'Practice' : 'New Test'}
          </span>
        </div>

        {/* TAB 4: Pricing & Credits Top Up */}
        <button
          type="button"
          onClick={onOpenCredits}
          className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-amber-700 transition-colors relative"
        >
          <div className="relative">
            <Coins className="w-5 h-5 text-amber-500 stroke-2" />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-extrabold rounded-full min-w-[14px] text-center leading-tight shadow-xs">
              {credits}
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-medium text-amber-800">Pricing</span>
        </button>

        {/* TAB 5: Mode Switcher */}
        <button
          type="button"
          onClick={() => {
            if (onToggleMode) {
              onToggleMode(isStudent ? 'teacher' : 'student');
            } else {
              onNavigate('profile', isStudent ? 'history' : 'teacher');
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isStudent ? 'text-primary-700' : 'text-indigo-700'
          }`}
          title={`Currently in ${isStudent ? 'Student' : 'Teacher'} Mode. Tap to switch.`}
        >
          {isStudent ? (
            <GraduationCap className="w-5 h-5 stroke-2 text-primary-600" />
          ) : (
            <BookOpen className="w-5 h-5 stroke-2 text-indigo-600" />
          )}
          <span className="text-[9px] mt-0.5 font-bold uppercase tracking-wider">
            {isStudent ? 'Student' : 'Teacher'}
          </span>
        </button>

      </div>
    </div>
  );
}

export default MobileBottomNav;
