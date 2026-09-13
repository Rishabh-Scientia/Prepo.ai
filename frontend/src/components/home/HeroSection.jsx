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
  GraduationCap,
  Layers,
  ChevronRight,
  Bot,
  Flame,
  ShieldCheck,
  BarChart3,
  BookMarked,
  Atom,
  Binary,
  FlaskConical,
  Dna,
  Calculator
} from 'lucide-react';

export function HeroSection({ onStartQuiz, onSelectSubject, onNavigate }) {
  const quickSubjects = [
    { name: 'Physics', classLevel: 'Class 12 CBSE', chapter: 'Electrostatics', icon: Atom },
    { name: 'Mathematics', classLevel: 'JEE Main / Advanced', chapter: 'Calculus & Integration', icon: Calculator },
    { name: 'Chemistry', classLevel: 'Class 11 CBSE', chapter: 'Chemical Bonding', icon: FlaskConical },
    { name: 'Biology', classLevel: 'NEET', chapter: 'Cell Cycle & Cell Division', icon: Dna },
    { name: 'Data Structures', classLevel: 'B.Tech CSE', chapter: 'Binary Trees & Graphs', icon: Binary },
    { name: 'Computer Networks', classLevel: 'GATE CS', chapter: 'TCP/IP & OSI Model', icon: Layers },
  ];

  const featuredBooks = [
    {
      moduleNumber: 1,
      title: 'What is AI?',
      subtitle: 'Everyday analogies, mental models & how machines learn without magic',
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      tag: 'Fundamentals',
      readTime: '12 min read',
      chapters: '10 Chapters'
    },
    {
      moduleNumber: 2,
      title: 'Prompt Engineering',
      subtitle: 'Frameworks, few-shot prompting & reasoning patterns for top AI outputs',
      gradient: 'from-indigo-600 via-purple-600 to-indigo-900',
      tag: 'Practical Skills',
      readTime: '15 min read',
      chapters: '10 Chapters'
    },
    {
      moduleNumber: 3,
      title: 'Deep Learning & LLMs',
      subtitle: 'Neural networks, transformer attention & token prediction demystified',
      gradient: 'from-purple-600 via-pink-600 to-purple-950',
      tag: 'Core Tech',
      readTime: '18 min read',
      chapters: '10 Chapters'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-12 animate-fadeIn">
      
      {/* ── 1. HERO SECTION WITH AMBIENT GLOW ── */}
      <div className="relative text-center max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Subtle Top Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[300px] bg-gradient-to-tr from-primary-200/30 via-indigo-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Announcement Pill (Prepo Buzz) */}
        <div className="flex items-center justify-center mb-6">
          <button
            type="button"
            onClick={() => onNavigate?.('buzz')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200/80 text-xs font-semibold text-amber-900 transition shadow-2xs hover:shadow-xs group cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-bold text-amber-700">Prepo Buzz:</span>
            <span>Invite friends & Earn ₹100 UPI Cash</span>
            <ChevronRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] sm:leading-[1.12]">
          Master Any Subject with <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-blue-700">
            Adaptive AI Tests
          </span>{' '}
          &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
            Digital Books
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
          Generate syllabus-aligned practice tests from any topic or your own notes (PDF/Doc). Read 10 interactive AI Academy books, and master concepts with step-by-step 4-part AI explanations.
        </p>

        {/* Primary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onStartQuiz('topic')}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary-200 group-hover:rotate-12 transition-transform" />
            <span>Generate Test from Topic</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate?.('academy')}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>Read AI Digital Books</span>
            <span className="text-[10px] bg-emerald-900/60 text-emerald-100 font-bold px-1.5 py-0.5 rounded">10 Modules</span>
          </button>

          <button
            onClick={() => onStartQuiz('doc')}
            className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-800 font-semibold text-sm border border-gray-200 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Upload Notes / PDF</span>
          </button>
        </div>

        {/* Quick Pick Chips */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3.5">
            Popular Topics to Try Instantly:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickSubjects.map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSubject(sub)}
                  className="text-xs font-medium bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 border border-gray-200/80 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-all shadow-2xs flex items-center gap-1.5 group cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <span className="font-semibold">{sub.name}</span>
                  <span className="text-gray-400 text-[10px]">({sub.chapter})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. TRUST METRICS BAR ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-gray-50/70 border border-gray-200/60 rounded-2xl">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">10 Books</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Interactive AI Academy</div>
          </div>
          <div className="text-center border-l border-gray-200/60">
            <div className="text-2xl sm:text-3xl font-black text-primary-600">10,000+</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Quizzes Generated</div>
          </div>
          <div className="text-center border-l border-gray-200/60">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">4-Part</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Deep AI Explanations</div>
          </div>
          <div className="text-center border-l border-gray-200/60">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">0.1s</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Instant Test Evaluation</div>
          </div>
        </div>
      </div>

      {/* ── 3. DEDICATED SHOWCASE: PREPO AI ACADEMY (DIGITAL BOOKS) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-indigo-900/50">
          
          {/* Ambient Background Circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>NEW FEATURE: PREPO AI ACADEMY</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Learn with 10 Interactive Digital Books
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-xl font-normal">
                Master AI & modern tech through bite-sized chapters, daily analogies, and mental models. Read in English, Hinglish, or Hindi, then test yourself in 1 click!
              </p>
            </div>

            <button
              onClick={() => onNavigate?.('academy')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-gray-100 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <span>Explore All 10 Books</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </button>
          </div>

          {/* 3 Featured Books Cards Showcase */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredBooks.map((book) => (
              <div
                key={book.moduleNumber}
                onClick={() => onNavigate?.('academy')}
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Book Cover Snippet */}
                  <div className={`h-28 rounded-xl bg-gradient-to-br ${book.gradient} p-3.5 flex flex-col justify-between shadow-inner mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform`}>
                    <div className="flex items-center justify-between text-[11px] text-white/80">
                      <span className="font-bold uppercase tracking-wider">Book #{book.moduleNumber}</span>
                      <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-semibold">{book.tag}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{book.title}</h4>
                      <p className="text-[10px] text-white/80 mt-0.5">{book.chapters} • {book.readTime}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {book.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Start Reading Chapter 1</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Value Badges Footer */}
          <div className="relative z-10 mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free Access to Books 1–3 for Everyone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1-Click Practice Quiz Generated from Any Chapter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Tri-lingual: English, Hinglish & Hindi</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. EXPANDED 6-CARD BENTO GRID: WHY CHOOSE PREPO.AI ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 border border-gray-200 text-xs font-semibold text-gray-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Engineered for Deep Concept Mastery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Why Students & Teachers Choose Prepo.ai
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">
            A complete AI-assisted learning ecosystem designed for zero hallucination and maximum exam retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Interactive Digital Books (AI Academy) */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Interactive Digital Books</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Read 10 full curriculum AI digital books with chapter-wise breakdowns, analogies, and practical mental models across English, Hinglish & Hindi.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-blue-700">
              <span className="flex items-center gap-1"><BookMarked className="w-3.5 h-3.5" /> 10 Complete Books</span>
              <button onClick={() => onNavigate?.('academy')} className="hover:underline flex items-center gap-0.5">Read →</button>
            </div>
          </div>

          {/* Card 2: Adaptive AI Quizzes */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Adaptive AI Quizzes</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Choose academic grade, chapter, difficulty (Easy to Hard), and question count for tailored assessments matching exact curriculum standards.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-primary-600">
              <Zap className="w-3.5 h-3.5" /> High-yield question sets
            </div>
          </div>

          {/* Card 3: 4-Part AI Explanations */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">4-Part AI Explanations</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Clear Verdict, Core Concept, Step-by-Step Logic, and Misconception Analysis explaining precisely why incorrect options fail.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Award className="w-3.5 h-3.5" /> Zero rote learning
            </div>
          </div>

          {/* Card 4: Notes & PDF to Quiz */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Notes & PDF to Quiz</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Upload your lecture slides, class notes, or textbook chapters in PDF, DOCX, or TXT format for instant intelligent quiz generation.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
              <Sparkles className="w-3.5 h-3.5" /> Smart document parsing
            </div>
          </div>

          {/* Card 5: Teacher Share & Live Leaderboard */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Teacher Share & Leaderboard</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Share tests with a 1-click URL. Students submit with their names, and teachers view a real-time leaderboard with question accuracy analytics.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <Zap className="w-3.5 h-3.5" /> Instant 0.1s automated grading
            </div>
          </div>

          {/* Card 6: Performance & Accuracy Tracking */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Attempt History & Analytics</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Review past quiz scores, revisit tricky questions, analyze weak topic areas, and track your syllabus completion over time.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <Award className="w-3.5 h-3.5" /> Measurable score improvements
            </div>
          </div>

        </div>
      </div>

      {/* ── 5. HOW IT WORKS (3 SIMPLE STEPS) ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 bg-gray-50/70 border border-gray-200/80 rounded-3xl">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">How Prepo.ai Works</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">From concept to exam confidence in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 font-black text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-gray-900">Pick a Topic or Book</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Select from syllabus chapters, drop your lecture notes, or open an interactive AI Academy book.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-gray-900">Take Adaptive Test</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Practice high-yield questions with a timer, clean exam interface, and instant answer evaluations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-gray-900">Master with 4-Part Logic</h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Review step-by-step reasoning and misconception breakdowns to eliminate exam mistakes forever.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. BOTTOM ACTION BANNER ── */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-xl sm:text-2xl font-black">Ready to Ace Your Next Exam?</h3>
            <p className="text-xs sm:text-sm text-primary-100 mt-1">
              Start with 3 free quiz credits and 3 full AI Academy books today.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onStartQuiz('topic')}
              className="px-5 py-3 bg-white hover:bg-gray-100 text-primary-700 font-bold text-xs sm:text-sm rounded-xl transition shadow-md active:scale-95 cursor-pointer"
            >
              Start Free Practice
            </button>
            <button
              onClick={() => onNavigate?.('academy')}
              className="px-5 py-3 bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs sm:text-sm rounded-xl transition border border-primary-400/40 active:scale-95 cursor-pointer"
            >
              Explore Books
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default HeroSection;
