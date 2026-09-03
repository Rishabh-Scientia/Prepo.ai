import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export function ErrorModal({ isOpen, message, onRetry, onClose }) {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-card border border-surface-200 shadow-elevated w-full max-w-md overflow-hidden animate-scaleUp">
        <div className="p-5 flex items-start gap-3.5">
          <div className="p-2.5 rounded-card bg-red-50 text-red-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">Something went wrong</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed break-words">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-surface-50 px-5 py-3.5 border-t border-surface-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-surface-300 rounded-card hover:bg-surface-100 transition"
          >
            Close
          </button>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-card hover:bg-primary-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
