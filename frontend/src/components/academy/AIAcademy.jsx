import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Zap,
  Bot,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COMPLETE_AI_ACADEMY_MODULES, ACADEMY_CATEGORIES, resolveLang } from '../../data/aiAcademyCourses';
import BookCard from './BookCard';
import BookReaderModal from './BookReaderModal';

export function AIAcademy({ onNavigate, onShowToast }) {
  const { plan = 'free', openBuyCreditsModal } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBook, setActiveBook] = useState(null);

  // Filter modules based on category and search query across all 3 languages
  const filteredModules = useMemo(() => {
    return COMPLETE_AI_ACADEMY_MODULES.filter((module) => {
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleStr = `${resolveLang(module.title, 'en')} ${resolveLang(module.title, 'hinglish')} ${resolveLang(module.title, 'hi')}`.toLowerCase();
      const subtitleStr = `${resolveLang(module.subtitle, 'en')} ${resolveLang(module.subtitle, 'hinglish')}`.toLowerCase();
      const summaryStr = `${resolveLang(module.summary, 'en')} ${resolveLang(module.summary, 'hinglish')}`.toLowerCase();

      return matchesCategory && (titleStr.includes(q) || subtitleStr.includes(q) || summaryStr.includes(q));
    });
  }, [selectedCategory, searchQuery]);

  const handleOpenBook = (module) => {
    if (module.moduleNumber > 3 && plan === 'free') {
      if (onShowToast) {
        onShowToast('Modules 4 to 10 are unlocked with the Student Pack (₹19) or Teacher Pack (₹49)!', 'info');
      }
      openBuyCreditsModal();
      return;
    }
    setActiveBook(module);
  };

  const handleCloseBook = () => {
    setActiveBook(null);
  };

  return (
    <div className="min-h-screen bg-surface-100 pb-20 pt-4 sm:pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* ── ACADEMY HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-indigo-900 text-white p-6 sm:p-10 shadow-elevated">
          {/* Subtle Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold mb-3.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Interactive Digital Library • 10 In-Depth Books</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              Master AI Through <span className="text-amber-300">10 Comprehensive Books</span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed mb-6">
              Learn Artificial Intelligence from ground zero. 10 deep chapters in every book, 3-language switcher (English default, Hinglish & Hindi), 3D page curl reader, and ready-to-test prompt labs.
            </p>

            {/* Quick Action */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBook(COMPLETE_AI_ACADEMY_MODULES[0])}
                className="px-5 py-2.5 rounded-xl bg-white text-primary-800 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4 text-primary-700" />
                <span>Start Reading Module 01</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                <Globe className="w-4 h-4 text-amber-300" />
                <span>Available in English, Hinglish & Hindi</span>
              </div>
            </div>
          </div>

          {/* Quick Stats on Right for Large Screens */}
          <div className="hidden lg:grid absolute right-10 top-1/2 -translate-y-1/2 grid-cols-2 gap-3 w-72">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <span className="text-2xl font-black text-white block">100</span>
              <span className="text-[11px] font-semibold text-blue-200">Total Chapters</span>
            </div>
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <span className="text-2xl font-black text-amber-300 block">3</span>
              <span className="text-[11px] font-semibold text-blue-200">Languages (EN/HI)</span>
            </div>
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <span className="text-2xl font-black text-emerald-300 block">50+</span>
              <span className="text-[11px] font-semibold text-blue-200">Tested Prompts</span>
            </div>
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <span className="text-2xl font-black text-cyan-200 block">3D</span>
              <span className="text-[11px] font-semibold text-blue-200">Page Curl Engine</span>
            </div>
          </div>
        </div>

        {/* ── SEARCH & CATEGORY FILTERS ── */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search topics (e.g. Prompt Engineering, Gemini, Canva, Midjourney)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-xs font-bold text-gray-500 self-end sm:self-center">
              Showing {filteredModules.length} of {COMPLETE_AI_ACADEMY_MODULES.length} books
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {ACADEMY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-surface-50 border border-surface-200'
                }`}
              >
                {resolveLang(cat.label, 'en')}
              </button>
            ))}
          </div>
        </div>

        {/* ── COURSE BOOKS GRID ── */}
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredModules.map((module) => (
              <BookCard 
                key={module.id} 
                module={module} 
                isLocked={module.moduleNumber > 3 && plan === 'free'}
                onLockedClick={() => {
                  if (onShowToast) {
                    onShowToast('Modules 4 to 10 are unlocked with the Student Pack (₹19) or Teacher Pack (₹49)!', 'info');
                  }
                  openBuyCreditsModal();
                }}
                onOpenBook={handleOpenBook} 
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-2xs">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">No books matched your search</h3>
            <p className="text-xs text-gray-500 mb-4">Try clearing filters or searching for keywords like "prompt", "research", or "image".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-xs hover:bg-primary-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── FOOTER CALLOUT ── */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Want to test your AI knowledge with an exam?</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Use Prepo.ai's AI Practice Test engine to generate personalized MCQs on any syllabus.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('config')}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Practice Test</span>
          </button>
        </div>

      </div>

      {/* ── 3D BOOK READER MODAL ── */}
      {activeBook && (
        <BookReaderModal 
          module={activeBook} 
          onClose={handleCloseBook} 
          onShowToast={onShowToast} 
        />
      )}
    </div>
  );
}

export default AIAcademy;
