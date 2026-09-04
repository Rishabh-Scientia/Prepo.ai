import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Eye, 
  EyeOff, 
  Power, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export function ShareQuizModal({ 
  isOpen, 
  onClose, 
  sharedQuizId, 
  initialSettings = null,
  onShowToast, 
  onUpdateSettings 
}) {
  const [copied, setCopied] = useState(false);
  
  // Settings State
  const [hasTimer, setHasTimer] = useState(false);
  const [durationVal, setDurationVal] = useState(30);
  const [durationUnit, setDurationUnit] = useState('minutes'); // 'minutes' | 'hours'
  const [showResults, setShowResults] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const initializedIdRef = useRef(null);

  // Initialize settings once per modal opening
  useEffect(() => {
    if (!isOpen || !sharedQuizId) {
      initializedIdRef.current = null;
      return;
    }

    if (initializedIdRef.current === sharedQuizId) return;
    initializedIdRef.current = sharedQuizId;

    if (initialSettings) {
      setIsActive(initialSettings.is_active !== false);
      setShowResults(initialSettings.show_results !== false);
      if (initialSettings.time_limit_minutes) {
        setHasTimer(true);
        if (initialSettings.time_limit_minutes % 60 === 0 && initialSettings.time_limit_minutes >= 60) {
          setDurationVal(initialSettings.time_limit_minutes / 60);
          setDurationUnit('hours');
        } else {
          setDurationVal(initialSettings.time_limit_minutes);
          setDurationUnit('minutes');
        }
      } else {
        setHasTimer(false);
        setDurationVal(30);
        setDurationUnit('minutes');
      }
    } else {
      // Fetch fresh settings
      api.getSharedQuiz(sharedQuizId)
        .then((data) => {
          if (!data) return;
          setIsActive(data.is_active !== false);
          setShowResults(data.show_results !== false);
          if (data.time_limit_minutes) {
            setHasTimer(true);
            if (data.time_limit_minutes % 60 === 0 && data.time_limit_minutes >= 60) {
              setDurationVal(data.time_limit_minutes / 60);
              setDurationUnit('hours');
            } else {
              setDurationVal(data.time_limit_minutes);
              setDurationUnit('minutes');
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, sharedQuizId]);

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

  const calculateTotalMinutes = (timerEnabled, val, unit) => {
    if (!timerEnabled) return null;
    const num = Math.max(1, parseInt(val, 10) || 1);
    return unit === 'hours' ? num * 60 : num;
  };

  const persistSettings = async (overrides = {}) => {
    const nextTimer = overrides.hasTimer !== undefined ? overrides.hasTimer : hasTimer;
    const nextVal = overrides.durationVal !== undefined ? overrides.durationVal : durationVal;
    const nextUnit = overrides.durationUnit !== undefined ? overrides.durationUnit : durationUnit;
    const nextShowResults = overrides.showResults !== undefined ? overrides.showResults : showResults;
    const nextIsActive = overrides.isActive !== undefined ? overrides.isActive : isActive;

    const time_limit_minutes = calculateTotalMinutes(nextTimer, nextVal, nextUnit);

    const payload = {
      is_active: nextIsActive,
      show_results: nextShowResults,
      time_limit_minutes,
    };

    try {
      setIsSaving(true);
      await api.updateSharedQuizSettings(sharedQuizId, payload);
      setSaveSuccess(true);
      if (onUpdateSettings) {
        onUpdateSettings(sharedQuizId, payload);
      }
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to update quiz settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
    const timeText = hasTimer 
      ? ` ⏱️ Time Limit: ${calculateTotalMinutes(hasTimer, durationVal, durationUnit)} Mins (Auto-submits on timeout).` 
      : '';
    const text = encodeURIComponent(
      `📚 Take this AI-generated Assessment on Prepo.ai:\n\n${shareUrl}\n\n${timeText}\n\nAll responses recorded directly to Teacher Leaderboard!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-surface-200 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Share Quiz & Assessment Controls</h3>
              <p className="text-xs text-gray-500">Configure student timers and score visibility</p>
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
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
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>
            
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3.5 bg-surface-100 hover:bg-surface-200 text-gray-800 text-xs font-bold rounded-xl border border-surface-300 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Test</span>
            </a>
          </div>

          {/* ── TEACHER CONTROLS ACCORDION / CARD ── */}
          <div className="border border-surface-200 rounded-2xl p-4 bg-surface-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Assessment Settings
              </span>
              {isSaving ? (
                <span className="text-[11px] text-primary-600 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : saveSuccess ? (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              ) : null}
            </div>

            {/* 1. Timer Toggle */}
            <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Clock className={`w-3.5 h-3.5 ${hasTimer ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span>Time Limit</span>
                    {hasTimer && (
                      <span className="text-[10px] bg-primary-50 text-primary-700 border border-primary-200 px-1.5 py-0.2 rounded font-semibold">
                        {calculateTotalMinutes(hasTimer, durationVal, durationUnit)} min limit
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Timer starts when student begins. Test auto-submits when time expires.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={hasTimer}
                  onClick={() => {
                    const next = !hasTimer;
                    setHasTimer(next);
                    persistSettings({ hasTimer: next });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasTimer ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hasTimer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Timer Duration Inputs (if enabled) */}
              {hasTimer && (
                <div className="pt-2 border-t border-surface-100 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={durationVal}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setDurationVal(val);
                      }}
                      onBlur={() => persistSettings()}
                      className="w-20 py-1.5 px-2.5 text-xs bg-surface-50 border border-surface-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:border-primary-500"
                    />

                    <select
                      value={durationUnit}
                      onChange={(e) => {
                        const unit = e.target.value;
                        setDurationUnit(unit);
                        persistSettings({ durationUnit: unit });
                      }}
                      className="py-1.5 px-2.5 text-xs bg-surface-50 border border-surface-300 rounded-lg font-medium text-gray-700 focus:outline-none focus:border-primary-500"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => persistSettings()}
                      className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-gray-700 text-xs font-bold rounded-lg border border-surface-300 transition shrink-0"
                    >
                      Set
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 mr-1">Presets:</span>
                    {[
                      { label: '15m', val: 15, unit: 'minutes' },
                      { label: '30m', val: 30, unit: 'minutes' },
                      { label: '45m', val: 45, unit: 'minutes' },
                      { label: '60m', val: 60, unit: 'minutes' },
                      { label: '2h', val: 2, unit: 'hours' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setDurationVal(preset.val);
                          setDurationUnit(preset.unit);
                          persistSettings({ durationVal: preset.val, durationUnit: preset.unit });
                        }}
                        className={`px-2 py-0.5 text-[11px] rounded-md font-semibold border transition ${
                          durationVal === preset.val && durationUnit === preset.unit
                            ? 'bg-primary-100 text-primary-800 border-primary-300'
                            : 'bg-surface-100 text-gray-600 border-surface-200 hover:bg-surface-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Student Score & Solutions Visibility Toggle */}
            <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  {showResults ? (
                    <Eye className="w-3.5 h-3.5 text-primary-600" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Show Score & Solutions to Student</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {showResults 
                    ? 'Student gets instant AI score, analysis & step-by-step solutions.' 
                    : 'Scores are hidden from students. Only you can view them on the Dashboard.'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={showResults}
                onClick={() => {
                  const next = !showResults;
                  setShowResults(next);
                  persistSettings({ showResults: next });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showResults ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showResults ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Teacher Live Leaderboard Enabled</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              When students submit their answers, their scores, response timestamps, and full breakdown will automatically appear on your <strong>Teacher Dashboard</strong> in real time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-50 px-6 py-4 border-t border-surface-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-400">
            Prepo.ai Assessment Engine
          </span>
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
