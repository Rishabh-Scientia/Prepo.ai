import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Coins, Sparkles, X, ArrowRight } from 'lucide-react';

export function CreditLimitModal() {
  const { 
    isCreditLimitModalOpen, 
    closeCreditLimitModal, 
    openBuyCreditsModal 
  } = useAuth();

  useEffect(() => {
    if (!isCreditLimitModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeCreditLimitModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreditLimitModalOpen, closeCreditLimitModal]);

  useEffect(() => {
    if (isCreditLimitModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreditLimitModalOpen]);

  if (!isCreditLimitModalOpen || typeof document === 'undefined') return null;

  const handleOpenBuy = () => {
    closeCreditLimitModal();
    openBuyCreditsModal();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeCreditLimitModal}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
          <Coins className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Credit Limit Reached</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          You have exhausted your free AI quiz generation credits. Top up now starting at just <strong>₹9</strong> to continue generating mock tests.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleOpenBuy}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Buy Credits from ₹9</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeCreditLimitModal}
            className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CreditLimitModal;
