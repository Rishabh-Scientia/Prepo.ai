import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  Layers, 
  BookOpen, 
  Award,
  Zap
} from 'lucide-react';

const GENERATE_STEPS = [
  { label: 'Analyzing syllabus blueprint & difficulty...', icon: BookOpen },
  { label: 'Formulating high-yield conceptual MCQs...', icon: Layers },
  { label: 'Crafting 4-part AI reasoning & explanations...', icon: Sparkles },
  { label: 'Finalizing question palette & test session...', icon: Zap },
];

const EVALUATE_STEPS = [
  { label: 'Recording your submitted responses & timing...', icon: Clock },
  { label: 'Evaluating answers with AI reasoning engine...', icon: BrainCircuit },
  { label: 'Generating personalized solution explanations...', icon: Sparkles },
  { label: 'Calculating score & performance analysis...', icon: Award },
];

export function LoadingModal({
  isOpen,
  type = 'generate', // 'generate' | 'evaluate'
  title,
  subtitle,
  customSteps,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(18);

  const steps = customSteps || (type === 'evaluate' ? EVALUATE_STEPS : GENERATE_STEPS);
  const defaultTitle = type === 'evaluate' ? 'Grading Your Practice Test' : 'Generating AI Practice Test';
  const defaultSubtitle = type === 'evaluate'
    ? 'Evaluating your answers with detailed 4-part reasoning...'
    : 'Curating exam-standard questions tailored to your syllabus...';

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentStepIndex(0);
      setProgressPercent(20);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Dynamic step progression & progress bar
  useEffect(() => {
    if (!isOpen) return;

    // Advance step every 2.4s
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2400);

    // Smooth progress simulation (starts fast, slows towards 90%)
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 45) return prev + 12;
        if (prev < 75) return prev + 6;
        if (prev < 90) return prev + 2;
        return prev;
      });
    }, 900);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, steps.length]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-surface-200/90 shadow-2xl p-6 sm:p-8 text-center overflow-hidden animate-scaleUp">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Type Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-5 border shadow-xs bg-primary-50 text-primary-700 border-primary-200">
          {type === 'evaluate' ? (
            <>
              <BrainCircuit className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
              <span>AI Evaluation Engine</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
              <span>AI Test Generator</span>
            </>
          )}
        </div>

        {/* Animated Central Graphic */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          {/* Ambient blur glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 blur-xl opacity-40 animate-pulse" />

          {/* Rotating outer orbit rings */}
          <div 
            className="absolute -inset-2.5 rounded-3xl border-2 border-transparent border-t-primary-500 border-r-indigo-400 animate-spin" 
            style={{ animationDuration: '3.5s' }}
          />
          <div 
            className="absolute -inset-4 rounded-full border border-primary-200/40 border-b-primary-400/60 animate-spin" 
            style={{ animationDuration: '7s', animationDirection: 'reverse' }}
          />

          {/* Main Icon Tile */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            {type === 'evaluate' ? (
              <BrainCircuit className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 id="loading-modal-title" className="text-xl font-extrabold text-gray-900 tracking-tight">
          {title || defaultTitle}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
          {subtitle || defaultSubtitle}
        </p>

        {/* Dynamic Progress Bar */}
        <div className="my-5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 mb-1.5 px-0.5">
            <span>Processing</span>
            <span className="font-mono text-primary-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden p-0.5 border border-surface-200">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary-600 via-indigo-500 to-primary-500 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Rotating Progression Steps Checklist */}
        <div className="space-y-2 text-left bg-surface-50/90 rounded-2xl p-3.5 border border-surface-200">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;
            const StepIcon = step.icon || Sparkles;

            return (
              <div 
                key={idx}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-white text-primary-800 font-bold border border-primary-200/80 shadow-xs' 
                    : isCompleted
                      ? 'text-gray-700 font-medium'
                      : 'text-gray-400 opacity-60'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Generating in real-time • Please keep this window open</span>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default LoadingModal;
