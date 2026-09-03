import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export function ConfirmModal({ 
  isOpen, 
  title = 'Delete Item?', 
  description = 'Are you sure you want to proceed? This action cannot be undone.', 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  isDanger = true,
  isLoading = false 
}) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isDanger 
                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                : 'bg-primary-50 text-primary-600 border border-primary-100'
            }`}>
              {isDanger ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed break-words">{description}</p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-surface-100 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-surface-50 px-6 py-4 border-t border-surface-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition-all shadow-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 hover:shadow-md'
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200 hover:shadow-md'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Deleting...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
