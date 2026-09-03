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
      className="bg-white rounded-card border border-surface-200 shadow-subtle p-5 sm:p-6 scroll-mt-20 transition"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 text-xs font-bold flex items-center justify-center border border-primary-200">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Question {index + 1}
          </span>
        </div>

        {question.topic && (
          <span className="text-[11px] font-medium text-gray-500 bg-surface-100 px-2 py-0.5 rounded border border-surface-200">
            {question.topic}
          </span>
        )}
      </div>

      {/* Question Text with KaTeX formulas */}
      <div className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed mb-5">
        <MathRenderer text={question.question} />
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const letter = OPTION_LABELS[optIdx] || String.fromCharCode(65 + optIdx);

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelectOption(question.id, optIdx)}
              className={`w-full text-left p-3.5 rounded-card border text-sm transition flex items-start gap-3 group ${
                isSelected
                  ? 'border-primary-600 bg-primary-50/70 text-primary-950 font-medium ring-1 ring-primary-600'
                  : 'border-surface-300 bg-white hover:border-primary-400 hover:bg-surface-50 text-gray-800'
              }`}
            >
              {/* Option Letter Pill */}
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700 border border-surface-300'
                }`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-0.5">
                <MathRenderer text={option} />
              </div>

              {/* Select Indicator */}
              <div className="shrink-0 pt-0.5">
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
