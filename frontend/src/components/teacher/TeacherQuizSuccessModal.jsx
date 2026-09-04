import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Share2, 
  PlayCircle, 
  LayoutDashboard, 
  X, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export function TeacherQuizSuccessModal({ 
  isOpen, 
  onClose, 
  quizData, 
  onShareQuiz, 
  onSolveQuiz, 
  onGoToDashboard 
}) {
  if (!isOpen || !quizData || typeof document === 'undefined') return null;

  const config = quizData.config || {};
  const questionCount = quizData.questions ? quizData.questions.length : 10;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-indigo-600 via-primary-600 to-indigo-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">
                Teacher Classroom Suite
              </span>
              <h3 className="text-lg font-black text-white leading-snug">
                Assessment Created Successfully!
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-indigo-100">
            <div>
              <strong className="text-white block font-bold text-sm">
                {config.chapter || config.subject || 'Custom Quiz'}
              </strong>
              <span className="text-indigo-200 text-[11px]">
                {config.subject} • {config.class_level || 'General'}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-white/15 rounded-lg font-mono font-bold text-xs">
              {questionCount} Questions
            </span>
          </div>
        </div>

        {/* Action Choices */}
        <div className="p-6 space-y-3.5 bg-surface-50/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Choose Next Step:
          </p>

          {/* Option 1: Share with Students */}
          <button
            type="button"
            onClick={onShareQuiz}
            className="w-full p-4 bg-white hover:bg-indigo-50/40 border-2 border-indigo-500 rounded-xl transition-all shadow-sm hover:shadow-md text-left flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    Share Test with Students
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Generate instant link with timers, QR code, and WhatsApp share.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>

          {/* Option 2: Solve / Preview Yourself */}
          <button
            type="button"
            onClick={onSolveQuiz}
            className="w-full p-4 bg-white hover:bg-primary-50/40 border border-surface-200 hover:border-primary-300 rounded-xl transition-all shadow-xs hover:shadow-sm text-left flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Take / Preview Test Myself
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Inspect the questions and solve it under realistic test conditions.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-surface-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="text-xs font-bold text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Go to Classroom Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-surface-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default TeacherQuizSuccessModal;
