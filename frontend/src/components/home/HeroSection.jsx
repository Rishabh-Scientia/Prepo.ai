import React from 'react';
import { 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  Share2, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';

export function HeroSection({ onStartQuiz, onSelectSubject }) {
  const quickSubjects = [
    { name: 'Physics', classLevel: 'Class 12 CBSE', chapter: 'Electrostatics' },
    { name: 'Mathematics', classLevel: 'JEE Main / Advanced', chapter: 'Calculus & Integration' },
    { name: 'Chemistry', classLevel: 'Class 11 CBSE', chapter: 'Chemical Bonding' },
    { name: 'Biology', classLevel: 'NEET', chapter: 'Cell Cycle and Cell Division' },
    { name: 'Data Structures', classLevel: 'B.Tech CSE 3rd Sem', chapter: 'Binary Trees & Graphs' },
    { name: 'Computer Networks', classLevel: 'GATE CS', chapter: 'TCP/IP & OSI Model' },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10 animate-fadeIn">
      
      {/* ── HERO BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-700 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>AI-Powered Adaptive Assessment Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Master Any Subject with <span className="text-primary-600">Adaptive AI Practice Tests</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl lg:max-w-xl">
              Generate instant syllabus-aligned mock tests from any topic or your study notes (PDF/Doc). Get deterministic scoring and step-by-step 4-part AI explanations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3.5">
              <button
                onClick={() => onStartQuiz('topic')}
                className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-card transition shadow-sm flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-primary-200 group-hover:rotate-12 transition" />
                <span>Generate Test from Topic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onStartQuiz('doc')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-surface-50 text-gray-800 font-bold text-sm border border-surface-300 rounded-card transition shadow-subtle flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-primary-600" />
                <span>Upload Notes / PDF</span>
              </button>
            </div>
          </div>

          {/* Right: Stats Cards (Desktop Only) */}
          <div className="hidden lg:grid grid-cols-2 gap-4 w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
                <BrainCircuit className="w-5.5 h-5.5" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">AI</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Adaptive Quizzes</p>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5.5 h-5.5" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">4-Part</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">AI Explanations</p>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">PDF</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Notes to Quiz</p>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Share2 className="w-5.5 h-5.5" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">Live</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">Leaderboard</p>
            </div>
          </div>
        </div>

        {/* Quick Pick Chips */}
        <div className="mt-10 pt-6 border-t border-surface-200/80 text-center lg:text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Popular Topics to Try:
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            {quickSubjects.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSubject(sub)}
                className="text-xs font-medium bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-surface-300 hover:border-primary-300 px-3 py-1.5 rounded-card transition shadow-subtle flex items-center gap-1.5"
              >
                <span>{sub.name}</span>
                <span className="text-gray-400 text-[10px]">({sub.chapter})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why Students & Teachers Choose Prepo.ai</h2>
          <p className="text-sm text-gray-500 mt-1">Built for deep concept mastery and zero hallucination</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-white rounded-card border border-surface-200 shadow-subtle flex flex-col justify-between hover:shadow-elevated transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-card bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Adaptive AI Quizzes</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Choose academic grade, chapter, difficulty (Easy to Hard), and question count for tailored assessments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1 text-[11px] font-semibold text-primary-600">
              <Zap className="w-3.5 h-3.5" /> High-yield question sets
            </div>
          </div>

          <div className="p-5 bg-white rounded-card border border-surface-200 shadow-subtle flex flex-col justify-between hover:shadow-elevated transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-card bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">4-Part AI Explanations</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Clear Verdict, Core Concept, Step-by-Step Logic, and Misconception Analysis explaining why wrong options fail.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Award className="w-3.5 h-3.5" /> Zero rote learning
            </div>
          </div>

          <div className="p-5 bg-white rounded-card border border-surface-200 shadow-subtle flex flex-col justify-between hover:shadow-elevated transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-card bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Notes & PDF to Quiz</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Upload your lecture slides, class notes, or textbook chapters in PDF, DOCX, or TXT format for instant quiz generation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
              <BookOpen className="w-3.5 h-3.5" /> Smart document parsing
            </div>
          </div>

          <div className="p-5 bg-white rounded-card border border-surface-200 shadow-subtle flex flex-col justify-between hover:shadow-elevated transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-card bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Teacher Share & Leaderboard</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Share quizzes with a 1-click URL. Students submit with their name, and teachers view a live leaderboard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <Zap className="w-3.5 h-3.5" /> Instant 0.1s student grading
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default HeroSection;
