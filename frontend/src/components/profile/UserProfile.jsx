import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttemptHistory from './AttemptHistory';
import TeacherDashboard from '../teacher/TeacherDashboard';
import { User, History, Share2, Coins, PlusCircle, Sparkles, Mail, Shield } from 'lucide-react';

export function UserProfile({ initialTab = 'history', onCreateQuiz, onShowToast }) {
  const { user, displayName, userInitial, credits, openBuyCreditsModal } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'history' | 'teacher'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn pb-20">
      
      {/* ── PROFILE HERO CARD ── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-subtle overflow-hidden mb-8">
        {/* Gradient Header Strip */}
        <div className="h-24 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
        </div>

        <div className="px-6 pb-6 pt-2 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="-mt-12 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white shrink-0">
                {userInitial}
              </div>
              <div className="pt-1 sm:pt-0">
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{displayName}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
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

      {/* ── TABS NAV ── */}
      <div className="flex border-b border-surface-200 mb-8 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-5 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Attempt History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teacher')}
          className={`pb-3 px-5 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'teacher'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Teacher Shared Tests</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'history' ? (
        <AttemptHistory onCreateQuiz={onCreateQuiz} onShowToast={onShowToast} />
      ) : (
        <TeacherDashboard onCreateQuiz={onCreateQuiz} onShowToast={onShowToast} />
      )}
    </div>
  );
}

export default UserProfile;
