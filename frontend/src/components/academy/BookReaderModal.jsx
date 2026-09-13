import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  ListOrdered, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Award, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ArrowRight,
  Globe,
  Layers
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, resolveLang } from '../../data/aiAcademyCourses';
import MarkdownContent from './MarkdownContent';

// Play subtle realistic page flip sound using Web Audio API
function playFlipSound(enabled) {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const bufferSize = ctx.sampleRate * 0.09;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {
    // Ignore autoplay restriction if thrown
  }
}

export function BookReaderModal({ module, onClose, onShowToast }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentLang, setCurrentLang] = useState('en'); // 'en' | 'hinglish' | 'hi'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [turnDirection, setTurnDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);

  // Selected answer for quiz pages: { [pageIndex]: selectedOptionIndex }
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});

  const totalPages = module.pages.length;
  const currentPage = module.pages[currentPageIndex];

  // Helper to resolve multilingual strings cleanly
  const t = (field) => resolveLang(field, currentLang);

  // Flip Page with 3D animation physics
  const goToPage = useCallback((newIndex, direction = 'next') => {
    if (newIndex < 0 || newIndex >= totalPages || isFlipping) return;
    setIsFlipping(true);
    setTurnDirection(direction);
    playFlipSound(soundEnabled);

    setTimeout(() => {
      setCurrentPageIndex(newIndex);
      setIsFlipping(false);
    }, 500);
  }, [totalPages, isFlipping, soundEnabled]);

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      goToPage(currentPageIndex + 1, 'next');
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1, 'prev');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, isFlipping]);

  // Copy prompt helper
  const handleCopyPrompt = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    if (onShowToast) onShowToast('Prompt copied to clipboard! Paste it into ChatGPT or Gemini.', 'success');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Open prompt directly in ChatGPT
  const handleOpenChatGPT = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://chatgpt.com/?q=${encoded}`, '_blank');
  };

  // Open Gemini
  const handleOpenGemini = () => {
    window.open('https://gemini.google.com', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* ── MAIN MODAL CONTAINER ── */}
      <div className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-surface-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-300 flex flex-col overflow-hidden">
        
        {/* ── TOP NAV HEADER: BOOK CONTROLS & 3-LANGUAGE SWITCHER ── */}
        <div className="h-16 px-4 sm:px-6 bg-white border-b border-surface-200 flex items-center justify-between shrink-0 z-20 shadow-2xs gap-3">
          
          {/* Left: Book Meta */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${module.themeColor.cover} shadow-2xs shrink-0`}>
              M{module.moduleNumber}
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                {t(module.title)}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium truncate hidden sm:block">
                {t(currentPage.title)}
              </p>
            </div>
          </div>

          {/* Center: 3-Language Segmented Switcher & Page Progress */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200 shadow-2xs">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setCurrentLang(lang.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentLang === lang.id
                      ? 'bg-white text-primary-700 shadow-xs ring-1 ring-black/5 font-extrabold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title={`Switch to ${lang.label}`}
                >
                  <span className="text-xs">{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.label}</span>
                  <span className="sm:hidden">{lang.id.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Page Count (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-surface-200">
              <span className="text-xs font-bold text-gray-600">
                {currentPageIndex + 1} / {totalPages}
              </span>
              <div className="w-24 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Table of Contents Button */}
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                isTocOpen 
                  ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-2xs' 
                  : 'bg-white text-gray-700 border-surface-200 hover:bg-surface-50'
              }`}
              title="Table of Contents"
            >
              <ListOrdered className="w-3.5 h-3.5 text-primary-600" />
              <span className="hidden sm:inline">Chapters ({totalPages})</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-surface-100 transition-colors"
              title={soundEnabled ? 'Mute Page Flip Sound' : 'Enable Page Flip Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-primary-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              title="Close Book (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── READING ENVIRONMENT & 3D DESK ── */}
        <div className="relative flex-1 bg-surface-100 flex items-center justify-center p-2 sm:p-5 md:p-6 overflow-hidden">
          
          {/* TABLE OF CONTENTS DRAWER OVERLAY */}
          {isTocOpen && (
            <div className="absolute top-0 bottom-0 left-0 w-72 sm:w-84 bg-white/98 backdrop-blur-md border-r border-surface-200 z-30 shadow-2xl p-4 flex flex-col animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-primary-600" />
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Book Index (10 Chapters)</h4>
                </div>
                <button 
                  onClick={() => setIsTocOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-surface-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
                {module.pages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      goToPage(idx, idx > currentPageIndex ? 'next' : 'prev');
                      setIsTocOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                      currentPageIndex === idx
                        ? 'bg-primary-50 text-primary-800 font-bold border border-primary-200 shadow-2xs'
                        : 'text-gray-700 hover:bg-surface-50 border border-transparent'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      currentPageIndex === idx ? 'bg-primary-600 text-white' : 'bg-surface-200 text-gray-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{t(p.title)}</p>
                      <p className="text-[10px] text-gray-500 truncate">{t(p.subtitle)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 3D REALISTIC BOOK CONTAINER WITH SPINE & DUAL PAGE SPREAD ── */}
          <div 
            className="relative w-full max-w-5xl h-full max-h-[720px] flex shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-surface-300"
            style={{ perspective: '2000px' }}
          >
            
            {/* ── LEFT PAGE: PREVIOUS CHAPTER (already read) — Desktop Only ── */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-l from-surface-50 via-white to-surface-100/60 flex-col justify-between relative overflow-hidden border-r border-surface-200/50">
              {/* Subtle page lines texture */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, #94a3b8 27px, #94a3b8 28px)' }} />
              
              {currentPageIndex > 0 ? (
                /* Show previous chapter content (already flipped page) */
                <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto relative z-10">
                  <div>
                    {/* Previous Page Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-surface-200/60 mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                          Chapter {currentPageIndex} of {totalPages}
                        </span>
                        <h3 className="text-base font-black text-gray-400 tracking-tight">
                          {t(module.pages[currentPageIndex - 1].title)}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-surface-100 text-gray-400 px-2.5 py-1 rounded-md border border-surface-200 shrink-0">
                        Page {currentPageIndex}
                      </span>
                    </div>

                    {/* Previous Page Content (faded, already read) */}
                    <div className="opacity-50 pointer-events-none">
                      {module.pages[currentPageIndex - 1].content && (
                        <MarkdownContent content={t(module.pages[currentPageIndex - 1].content)} />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* First page: show book cover info on left */
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 text-center">
                  <span className={`text-xs font-black px-3 py-1.5 rounded-lg text-white bg-gradient-to-r ${module.themeColor.cover} shadow-md mb-4`}>
                    MODULE {module.moduleNumber}
                  </span>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-snug mb-3">
                    {t(module.title)}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 max-w-xs">
                    {t(module.subtitle)}
                  </p>
                  
                  {/* Mini chapter list preview */}
                  <div className="w-full max-w-xs space-y-1.5 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">
                      {totalPages} Chapters
                    </span>
                    {module.pages.slice(0, 5).map((pg, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500 py-1">
                        <span className="w-4 h-4 rounded-full bg-surface-200 text-[9px] flex items-center justify-center font-bold text-gray-500 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium">{t(pg.title).replace(/^Chapter \d+:\s*/, '')}</span>
                      </div>
                    ))}
                    {totalPages > 5 && (
                      <span className="text-[10px] text-gray-400 font-bold pl-6">+ {totalPages - 5} more chapters...</span>
                    )}
                  </div>

                  {/* Language tip */}
                  <div className="mt-6 p-3 bg-white rounded-xl border border-surface-200 shadow-2xs flex items-start gap-2.5 max-w-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-600 leading-snug font-medium text-left">
                      Switch between <strong>English</strong>, <strong>Hinglish</strong>, and <strong>Hindi</strong> anytime!
                    </p>
                  </div>
                </div>
              )}

              {/* Page curl shadow on right edge of left page */}
              <div className="absolute top-0 bottom-0 right-0 w-6 pointer-events-none z-20 bg-gradient-to-l from-black/[0.08] to-transparent" />
            </div>

            {/* REALISTIC BOOK BINDING SHADOW (CENTER SPINE) */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-30">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-black/[0.12] to-transparent" />
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/20" />
            </div>

            {/* ── RIGHT PAGE: CURRENT CHAPTER CONTENT WITH 3D FLIP ANIMATION ── */}
            <div 
              className={`flex-1 md:w-1/2 flex flex-col justify-between p-5 sm:p-8 bg-white overflow-y-auto relative ${
                isFlipping 
                  ? (turnDirection === 'next' 
                      ? 'book-page-flip-next' 
                      : 'book-page-flip-prev') 
                  : ''
              }`}
            >
              {/* Page curl shadow on left edge of right page */}
              <div className="hidden md:block absolute top-0 bottom-0 left-0 w-6 pointer-events-none z-20 bg-gradient-to-r from-black/[0.06] to-transparent" />

              <div className="relative z-10">
                {/* Chapter Header */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-200/80 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 block">
                      Chapter {currentPageIndex + 1} of {totalPages}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                      {t(currentPage.title)}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-surface-100 text-gray-500 px-2.5 py-1 rounded-md border border-surface-200 shadow-2xs shrink-0">
                    Page {currentPageIndex + 1}
                  </span>
                </div>

                {/* Chapter Subtitle */}
                {currentPage.subtitle && (
                  <p className="text-xs font-semibold text-gray-500 italic mb-4 leading-relaxed">
                    {t(currentPage.subtitle)}
                  </p>
                )}

                {/* ── 1. CLEAN MARKDOWN / CONTENT RENDERER ── */}
                {currentPage.content && (
                  <MarkdownContent content={t(currentPage.content)} />
                )}

                {/* Analogy Callout Box */}
                {currentPage.analogy && (
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs">
                    <h5 className="text-xs font-black text-amber-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t(currentPage.analogy.title)}</span>
                    </h5>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      {t(currentPage.analogy.text)}
                    </p>
                  </div>
                )}

                {/* Key Takeaway Box */}
                {currentPage.keyTakeaway && (
                  <div className="mt-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider block text-blue-800 mb-0.5">
                        Core Takeaway
                      </span>
                      <p className="text-xs font-semibold leading-snug">
                        {t(currentPage.keyTakeaway)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── 2. CASE STUDY CARD ── */}
                {currentPage.caseStudy && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-bold text-gray-800">
                        👤 Profile:
                      </span>
                      <span className="text-xs font-bold text-primary-700 bg-white px-2.5 py-0.5 rounded-md border border-surface-200">
                        {resolveLang(currentPage.caseStudy.studentName || currentPage.caseStudy[currentLang]?.studentName, currentLang)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl">
                      <span className="text-[11px] font-black text-red-700 uppercase tracking-wider block mb-0.5">
                        The Challenge:
                      </span>
                      <p className="text-xs text-red-950 font-medium leading-relaxed">
                        {resolveLang(currentPage.caseStudy.challenge || currentPage.caseStudy[currentLang]?.challenge, currentLang)}
                      </p>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider block mb-0.5">
                        The AI Approach:
                      </span>
                      <p className="text-xs text-blue-950 font-medium leading-relaxed whitespace-pre-line">
                        {resolveLang(currentPage.caseStudy.aiApproach || currentPage.caseStudy[currentLang]?.aiApproach, currentLang)}
                      </p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider block mb-0.5">
                        The Measured Result:
                      </span>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        {resolveLang(currentPage.caseStudy.result || currentPage.caseStudy[currentLang]?.result, currentLang)}
                      </p>
                    </div>

                    {(currentPage.caseStudy.quote || currentPage.caseStudy[currentLang]?.quote) && (
                      <div className="p-3 bg-surface-100 rounded-xl border border-surface-200 italic text-xs text-gray-700 text-center font-medium">
                        {resolveLang(currentPage.caseStudy.quote || currentPage.caseStudy[currentLang]?.quote, currentLang)}
                      </div>
                    )}
                  </div>
                )}

                {/* ── 3. TRY IT YOURSELF PROMPT LAB ── */}
                {currentPage.promptBox && (() => {
                  const pBox = currentPage.promptBox[currentLang] || currentPage.promptBox.en || currentPage.promptBox;
                  return (
                    <div className="mt-4 space-y-3">
                      <div className="p-3.5 bg-gradient-to-r from-surface-50 to-primary-50/40 rounded-xl border border-primary-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-primary-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                            {pBox.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full">
                            Tested & Verified
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          {pBox.description}
                        </p>
                      </div>

                      {/* Monospace Prompt Box */}
                      <div className="relative bg-slate-900 rounded-xl p-3.5 sm:p-4 text-white shadow-md">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Prompt Blueprint ({currentLang.toUpperCase()})
                          </span>

                          <button
                            onClick={() => handleCopyPrompt(pBox.promptText)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              copiedPrompt 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
                            }`}
                          >
                            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                          </button>
                        </div>

                        <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                          {pBox.promptText}
                        </pre>
                      </div>

                      {/* Launch Shortcuts */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-gray-500">
                          Run instantly on:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenChatGPT(pBox.promptText)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                          >
                            <span>Open in ChatGPT</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            onClick={handleOpenGemini}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                          >
                            <span>Open in Gemini</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── 4. QUIZ CHECKPOINT ── */}
                {currentPage.quiz && (() => {
                  const qObj = currentPage.quiz[currentLang] || currentPage.quiz.en || currentPage.quiz;
                  return (
                    <div className="mt-4 space-y-3.5">
                      <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-xl shadow-2xs">
                        <div className="flex items-center gap-2 text-primary-700 text-xs font-bold mb-1">
                          <HelpCircle className="w-4 h-4" />
                          <span>Knowledge Checkpoint</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                          {qObj.question}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {qObj.options.map((opt, optIdx) => {
                          const isSelected = selectedQuizAnswers[currentPageIndex] === optIdx;
                          const hasAnswered = selectedQuizAnswers[currentPageIndex] !== undefined;
                          const isCorrect = optIdx === qObj.correctIndex;

                          let style = 'bg-white border-surface-200 hover:border-primary-400 text-gray-800';
                          if (hasAnswered) {
                            if (isCorrect) {
                              style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              style = 'bg-red-50 border-red-300 text-red-900 font-bold';
                            } else {
                              style = 'bg-white border-surface-200 text-gray-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setSelectedQuizAnswers({
                                  ...selectedQuizAnswers,
                                  [currentPageIndex]: optIdx
                                });
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                              )}
                              {hasAnswered && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {selectedQuizAnswers[currentPageIndex] !== undefined && (
                        <div className="p-3 rounded-xl bg-surface-100 border border-surface-200 text-xs text-gray-700 leading-relaxed animate-fadeIn">
                          <span className="font-bold text-gray-900 block mb-0.5">Explanation:</span>
                          {qObj.explanation}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── FOOTER CONTROLS (NEXT / PREV) ── */}
              <div className="pt-5 mt-5 border-t border-surface-200/90 flex items-center justify-between relative z-10">
                <button
                  onClick={handlePrev}
                  disabled={currentPageIndex === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentPageIndex === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'bg-surface-100 hover:bg-surface-200 text-gray-800 active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-gray-500 md:hidden">
                  {currentPageIndex + 1} / {totalPages}
                </span>

                {currentPageIndex < totalPages - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-xs hover:shadow-sm active:scale-95 transition-all"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Book</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default BookReaderModal;
