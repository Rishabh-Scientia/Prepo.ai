import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { processPayment } from '../../services/payment';
import { X, Coins, Check, Sparkles, Loader2, ShieldCheck, Zap, BookOpen, GraduationCap, XCircle } from 'lucide-react';

export function BuyCreditsModal({ onPaymentSuccess, onShowToast }) {
  const { 
    isBuyCreditsModalOpen, 
    closeBuyCreditsModal, 
    credits, 
    plan: currentPlan = 'free',
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
          {
            plan_id: 'plan_student',
            name: 'Student Pack',
            amount: 1900,
            currency: 'INR',
            credits: 50,
            max_questions: 15,
            price_display: '₹19',
            per_quiz: '₹0.38',
            description: '50 AI Quizzes (up to 15 questions each), All 10 AI Academy modules unlocked',
            badge: 'Student Choice',
            popular: true,
            theme: 'blue',
            has_teacher_access: false,
          },
          {
            plan_id: 'plan_teacher',
            name: 'Teacher Pack',
            amount: 4900,
            currency: 'INR',
            credits: 100,
            max_questions: 20,
            price_display: '₹49',
            per_quiz: '₹0.49',
            description: '100 AI Quizzes (up to 20 questions each), Full Teacher Mode with quiz sharing & student tracking, All modules unlocked',
            badge: 'Teacher Pro',
            popular: false,
            theme: 'green',
            has_teacher_access: true,
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not load payment plans:', err.message);
      setPlans([
        {
          plan_id: 'plan_student',
          name: 'Student Pack',
          amount: 1900,
          currency: 'INR',
          credits: 50,
          max_questions: 15,
          price_display: '₹19',
          per_quiz: '₹0.38',
          description: '50 AI Quizzes (up to 15 questions each), All 10 AI Academy modules unlocked',
          badge: 'Student Choice',
          popular: true,
          theme: 'blue',
          has_teacher_access: false,
        },
        {
          plan_id: 'plan_teacher',
          name: 'Teacher Pack',
          amount: 4900,
          currency: 'INR',
          credits: 100,
          max_questions: 20,
          price_display: '₹49',
          per_quiz: '₹0.49',
          description: '100 AI Quizzes (up to 20 questions each), Full Teacher Mode with quiz sharing & student tracking, All modules unlocked',
          badge: 'Teacher Pro',
          popular: false,
          theme: 'green',
          has_teacher_access: true,
        },
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
          onShowToast(`🎉 Payment Successful! ${plan.credits} credits added & ${plan.name} activated!`, 'success');
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
      className="fixed inset-0 z-[100] overflow-y-auto p-3 sm:p-4 bg-black/75 backdrop-blur-sm flex min-h-full items-center justify-center animate-fadeIn"
      onClick={() => {
        if (!purchasingPlanId) closeBuyCreditsModal();
      }}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="shrink-0 px-5 sm:px-6 py-4 bg-gradient-to-r from-gray-900 via-primary-900 to-blue-950 text-white flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">Choose Your Prepo.ai Pack</h2>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  currentPlan === 'teacher'
                    ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
                    : currentPlan === 'student'
                    ? 'bg-blue-900/80 text-blue-200 border-blue-500/40'
                    : 'bg-white/20 text-gray-200 border-white/30'
                }`}>
                  Current: {currentPlan === 'teacher' ? 'Teacher Pack' : currentPlan === 'student' ? 'Student Pack' : 'Free Tier'}
                </span>
              </div>
              <p className="text-xs text-gray-300 truncate">
                Current Balance: <span className="font-bold text-amber-300">{credits} credits remaining</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBuyCreditsModal}
            disabled={purchasingPlanId !== null}
            className="text-white/90 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all shrink-0 ml-2 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards - Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
              <span className="text-sm font-medium">Loading pricing tiers...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const planId = plan.plan_id || plan.id;
                const isTeacherPlan = planId.includes('teacher') || plan.has_teacher_access;
                const priceInRupees = plan.price_display || `₹${Math.round((plan.amount || 0) / 100)}`;
                const perQuiz = plan.per_quiz || '';
                const isCurrentActive = (isTeacherPlan && currentPlan === 'teacher') || (!isTeacherPlan && currentPlan === 'student');

                return (
                  <div
                    key={planId}
                    className={`relative rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                      isTeacherPlan
                        ? 'border-emerald-700 bg-gradient-to-b from-emerald-50/50 to-white shadow-md ring-2 ring-emerald-600/20'
                        : 'border-blue-700 bg-gradient-to-b from-blue-50/50 to-white shadow-md ring-2 ring-blue-600/20'
                    }`}
                  >
                    {/* Floating Top Badge */}
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap ${
                      isTeacherPlan 
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-800' 
                        : 'bg-gradient-to-r from-blue-800 to-indigo-900'
                    }`}>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {plan.badge || (isTeacherPlan ? 'Teacher Pro' : 'Student Choice')}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                          {isTeacherPlan ? (
                            <BookOpen className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <GraduationCap className="w-4 h-4 text-blue-700" />
                          )}
                          <h3 className={`text-base font-extrabold ${isTeacherPlan ? 'text-emerald-950' : 'text-blue-950'}`}>
                            {plan.name}
                          </h3>
                        </div>
                        {isCurrentActive && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {/* Price Display */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-950">{priceInRupees}</span>
                        {perQuiz && (
                          <span className="text-xs text-gray-500 font-semibold">({perQuiz}/quiz)</span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mt-4 space-y-2.5 text-xs text-gray-700">
                        <div className={`flex items-center gap-2 font-black ${isTeacherPlan ? 'text-emerald-900' : 'text-blue-900'}`}>
                          <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{plan.credits} AI Quiz Credits</span>
                        </div>

                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <Check className={`w-3.5 h-3.5 ${isTeacherPlan ? 'text-emerald-600' : 'text-blue-600'} shrink-0`} />
                          <span>Up to {plan.max_questions || (isTeacherPlan ? 20 : 15)} Questions per quiz</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>All 10 AI Academy modules unlocked</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Topic & Document PDF AI quiz generator</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Step-by-step 4-part AI explanations</span>
                        </div>

                        {/* Teacher Mode Check vs Cross */}
                        {isTeacherPlan ? (
                          <div className="flex items-center gap-2 font-extrabold text-emerald-800 bg-emerald-100/70 p-2 rounded-xl border border-emerald-300/80">
                            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Teacher Mode: Create shareable test links & track student leaderboards</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500 line-through">
                            <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>Teacher share & classroom suite</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(plan)}
                      disabled={purchasingPlanId !== null}
                      className={`mt-6 w-full py-2.5 px-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isTeacherPlan
                          ? 'bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white shadow-emerald-200 hover:shadow-md'
                          : 'bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-950 hover:to-black text-white shadow-blue-200 hover:shadow-md'
                      }`}
                    >
                      {purchasingPlanId === planId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Opening Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>Get {plan.name} ({priceInRupees})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Free Tier Included Reference Bar */}
          <div className="p-3 bg-surface-100 rounded-xl border border-surface-200 text-xs text-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-gray-800">Free Tier (₹0): </span>
              <span>3 credits • Max 10 questions/quiz • First 3 AI Academy modules open • No teacher share</span>
            </div>
            {currentPlan === 'free' && (
              <span className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-surface-300 whitespace-nowrap">
                Your Current Plan
              </span>
            )}
          </div>

          {/* Secure Payment Guarantee */}
          <div className="pt-2 border-t border-surface-200 flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Secure Checkout powered by Razorpay (UPI, Cards, NetBanking)</span>
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className="shrink-0 bg-surface-50 px-5 py-3 border-t border-surface-200 flex items-center justify-end">
          <button
            type="button"
            onClick={closeBuyCreditsModal}
            disabled={purchasingPlanId !== null}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition shadow-xs"
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BuyCreditsModal;
