import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { buzzService } from '../../services/buzzService';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Share2, 
  Copy, 
  Check, 
  IndianRupee, 
  Trophy, 
  Users, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Flame,
  Gift,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';

export function BuzzPage({ onNavigate, onShowToast }) {
  const { user, isLoggedIn, openSignIn, openSignUp, displayName } = useAuth();

  // Buzz state
  const [profile, setProfile] = useState(null);
  const [squad, setSquad] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Referral detection from URL (?ref=... or ?code=...)
  const [referrerCode, setReferrerCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('code') || params.get('buzz_ref');
      if (ref) {
        sessionStorage.setItem('prepo_buzz_referrer', ref.trim());
        return ref.trim();
      }
      return sessionStorage.getItem('prepo_buzz_referrer') || '';
    } catch {
      return '';
    }
  });

  const [referrerProfile, setReferrerProfile] = useState(null);
  const [hasBuzzedReferrer, setHasBuzzedReferrer] = useState(false);
  const [isBuzzing, setIsBuzzing] = useState(false);

  // UI Tabs inside Buzz Page: 'squad' | 'redemptions'
  const [activeTab, setActiveTab] = useState('squad');

  // Copy Link State
  const [copied, setCopied] = useState(false);

  // UPI Redemption Form State
  const [upiId, setUpiId] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  // 1. Fetch user profile & squad data
  const loadUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const prof = await buzzService.getOrCreateBuzzProfile(user);
      setProfile(prof);

      const squadList = await buzzService.getBuzzSquad(user.id);
      setSquad(squadList);

      const redList = await buzzService.getUserRedemptions(user.id);
      setRedemptions(redList);
    } catch (err) {
      console.warn('Could not load buzz data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Fetch referrer profile if arriving via a shared link
  useEffect(() => {
    async function checkReferrer() {
      if (!referrerCode) return;
      try {
        const refProf = await buzzService.getReferrerProfile(referrerCode);
        setReferrerProfile(refProf);

        if (user && refProf) {
          const already = await buzzService.hasAlreadyBuzzed(refProf.user_id, user.id);
          setHasBuzzedReferrer(already);
        }
      } catch (e) {
        console.warn('Error resolving referrer:', e);
      }
    }
    checkReferrer();
  }, [referrerCode, user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle Confetti celebration
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
      });
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}
  };

  // Action: Friend presses "BUZZ (+10 ⭐)"
  const handleBuzzFriend = async () => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    if (!referrerProfile && !referrerCode) {
      onShowToast?.('Invalid referral link', 'error');
      return;
    }

    try {
      setIsBuzzing(true);
      const res = await buzzService.executeBuzz(referrerCode, user);
      fireConfetti();
      setHasBuzzedReferrer(true);
      onShowToast?.(`⚡ Buzzed! You gave 10 ⭐ and also received 10 ⭐ welcome bonus!`, 'success');
      
      // Reload profile to reflect new welcome stars
      await loadUserData();
    } catch (err) {
      onShowToast?.(err.message || 'Could not send buzz', 'error');
    } finally {
      setIsBuzzing(false);
    }
  };

  // Referral Link Generator
  const userReferralCode = profile?.referral_code || (user ? user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : '');
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/buzz?ref=${userReferralCode}` 
    : `https://www.prepo.co.in/buzz?ref=${userReferralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast?.('Buzz link copied to clipboard! 📋', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast?.('Failed to copy. Please manually copy the URL.', 'error');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🔥 *Prepo.ai Buzz Challenge!* 🔥%0A%0AHey! Buzz me on Prepo.ai with just 1 click to help me unlock rewards!%0A%0A⚡ You and I both get 10 ⭐ stars!%0A💸 Reach 1,000 stars to instantly withdraw ₹100 direct UPI Cash!%0A%0ATap here to Buzz me: ${encodeURIComponent(shareUrl)}`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Buzz me on Prepo.ai to Earn ₹100 UPI Cash!',
          text: `Buzz me on Prepo.ai! You and I both get 10 ⭐ stars. At 1,000 stars, get ₹100 UPI cash!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // Action: Redeem ₹100 Cashback
  const handleRedeemCashback = async (e) => {
    e?.preventDefault();
    if (!upiId.trim()) {
      onShowToast?.('Please enter your UPI ID', 'error');
      return;
    }
    if (!upiId.includes('@')) {
      onShowToast?.('Invalid UPI ID. Must contain @ (e.g. mobile@upi or name@okhdfcbank)', 'error');
      return;
    }

    try {
      setIsRedeeming(true);
      const res = await buzzService.submitRedemption(
        user.id, 
        upiId.trim(), 
        displayName, 
        user.email
      );

      fireConfetti();
      setRedemptionSuccess(true);
      onShowToast?.('₹100 UPI Redemption Request Submitted! 🎉', 'success');
      setUpiId('');
      await loadUserData();
    } catch (err) {
      onShowToast?.(err.message || 'Redemption failed. Please try again.', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Calculations for Gamification Progress
  const availableStars = profile?.available_stars ?? 0;
  const targetStars = 1000;
  const progressPercent = Math.min(100, Math.round((availableStars / targetStars) * 100));
  const starsNeeded = Math.max(0, targetStars - availableStars);
  const friendsNeeded = Math.ceil(starsNeeded / 10);
  const isEligibleForRedeem = availableStars >= targetStars;

  const isViewingOwnRef = user && referrerProfile && referrerProfile.user_id === user.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black pb-28 pt-2 sm:pt-4">
      
      {/* ── AMBIENT BACKGROUND GLOW ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md sm:max-w-lg mx-auto px-4">

        {/* ── TOP NAV HEADER ── */}
        <div className="flex items-center justify-between py-3 mb-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition py-1 px-2.5 rounded-lg hover:bg-slate-900 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Prepo Home</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400 tracking-wide uppercase shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Cash Streak</span>
          </div>
        </div>

        {/* ── 1. REFERRAL INVITATION CARD (When someone clicked a shared Buzz link) ── */}
        {referrerCode && !isViewingOwnRef && (
          <div className="mb-6 rounded-2xl bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-900 border-2 border-amber-500/50 p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden animate-fadeIn">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 font-black text-xl shrink-0 ring-2 ring-amber-300/40">
                ⚡
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Friend's Buzz Invitation
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                  {referrerProfile?.full_name ? `${referrerProfile.full_name} invited you!` : 'You were invited to Buzz!'}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Buzz your friend back! They get <strong className="text-amber-400">+10 Stars ⭐</strong> and you also earn a <strong className="text-emerald-400">+10 Stars Welcome Bonus</strong> to start your own ₹100 Cashback Streak!
            </p>

            {/* If User is NOT Logged In: Must Authenticate */}
            {!isLoggedIn ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openSignUp()}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Sign Up / Log In to Buzz Back (+10 ⭐)</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant 1-Click Authentication via Supabase</span>
                </div>
              </div>
            ) : hasBuzzedReferrer ? (
              /* Already Buzzed state */
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You have already buzzed your friend! Start earning your own ₹100 below.</span>
              </div>
            ) : (
              /* Ready to Buzz Button */
              <button
                type="button"
                onClick={handleBuzzFriend}
                disabled={isBuzzing}
                className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
              >
                {isBuzzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Buzz...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>TAP TO BUZZ FRIEND (+10 ⭐)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── 2. HERO CASHBACK & STAR PROGRESS METER CARD ── */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden mb-5 backdrop-blur-xl">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight flex items-center gap-1.5">
                  ⭐ {availableStars}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Stars
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Target Reward
              </span>
              <div className="flex items-center justify-end gap-1 mt-0.5 text-2xl sm:text-3xl font-black text-emerald-400">
                <IndianRupee className="w-5 h-5 stroke-[3]" />
                <span>100</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Direct UPI Transfer</span>
            </div>
          </div>

          {/* Gamified Progress Bar */}
          <div className="space-y-2 mt-5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Cashback Progress</span>
              </span>
              <span className="text-amber-400">{progressPercent}%</span>
            </div>

            {/* The Track */}
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80 relative">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-700 ease-out relative shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
              </div>
            </div>

            {/* Milestones label */}
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
              <span>0 ⭐</span>
              <span>250 ⭐ (₹25)</span>
              <span>500 ⭐ (₹50)</span>
              <span>750 ⭐ (₹75)</span>
              <span className="text-emerald-400 font-bold">1,000 ⭐ (₹100)</span>
            </div>
          </div>

          {/* Distance Indicator Box */}
          <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              {isEligibleForRedeem ? (
                <p className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Target achieved! Claim your ₹100 below!</span>
                </p>
              ) : (
                <p className="text-slate-300">
                  Only <strong className="text-amber-400 font-bold">{starsNeeded} more stars</strong> ({friendsNeeded} friends) needed to unlock ₹100 direct UPI transfer!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. REDEEM ₹100 UPI CASHBACK SECTION ── */}
        <div className="mb-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isEligibleForRedeem ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Unlock className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Redeem ₹100 Cashback</span>
                  {isEligibleForRedeem && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                      Unlocked
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Direct transfer to Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>
            </div>
          </div>

          {isEligibleForRedeem ? (
            <form onSubmit={handleRedeemCashback} className="space-y-3 mt-4 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Congratulations! Enter your UPI ID to receive ₹100.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Your UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRedeeming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Withdraw ₹100 to UPI</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300 block mb-0.5">
                  Status: Locked ({availableStars} / 1,000 Stars)
                </span>
                <span>
                  Reach 1,000 stars to unlock your ₹100 withdrawal. Share your link below to get 10 stars for every friend who signs up!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. SHARE & INVITE CARD (VIRAL LOOP ENGINE) ── */}
        <div className="mb-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Share Your Buzz Link
              </h3>
              <p className="text-[11px] text-slate-400">
                Earn 10 ⭐ every time a friend signs up & buzzes back
              </p>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-300">
                Log in to generate your personalized Buzz referral link and start tracking your earnings.
              </p>
              <button
                type="button"
                onClick={() => openSignIn()}
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
              >
                Log In to Get Your Link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Copy Link Input Box */}
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono truncate flex-1 select-all">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    copied 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: WhatsApp & Native Share */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-3 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-[#25D366]/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-base">💬</span>
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <span>More Options</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. HOW IT WORKS (3 SIMPLE STEPS) ── */}
        <div className="mb-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>How Prepo Buzz Works</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <span className="text-[11px] font-extrabold text-white mb-0.5">Share Link</span>
              <p className="text-[10px] text-slate-400 leading-tight">Send to friends on WhatsApp</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-400 font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <span className="text-[11px] font-extrabold text-white mb-0.5">They Buzz</span>
              <p className="text-[10px] text-slate-400 leading-tight">Friend signs up & hits Buzz (+10 ⭐)</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <span className="text-[11px] font-extrabold text-white mb-0.5">Get ₹100</span>
              <p className="text-[10px] text-slate-400 leading-tight">Enter UPI ID & get cash</p>
            </div>
          </div>
        </div>

        {/* ── 6. ACTIVITY FEED / BUZZ SQUAD & REDEMPTION TABS ── */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800/90 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('squad')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'squad'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Friends Buzzed ({squad.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('redemptions')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'redemptions'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payouts ({redemptions.length})</span>
            </button>
          </div>

          {/* TAB 1: Buzz Squad List */}
          {activeTab === 'squad' && (
            <div className="space-y-2.5 animate-fadeIn">
              {squad.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mb-1">
                    No friends have buzzed you yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                    Share your unique Buzz link in your coaching or college WhatsApp groups to start earning 10 ⭐ per friend!
                  </p>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp Now</span>
                    </button>
                  )}
                </div>
              ) : (
                squad.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm shrink-0">
                        {item.friend_name ? item.friend_name.charAt(0).toUpperCase() : 'F'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {item.friend_name || 'Anonymous Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black shrink-0">
                      <span>+{item.stars_awarded || 10} ⭐</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Redemptions History */}
          {activeTab === 'redemptions' && (
            <div className="space-y-2.5 animate-fadeIn">
              {redemptions.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mb-1">
                    No Payout Requests Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Once you collect 1,000 stars, submit your UPI ID here to receive ₹100 directly.
                  </p>
                </div>
              ) : (
                redemptions.map((red, idx) => (
                  <div
                    key={red.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-black text-white">
                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                        <span>{red.amount_inr || 100} UPI Cashback</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {red.upi_id}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {red.created_at ? new Date(red.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                      red.status === 'completed' || red.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : red.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {red.status === 'completed' || red.status === 'paid' ? 'Paid ✅' : red.status === 'rejected' ? 'Rejected' : 'Pending ⏳'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BuzzPage;
