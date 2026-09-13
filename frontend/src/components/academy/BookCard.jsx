import React from 'react';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  PenTool, 
  Search, 
  GraduationCap, 
  FileText, 
  Palette, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Globe,
  Lock
} from 'lucide-react';
import { resolveLang } from '../../data/aiAcademyCourses';

const ICON_MAP = {
  Bot,
  Brain,
  MessageSquare,
  PenTool,
  Search,
  GraduationCap,
  FileText,
  Palette,
  Image: ImageIcon,
  Video
};

export function BookCard({ module, onOpenBook, isLocked = false, onLockedClick }) {
  const IconComponent = ICON_MAP[module.icon] || BookOpen;
  const title = resolveLang(module.title, 'en');
  const summary = resolveLang(module.summary, 'en');
  const totalChapters = module.pages ? module.pages.length : 10;

  const handleClick = () => {
    if (isLocked) {
      if (onLockedClick) onLockedClick();
    } else {
      onOpenBook(module);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden ${
        isLocked 
          ? 'border-amber-200/90 shadow-sm hover:border-amber-400 hover:shadow-lg' 
          : 'border-surface-200/90 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* ── TOP 3D BOOK COVER VISUAL ── */}
      <div className={`relative h-48 p-5 bg-gradient-to-br ${module.themeColor.cover} text-white flex flex-col justify-between overflow-hidden`}>
        {/* Realistic Book Spine Shadow on Left Edge */}
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-black/30 border-r border-white/20 shadow-inner z-10" />
        <div className="absolute top-0 bottom-0 left-4 w-2 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />

        {/* Realistic Book Spine Crease & Top Highlights */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

        {/* Lock Overlay / Bookmark Ribbon */}
        {isLocked ? (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/40 text-amber-300 text-[10px] font-extrabold shadow-md">
            <Lock className="w-3 h-3" />
            <span>Student Pack</span>
          </div>
        ) : (
          <div className="absolute -top-1 right-6 w-5 h-9 bg-amber-400 shadow-md flex items-end justify-center pb-1 z-10">
            <div className="w-0 h-0 border-x-[10px] border-x-transparent border-b-[6px] border-b-white/0" />
          </div>
        )}

        {/* Top Header Row inside Cover */}
        <div className="relative z-10 flex items-center justify-between pl-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-black tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Module {module.moduleNumber < 10 ? `0${module.moduleNumber}` : module.moduleNumber}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform mr-5">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title on Book Cover */}
        <div className="relative z-10 pl-3">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-amber-300 uppercase tracking-widest mb-1">
            <Globe className="w-3 h-3" />
            <span>EN • HINGLISH • हिंदी</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug line-clamp-2 drop-shadow-xs">
            {title}
          </h3>
        </div>

        {/* Book Page Edges Simulation (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-b from-black/15 to-white/40 flex flex-col justify-end">
          <div className="h-[1px] bg-white/60 w-full" />
        </div>
      </div>

      {/* ── CARD BODY (Summary & Metadata) ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Tags Row */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${module.themeColor.badge}`}>
              {module.level}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{module.readTime}</span>
            </div>
            <span className="text-[11px] font-bold text-primary-600">• {totalChapters} Chapters</span>
          </div>

          {/* Subtitle / Description */}
          <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed mb-3">
            {summary}
          </p>
        </div>

        {/* ── FOOTER ACTION: OPEN BOOK OR UPGRADE ── */}
        <div className="pt-3 border-t border-surface-200/80 flex items-center justify-between">
          {isLocked ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Unlock with Student Pack (₹19)</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-xs shadow-2xs group-hover:scale-105 transition-all">
                Upgrade
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-700 group-hover:underline">
                <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                <span>Read 10 Chapters</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-surface-100 group-hover:bg-primary-600 text-gray-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
