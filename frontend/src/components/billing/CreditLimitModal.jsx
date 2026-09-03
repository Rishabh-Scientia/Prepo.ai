import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Coins, Sparkles, X, ArrowRight } from 'lucide-react';

export function CreditLimitModal() {
  const { 
    isCreditLimitModalOpen, 
    closeCreditLimitModal, 
    openBuyCreditsModal 
  } = useAuth();

  if (!isCreditLimitModalOpen) return null;

  const handleOpenBuy = () => {
    closeCreditLimitModal();
    openBuyCreditsModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-card border border-surface-200 shadow-elevated w-full max-w-md overflow-hidden animate-scaleUp text-center p-6">
        
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Coins className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">Credit Limit Reached</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          You have exhausted your free AI quiz generation credits. Upgrade to a credit pack starting at just ₹29 to continue practicing.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleOpenBuy}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-card transition shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Buy Credits from ₹29</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeCreditLimitModal}
            className="w-full py-2 px-4 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreditLimitModal;
