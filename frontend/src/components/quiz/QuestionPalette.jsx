import React from 'react';
import { Check } from 'lucide-react';

export function QuestionPalette({ questions = [], selectedAnswers = {}, onSelectQuestion }) {
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;

  return (
    <div className="bg-white rounded-card border border-surface-200 p-4 shadow-subtle">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-100 text-xs font-semibold text-gray-700">
        <span>Question Palette</span>
        <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
          {answeredCount} / {totalCount} Answered
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          return (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => onSelectQuestion(q.id || idx)}
              className={`h-8 rounded-card text-xs font-bold transition flex items-center justify-center relative ${
                isAnswered
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-50 text-gray-700 border border-surface-300 hover:border-primary-400'
              }`}
            >
              <span>{idx + 1}</span>
              {isAnswered && (
                <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-white/80" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionPalette;
