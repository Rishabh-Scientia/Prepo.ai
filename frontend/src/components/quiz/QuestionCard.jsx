import React from 'react';
import MathRenderer from '../common/MathRenderer';
import { CheckCircle2, Circle } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function QuestionCard({ 
  question, 
  index, 
  selectedOption, 
  onSelectOption 
}) {
  return (
    <div 
      id={`question-${question.id || index}`}
      className="bg-white rounded-lg border border-surface-200 shadow-subtle overflow-hidden scroll-mt-20 transition hover:shadow-elevated"
    >
      {/* Header Bar */}
      <div className="px-5 py-3 bg-surface-50/80 border-b border-surface-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Question {index + 1}
          </span>
        </div>

        {question.topic && (
          <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
            {question.topic}
          </span>
        )}
      </div>

      {/* Question Text */}
      <div className="px-5 pt-4 pb-2">
        <div className="text-[15px] font-semibold text-gray-900 leading-relaxed">
          <MathRenderer text={question.question} />
        </div>
      </div>

      {/* Options */}
      <div className="px-5 pb-5 pt-2 space-y-2.5">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const letter = OPTION_LABELS[optIdx] || String.fromCharCode(65 + optIdx);

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelectOption(question.id, optIdx)}
              className={`w-full text-left px-4 py-3.5 rounded-lg border-2 text-sm transition-all duration-150 flex items-center gap-3 group ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-950 font-medium shadow-sm'
                  : 'border-surface-200 bg-white hover:border-primary-300 hover:bg-primary-50/30 text-gray-800'
              }`}
            >
              {/* Option Letter Circle */}
              <div
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm scale-105'
                    : 'bg-surface-100 text-gray-600 border border-surface-300 group-hover:bg-primary-100 group-hover:text-primary-700 group-hover:border-primary-300'
                }`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 leading-relaxed">
                <MathRenderer text={option} />
              </div>

              {/* Radio Circle */}
              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;
