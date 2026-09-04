import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttemptHistory from './AttemptHistory';
import TeacherDashboard from '../teacher/TeacherDashboard';
import { User, History, Share2, Coins, PlusCircle, Sparkles, Mail, Shield, GraduationCap, BookOpen } from 'lucide-react';

export function UserProfile({ 
  initialTab = 'history', 
  userMode = 'student', 
  onToggleUserMode,
  onCreateQuiz, 
  onShowToast 
}) {
  const { user, displayName, userInitial, credits, openBuyCreditsModal } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'history' | 'teacher'
  const [studentSubTab, setStudentSubTab] = useState('attempts'); // 'attempts' | 'shared'

  // Keep active tab in sync if navigated with tab parameter
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn pb-20">
      
      {/* ── PROFILE HERO CARD ── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-subtle overflow-hidden mb-8">
        {/* Gradient Header Strip with Mode Switch */}
        <div className="h-20 sm:h-24 bg-gradient-to-r from-primary-700 via-primary-600 to-blue-600 relative px-4 sm:px-6 flex items-center justify-end">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent)]" />
          
          <button
            type="button"
            onClick={onToggleUserMode}
            className="relative z-10 inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 shadow-xs transition active:scale-95 cursor-pointer"
            title="Click to toggle Teacher / Student Mode"
          >
            {userMode === 'teacher' ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Teacher Mode</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Student Mode</span>
              </>
            )}
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">
              Switch
            </span>
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-6 pt-2 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="-mt-10 sm:-mt-12 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg border-4 border-white shrink-0">
                {userInitial}
              </div>
              <div className="pt-0.5 sm:pt-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                  {displayName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Credits Pill */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold block">
                  Quiz Credits
                </span>
                <span className="text-lg font-extrabold text-amber-900">{credits} <span className="text-sm font-semibold text-amber-600">Remaining</span></span>
              </div>
              <button
                type="button"
                onClick={openBuyCreditsModal}
                className="ml-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODE SPECIFIC CONTENT ── */}
      {userMode === 'teacher' ? (
        <TeacherDashboard onCreateQuiz={onCreateQuiz} onShowToast={onShowToast} />
      ) : (
        <div>
          {/* Sub-Tabs for Student Mode */}
          <div className="mb-6 pb-2 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStudentSubTab('attempts')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  studentSubTab === 'attempts'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>My Practice Tests</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentSubTab('shared')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  studentSubTab === 'shared'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Shared Class Tests</span>
              </button>
            </div>
          </div>

          {studentSubTab === 'shared' ? (
            <TeacherDashboard onCreateQuiz={onCreateQuiz} onShowToast={onShowToast} />
          ) : (
            <AttemptHistory onCreateQuiz={onCreateQuiz} onShowToast={onShowToast} />
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
