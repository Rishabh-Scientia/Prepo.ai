import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { processPayment } from '../../services/payment';
import { X, Coins, Check, Sparkles, Loader2, ShieldCheck, Zap } from 'lucide-react';

export function BuyCreditsModal({ onPaymentSuccess, onShowToast }) {
  const { 
    isBuyCreditsModalOpen, 
    closeBuyCreditsModal, 
    credits, 
    user, 
    displayName, 
    fetchCredits 
  } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);

  useEffect(() => {
    if (isBuyCreditsModalOpen) {
      loadPlans();
    }
  }, [isBuyCreditsModalOpen]);

  useEffect(() => {
    if (!isBuyCreditsModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !purchasingPlanId) {
        closeBuyCreditsModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBuyCreditsModalOpen, purchasingPlanId, closeBuyCreditsModal]);

  useEffect(() => {
    if (isBuyCreditsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBuyCreditsModalOpen]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPaymentPlans();
      if (data && data.plans && data.plans.length > 0) {
        setPlans(data.plans);
      } else {
        setPlans([
          { plan_id: 'plan_30', name: 'Starter Pack', amount: 900, currency: 'INR', credits: 30, price_display: '₹9', per_quiz: '₹0.30', description: '30 AI Quiz Generations', badge: 'Starter', popular: false },
          { plan_id: 'plan_100', name: 'Pro Pack', amount: 2900, currency: 'INR', credits: 100, price_display: '₹29', per_quiz: '₹0.29', description: '100 AI Quiz Generations', badge: 'Best Value', popular: true },
        ]);
      }
    } catch (err) {
      console.warn('Could not load payment plans:', err.message);
      setPlans([
        { plan_id: 'plan_30', name: 'Starter Pack', amount: 900, currency: 'INR', credits: 30, price_display: '₹9', per_quiz: '₹0.30', description: '30 AI Quiz Generations', badge: 'Starter', popular: false },
        { plan_id: 'plan_100', name: 'Pro Pack', amount: 2900, currency: 'INR', credits: 100, price_display: '₹29', per_quiz: '₹0.29', description: '100 AI Quiz Generations', badge: 'Best Value', popular: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (plan) => {
    const planId = plan.plan_id || plan.id;
    setPurchasingPlanId(planId);
    await processPayment({
      planId,
      userEmail: user?.email,
      userName: displayName,
      onSuccess: async (res) => {
        setPurchasingPlanId(null);
        closeBuyCreditsModal();
        await fetchCredits();
        if (onShowToast) {
          onShowToast(`🎉 Payment Successful! ${plan.credits} credits added to your account!`, 'success');
        }
        if (onPaymentSuccess) onPaymentSuccess(res);
      },
      onError: (err) => {
        setPurchasingPlanId(null);
        if (onShowToast) {
          onShowToast(err.message || 'Payment could not be completed.', 'error');
        }
      },
      onDismiss: () => {
        setPurchasingPlanId(null);
      },
    });
  };

  if (!isBuyCreditsModalOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (!purchasingPlanId) closeBuyCreditsModal();
      }}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-xl overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-primary-600 via-primary-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Top Up Quiz Credits</h2>
              <p className="text-xs text-primary-100">
                You currently have <span className="font-bold text-amber-300">{credits} credits</span> remaining
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBuyCreditsModal}
            disabled={purchasingPlanId !== null}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
              <span className="text-sm font-medium">Loading available credit packs...</span>
            </div>
          ) : (
            <div className={`grid gap-4 ${plans.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {plans.map((plan) => {
                const planId = plan.plan_id || plan.id;
                const priceInRupees = plan.price_display || `₹${Math.round((plan.amount || 0) / 100)}`;
                const perQuiz = plan.per_quiz || '';

                return (
                  <div
                    key={planId}
                    className={`relative rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                      plan.popular
                        ? 'border-primary-500 bg-primary-50/40 shadow-md ring-2 ring-primary-500/20'
                        : 'border-surface-200 bg-white hover:border-primary-300 hover:shadow-subtle'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {plan.badge || 'Best Value'}
                      </div>
                    )}

                    {!plan.popular && plan.badge && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-surface-100 px-2 py-0.5 rounded border border-surface-200">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{plan.name}</h3>
                      
                      {/* Price Display */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{priceInRupees}</span>
                        {perQuiz && (
                          <span className="text-xs text-gray-500 font-semibold">({perQuiz}/quiz)</span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mt-4 space-y-2.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2 font-bold text-primary-800">
                          <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{plan.credits} AI Quiz Credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Topic & PDF Generation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Step-by-step AI solutions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>No expiration date</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(plan)}
                      disabled={purchasingPlanId !== null}
                      className={`mt-6 w-full py-2.5 px-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-200 hover:shadow-md'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {purchasingPlanId === planId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Opening Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Get {plan.credits} Credits</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Secure Payment Guarantee */}
          <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Secure Checkout powered by Razorpay (UPI, Cards, NetBanking)</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BuyCreditsModal;
