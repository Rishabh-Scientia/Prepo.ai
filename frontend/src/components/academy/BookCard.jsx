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
  ArrowRight
} from 'lucide-react';

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

export function BookCard({ module, onOpenBook }) {
  const IconComponent = ICON_MAP[module.icon] || BookOpen;

  return (
    <div 
      onClick={() => onOpenBook(module)}
      className="group relative flex flex-col bg-white rounded-2xl border border-surface-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
    >
      {/* ── TOP 3D BOOK COVER VISUAL ── */}
      <div className={`relative h-44 p-5 bg-gradient-to-br ${module.themeColor.cover} text-white flex flex-col justify-between overflow-hidden`}>
        {/* Realistic Book Spine Shadow on Left Edge */}
        <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-black/25 border-r border-white/20 shadow-inner z-10" />
        <div className="absolute top-0 bottom-0 left-3.5 w-1.5 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />

        {/* Realistic Book Spine Crease & Top Highlights */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

        {/* Bookmark Ribbon on top right */}
        <div className="absolute -top-1 right-6 w-5 h-8 bg-amber-400 shadow-md flex items-end justify-center pb-1">
          <div className="w-0 h-0 border-x-[10px] border-x-transparent border-b-[6px] border-b-white/0" />
        </div>

        {/* Top Header Row inside Cover */}
        <div className="relative z-10 flex items-center justify-between pl-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-black tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Module {module.moduleNumber < 10 ? `0${module.moduleNumber}` : module.moduleNumber}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title on Book Cover */}
        <div className="relative z-10 pl-2">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest block mb-0.5">
            Interactive Digital Book
          </span>
          <h3 className="text-xl font-black text-white tracking-tight leading-snug line-clamp-2 drop-shadow-xs">
            {module.title}
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
            <span className="text-[11px] font-medium text-gray-400">• {module.pages.length} Chapters</span>
          </div>

          {/* Subtitle / Description */}
          <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed mb-3">
            {module.summary}
          </p>
        </div>

        {/* ── FOOTER ACTION: OPEN BOOK ── */}
        <div className="pt-3 border-t border-surface-200/80 flex items-center justify-between">
          <span className="text-[11px] font-bold text-primary-700 flex items-center gap-1.5 group-hover:underline">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Book</span>
          </span>

          <div className="w-7 h-7 rounded-lg bg-surface-100 group-hover:bg-primary-600 text-gray-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:translate-x-0.5">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
