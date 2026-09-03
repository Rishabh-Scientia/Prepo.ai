import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { processPayment } from '../../services/payment';
import { X, Coins, Check, Sparkles, Loader2, ShieldCheck } from 'lucide-react';

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

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPaymentPlans();
      if (data && data.plans) {
        setPlans(data.plans);
      } else {
        // Fallback default plans
        setPlans([
          { id: 'plan_30', name: 'Starter Pack', credits: 30, price: 29, original_price: 49, popular: false },
          { id: 'plan_100', name: 'Pro Student', credits: 100, price: 79, original_price: 149, popular: true },
          { id: 'plan_250', name: 'Master Prep', credits: 250, price: 149, original_price: 299, popular: false },
        ]);
      }
    } catch (err) {
      console.warn('Could not load payment plans:', err.message);
      setPlans([
        { id: 'plan_30', name: 'Starter Pack', credits: 30, price: 29, original_price: 49, popular: false },
        { id: 'plan_100', name: 'Pro Student', credits: 100, price: 79, original_price: 149, popular: true },
        { id: 'plan_250', name: 'Master Prep', credits: 250, price: 149, original_price: 299, popular: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (plan) => {
    setPurchasingPlanId(plan.id);
    await processPayment({
      planId: plan.id,
      userEmail: user?.email,
      userName: displayName,
      onSuccess: async (res) => {
        setPurchasingPlanId(null);
        closeBuyCreditsModal();
        await fetchCredits();
        if (onShowToast) {
          onShowToast(`🎉 Successfully added ${plan.credits} credits to your account!`, 'success');
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

  if (!isBuyCreditsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-card border border-surface-200 shadow-elevated w-full max-w-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Top Up Quiz Credits</h2>
              <p className="text-xs text-primary-100">
                You currently have <span className="font-bold text-amber-300">{credits} credits</span> remaining
              </p>
            </div>
          </div>
          <button
            onClick={closeBuyCreditsModal}
            className="text-white/80 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-sm">Loading available credit packs...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-card border transition p-5 flex flex-col justify-between ${
                    plan.popular
                      ? 'border-primary-500 bg-primary-50/40 shadow-subtle ring-2 ring-primary-500/20'
                      : 'border-surface-300 bg-white hover:border-primary-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                      {plan.original_price && (
                        <span className="text-xs text-gray-400 line-through">₹{plan.original_price}</span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2 font-semibold text-primary-900">
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
                    className={`mt-6 w-full py-2 px-3 text-xs font-bold rounded-card transition flex items-center justify-center gap-1.5 shadow-sm ${
                      plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-surface-100 hover:bg-surface-200 text-gray-800 border border-surface-300'
                    }`}
                  >
                    {purchasingPlanId === plan.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening gateway...</span>
                      </>
                    ) : (
                      <span>Get {plan.credits} Credits</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Secure Payment Guarantee */}
          <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Secure Checkout powered by Razorpay (UPI, Cards, NetBanking)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyCreditsModal;
