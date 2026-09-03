import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export function ShareQuizModal({ isOpen, onClose, sharedQuizId, onShowToast }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen || !sharedQuizId || typeof document === 'undefined') return null;

  const shareUrl = `${window.location.origin}/?quiz_id=${sharedQuizId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (onShowToast) onShowToast('Share link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (onShowToast) onShowToast('Could not copy automatically. Please copy the link manually.', 'error');
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `📚 Take this AI-generated Practice Test on Prepo.ai:\n\n${shareUrl}\n\nInstant scoring and step-by-step solutions provided!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Share Quiz with Students</h3>
              <p className="text-xs text-gray-500">Students can attempt test directly without signing up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* URL Box */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Unique Student Test Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 py-2.5 px-3.5 text-xs bg-surface-50 border border-surface-300 rounded-xl font-mono text-gray-800 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>
            
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-surface-100 hover:bg-surface-200 text-gray-800 text-xs font-bold rounded-xl border border-surface-300 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Test</span>
            </a>
          </div>

          {/* Highlights */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Teacher Live Leaderboard Enabled</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              When students submit their answers, their scores and timestamps will automatically be recorded under your <strong>Teacher Dashboard</strong> in real time.
            </p>
          </div>
        </div>

        <div className="bg-surface-50 px-6 py-4 border-t border-surface-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ShareQuizModal;
