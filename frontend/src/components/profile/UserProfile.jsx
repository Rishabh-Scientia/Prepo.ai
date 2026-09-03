import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttemptHistory from './AttemptHistory';
import TeacherDashboard from '../teacher/TeacherDashboard';
import { User, History, Share2, Coins, PlusCircle, Sparkles } from 'lucide-react';

export function UserProfile({ initialTab = 'history', onCreateQuiz, onShowToast }) {
  const { user, displayName, userInitial, credits, openBuyCreditsModal } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'history' | 'teacher'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn pb-20">
      
      {/* ── PROFILE HERO CARD ── */}
      <div className="bg-white rounded-card border border-surface-200 shadow-subtle p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 text-white rounded-card flex items-center justify-center text-xl font-bold shadow-sm">
            {userInitial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Credits Pill */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-card p-3">
          <div className="w-8 h-8 rounded-card bg-amber-100 text-amber-700 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-amber-700 uppercase tracking-wider font-bold block">
              Quiz Credits
            </span>
            <span className="text-sm font-extrabold text-amber-900">{credits} Remaining</span>
          </div>
          <button
            type="button"
            onClick={openBuyCreditsModal}
            className="ml-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-card transition shadow-sm flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* ── TABS NAV ── */}
      <div className="flex border-b border-surface-200 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Attempt History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teacher')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'teacher'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
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
