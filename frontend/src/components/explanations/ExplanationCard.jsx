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
  Target,
  MinusCircle
} from 'lucide-react';

export function ExplanationCard({ result, index }) {
  const [isOpen, setIsOpen] = useState(true);

  const questionText = result.question_text || result.question || '';
  const userChoice = result.selected_option || result.user_answer || '';
  const isUnanswered = !userChoice || userChoice === '(no answer)';
  const isCorrect = !!result.is_correct;

  // Handle explanation object or string
  let expl = result.explanation || {};
  if (typeof expl === 'string') {
    try {
      expl = JSON.parse(expl);
    } catch {
      expl = { reasoning: expl };
    }
  }

  // 4 AI Explanation Blocks
  const confirmation = expl.confirmation || expl.verdict || (
    isCorrect ? 'Correct! Well done.' : isUnanswered ? 'You did not attempt this question.' : 'Incorrect answer.'
  );
  const coreConcept = expl.core_concept || '';
  const reasoning = expl.reasoning || expl.step_by_step_reasoning || '';
  const misconception = expl.why_incorrect_option_wrong || expl.misconception_analysis || '';

  return (
    <div className={`rounded-2xl border-2 transition-all overflow-hidden shadow-subtle ${
      isCorrect 
        ? 'border-emerald-200 bg-white' 
        : isUnanswered
        ? 'border-gray-200 bg-white'
        : 'border-rose-200 bg-white'
    }`}>
      
      {/* ── HEADER ACCORDION TRIGGER ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-surface-50/70 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isCorrect 
              ? 'bg-emerald-100 text-emerald-700' 
              : isUnanswered
              ? 'bg-gray-100 text-gray-500'
              : 'bg-rose-100 text-rose-700'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isUnanswered ? (
              <MinusCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Question {index + 1}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isUnanswered
                  ? 'bg-gray-100 text-gray-600 border border-gray-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {isCorrect ? 'Correct (+1)' : isUnanswered ? 'Not Attempted (0)' : 'Incorrect (0)'}
              </span>
            </div>

            <div className="text-sm font-semibold text-gray-900 leading-snug">
              <MathRenderer text={questionText} />
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
              const isOptionUserChoice = (opt === userChoice) || (userChoice === letter);
              const isOptionCorrectChoice = (opt === result.correct_answer) || (result.correct_answer === letter);

              let badgeStyle = 'bg-surface-50 border-surface-200 text-gray-700';
              if (isOptionCorrectChoice) {
                badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold ring-2 ring-emerald-400/30';
              } else if (isOptionUserChoice && !isCorrect) {
                badgeStyle = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold ring-2 ring-rose-400/30';
              }

              return (
                <div
                  key={optIdx}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${badgeStyle}`}
                >
                  <span className="font-bold shrink-0 text-gray-500">{letter}.</span>
                  <div className="flex-1 leading-relaxed">
                    <MathRenderer text={opt} />
                  </div>
                  {isOptionCorrectChoice && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      ✓ Correct
                    </span>
                  )}
                  {isOptionUserChoice && !isCorrect && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      ✗ Your answer
                    </span>
                  )}
                  {isOptionUserChoice && isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      ✓ Your answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4-Part AI Breakdown Box */}
          <div className="bg-surface-50 rounded-2xl border border-surface-200 p-5 space-y-4 text-xs">
            
            {/* 1. Verdict */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-gray-900 block mb-0.5 text-xs uppercase tracking-wider">1. Verdict</span>
                <p className="text-gray-700 leading-relaxed font-medium">
                  <MathRenderer text={confirmation} />
                </p>
              </div>
            </div>

            {/* 2. Core Concept */}
            {coreConcept && (
              <div className="flex items-start gap-3 pt-3 border-t border-surface-200">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block mb-0.5 text-xs uppercase tracking-wider">2. Core Concept Tested</span>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    <MathRenderer text={coreConcept} />
                  </p>
                </div>
              </div>
            )}

            {/* 3. Step-by-Step Reasoning */}
            {reasoning && (
              <div className="flex items-start gap-3 pt-3 border-t border-surface-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block mb-0.5 text-xs uppercase tracking-wider">3. Step-by-Step Reasoning</span>
                  <div className="text-gray-700 leading-relaxed space-y-1 font-medium">
                    <MathRenderer text={reasoning} />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Misconception Analysis / Why Incorrect */}
            {misconception && (
              <div className="flex items-start gap-3 pt-3 border-t border-surface-200">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block mb-0.5 text-xs uppercase tracking-wider">
                    {isCorrect ? '4. Common Misconception Others Make' : '4. Why Your Choice Was Incorrect'}
                  </span>
                  <p className="text-gray-700 leading-relaxed font-medium">
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
