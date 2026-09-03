import React, { useState } from 'react';
import MathRenderer from '../common/MathRenderer';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  ListOrdered, 
  AlertTriangle, 
  Target 
} from 'lucide-react';

export function ExplanationCard({ result, index }) {
  const [isOpen, setIsOpen] = useState(true);

  const isCorrect = result.is_correct;
  const isUnanswered = !result.user_answer;

  const expl = result.explanation || {};
  const verdict = expl.verdict || (isCorrect ? 'Correct Answer' : isUnanswered ? 'Unanswered' : 'Incorrect Answer');
  const coreConcept = expl.core_concept || '';
  const stepByStep = expl.step_by_step_reasoning || '';
  const misconception = expl.misconception_analysis || '';

  return (
    <div className={`rounded-card border transition overflow-hidden shadow-subtle ${
      isCorrect 
        ? 'border-emerald-200 bg-white' 
        : 'border-red-200 bg-white'
    }`}>
      
      {/* ── HEADER ACCORDION TRIGGER ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-surface-50/70 transition"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            isCorrect 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Question {index + 1}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {isCorrect ? 'Correct (+1)' : isUnanswered ? 'Not Attempted (0)' : 'Incorrect (0)'}
              </span>
            </div>

            <div className="text-sm font-semibold text-gray-900 leading-snug">
              <MathRenderer text={result.question} />
            </div>
          </div>
        </div>

        <div className="text-gray-400 p-1 shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* ── EXPANDED BODY ── */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 space-y-4 border-t border-surface-100 pt-4">
          
          {/* Options Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {result.options && result.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isUserChoice = result.user_answer === letter;
              const isCorrectChoice = result.correct_answer === letter;

              let badgeStyle = 'bg-surface-50 border-surface-200 text-gray-700';
              if (isCorrectChoice) {
                badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold ring-1 ring-emerald-400';
              } else if (isUserChoice && !isCorrect) {
                badgeStyle = 'bg-red-50 border-red-300 text-red-800 font-semibold ring-1 ring-red-400';
              }

              return (
                <div
                  key={optIdx}
                  className={`p-2.5 rounded-card border flex items-start gap-2 ${badgeStyle}`}
                >
                  <span className="font-bold shrink-0">{letter}.</span>
                  <div className="flex-1">
                    <MathRenderer text={opt} />
                  </div>
                  {isCorrectChoice && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
                      Correct
                    </span>
                  )}
                  {isUserChoice && !isCorrect && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded shrink-0">
                      Your choice
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4-Part AI Breakdown Box */}
          <div className="bg-surface-50 rounded-card border border-surface-200 p-4 space-y-3.5 text-xs">
            
            {/* 1. Verdict */}
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-primary-100 text-primary-700 shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block mb-0.5">Verdict</span>
                <p className="text-gray-700 leading-relaxed">
                  <MathRenderer text={verdict} />
                </p>
              </div>
            </div>

            {/* 2. Core Concept */}
            {coreConcept && (
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-surface-200/80">
                <div className="p-1 rounded bg-amber-100 text-amber-700 shrink-0">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">Core Concept Tested</span>
                  <p className="text-gray-700 leading-relaxed">
                    <MathRenderer text={coreConcept} />
                  </p>
                </div>
              </div>
            )}

            {/* 3. Step-by-Step Reasoning */}
            {stepByStep && (
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-surface-200/80">
                <div className="p-1 rounded bg-emerald-100 text-emerald-700 shrink-0">
                  <ListOrdered className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">Step-by-Step Solution</span>
                  <div className="text-gray-700 leading-relaxed space-y-1">
                    <MathRenderer text={stepByStep} />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Misconception Analysis */}
            {misconception && (
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-surface-200/80">
                <div className="p-1 rounded bg-rose-100 text-rose-700 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">Common Misconceptions & Distractors</span>
                  <p className="text-gray-700 leading-relaxed">
                    <MathRenderer text={misconception} />
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}

export default ExplanationCard;
