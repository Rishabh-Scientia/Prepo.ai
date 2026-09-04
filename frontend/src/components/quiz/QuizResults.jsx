import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2pdf from 'html2pdf.js';
import ExplanationCard from '../explanations/ExplanationCard';
import { 
  Award, 
  Download, 
  RotateCcw, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

export function QuizResults({
  resultsData, // { score, total, results, config, timeElapsed }
  onRetake,
  onShareQuiz,
  onShowToast,
  isStudentMode = false,
  onCloseAssessment,
}) {
  const printableRef = useRef(null);

  const score = resultsData?.score || 0;
  const total = resultsData?.total || resultsData?.results?.length || 1;
  const percentage = Math.round((score / total) * 100);

  // Trigger confetti for high scores
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [percentage]);

  const getGradeInfo = (pct) => {
    if (pct >= 90) return { title: 'Mastery Level! 🏆', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (pct >= 75) return { title: 'Great Job! 🌟', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (pct >= 50) return { title: 'Good Effort! 👍', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { title: 'Needs More Practice 📚', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const grade = getGradeInfo(percentage);

  const handleDownloadPDF = () => {
    if (!printableRef.current) return;

    if (onShowToast) onShowToast('Generating PDF Report...', 'info');

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Prepo_Quiz_${resultsData?.config?.subject || 'Assessment'}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(printableRef.current)
      .save()
      .then(() => {
        if (onShowToast) onShowToast('PDF report downloaded successfully!', 'success');
      })
      .catch((err) => {
        console.error('PDF export error:', err);
        if (onShowToast) onShowToast('Could not export PDF. Please try again.', 'error');
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fadeIn pb-20">
      
      {/* ── PRINTABLE CONTAINER ── */}
      <div ref={printableRef} className="space-y-6">
        
        {/* Score Summary Card */}
        <div className="bg-white rounded-card border border-surface-200 shadow-subtle p-6 sm:p-8 text-center relative overflow-hidden">
          
          <div className="max-w-md mx-auto">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 ${grade.color}`}>
              {grade.title}
            </span>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
                {score}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-gray-400">
                / {total}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-600 mb-6">
              You scored <span className="text-primary-700 font-bold">{percentage}%</span> on this practice test
            </p>

            {/* Quick Metadata Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-100 text-xs">
              <div className="p-2.5 rounded-card bg-surface-50 border border-surface-200">
                <span className="text-gray-500 block">Subject</span>
                <span className="font-bold text-gray-900 truncate block">
                  {resultsData?.config?.subject || 'Practice'}
                </span>
              </div>

              <div className="p-2.5 rounded-card bg-surface-50 border border-surface-200">
                <span className="text-gray-500 block">Difficulty</span>
                <span className="font-bold text-gray-900 block">
                  {resultsData?.config?.difficulty || 'Medium'}
                </span>
              </div>

              <div className="p-2.5 rounded-card bg-surface-50 border border-surface-200">
                <span className="text-gray-500 block">Accuracy</span>
                <span className="font-bold text-emerald-700 block">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-card border border-surface-200 shadow-subtle">
          <div className="text-xs font-bold text-gray-700">
            <span>Detailed AI Solutions ({resultsData?.results?.length || 0} Questions)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 bg-surface-100 hover:bg-surface-200 text-gray-800 text-xs font-bold rounded-card border border-surface-300 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Download PDF</span>
            </button>

            {onShareQuiz && (
              <button
                type="button"
                onClick={onShareQuiz}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-card border border-amber-200 transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Share with Students</span>
              </button>
            )}

            {isStudentMode ? (
              <button
                type="button"
                onClick={onCloseAssessment || (() => { try { window.close(); } catch {} })}
                className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-card transition flex items-center gap-1.5 shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Assessment</span>
              </button>
            ) : onRetake ? (
              <button
                type="button"
                onClick={onRetake}
                className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-card transition flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Create New Quiz</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* ── DETAILED EXPLANATION CARDS ── */}
        <div className="space-y-4">
          {resultsData?.results?.map((res, idx) => (
            <ExplanationCard key={res.question_id || idx} result={res} index={idx} />
          ))}
        </div>

      </div>

    </div>
  );
}

export default QuizResults;
