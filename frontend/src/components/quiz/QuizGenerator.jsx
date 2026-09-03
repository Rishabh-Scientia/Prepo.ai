import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookOpen, Layers, HelpCircle, Globe, Gauge } from 'lucide-react';

const CLASS_LEVELS = [
  { value: 'Class 1', label: 'Class 1' },
  { value: 'Class 2', label: 'Class 2' },
  { value: 'Class 3', label: 'Class 3' },
  { value: 'Class 4', label: 'Class 4' },
  { value: 'Class 5', label: 'Class 5' },
  { value: 'Class 6', label: 'Class 6' },
  { value: 'Class 7', label: 'Class 7' },
  { value: 'Class 8', label: 'Class 8' },
  { value: 'Class 9', label: 'Class 9' },
  { value: 'Class 10', label: 'Class 10' },
  { value: 'Class 11', label: 'Class 11' },
  { value: 'Class 12', label: 'Class 12' },
  { value: 'College / Degree', label: 'College / Degree (B.Tech / B.Sc / B.Com)' },
  { value: 'Postgraduate', label: 'Postgraduate (M.Tech / M.Sc / MCA)' },
  { value: 'Competitive Exam', label: 'Competitive Exam (JEE / NEET / GATE / UPSC)' },
  { value: 'custom', label: '✏️ Custom / Other' },
];

const SUBJECT_SUGGESTIONS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology',
  'Science', 'Social Science', 'Computer Science', 'English',
  'Data Structures', 'DBMS', 'General Knowledge'
];

export function QuizGenerator({ initialValues, onGenerate, isLoading }) {
  const [classLevel, setClassLevel] = useState('Class 10');
  const [customClassLevel, setCustomClassLevel] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues) {
      if (initialValues.classLevel) {
        const found = CLASS_LEVELS.some((c) => c.value === initialValues.classLevel);
        if (found) {
          setClassLevel(initialValues.classLevel);
        } else {
          setClassLevel('custom');
          setCustomClassLevel(initialValues.classLevel);
        }
      }
      if (initialValues.name) setSubject(initialValues.name);
      if (initialValues.chapter) setChapter(initialValues.chapter);
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const resolvedClassLevel = classLevel === 'custom' ? customClassLevel.trim() : classLevel;

    if (!resolvedClassLevel) {
      setError('Please specify your class or exam level.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter the subject.');
      return;
    }
    if (!chapter.trim()) {
      setError('Please enter the specific chapter or topic.');
      return;
    }

    onGenerate({
      class_level: resolvedClassLevel,
      subject: subject.trim(),
      chapter: chapter.trim(),
      num_questions: parseInt(numQuestions, 10),
      difficulty,
      language,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-subtle p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6 pb-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Configure AI Practice Test
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Select syllabus details to generate high-yield MCQs tailored to your class
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Class / Grade Level */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-primary-600" />
            Class / Grade / Exam Level
          </label>
          <select
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="w-full py-2.5 px-3.5 text-sm border border-surface-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium text-gray-800"
          >
            {CLASS_LEVELS.map((cl) => (
              <option key={cl.value} value={cl.value}>
                {cl.label}
              </option>
            ))}
          </select>

          {classLevel === 'custom' && (
            <input
              type="text"
              value={customClassLevel}
              onChange={(e) => setCustomClassLevel(e.target.value)}
              placeholder="e.g. Master's in Data Science, CA Foundation, UPSC Prelims"
              required
              className="mt-2.5 w-full py-2.5 px-3.5 text-sm border border-surface-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          )}
        </div>

        {/* Subject & Quick Chips */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-primary-600" />
            Subject Name
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Physics, Mathematics, Science, DBMS"
            required
            className="w-full py-2.5 px-3.5 text-sm border border-surface-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUBJECT_SUGGESTIONS.map((sub) => (
              <button
                type="button"
                key={sub}
                onClick={() => setSubject(sub)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  subject === sub
                    ? 'bg-primary-50 border-primary-300 text-primary-700 font-bold shadow-xs'
                    : 'bg-surface-50 border-surface-200 text-gray-600 hover:bg-surface-100 hover:border-gray-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter / Topic */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-primary-600" />
            Chapter / Specific Topic
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Light & Reflection, Fractions, Chemical Bonding, Binary Trees"
            required
            className="w-full py-2.5 px-3.5 text-sm border border-surface-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Question Count & Difficulty & Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 font-medium"
            >
              <option value={5}>5 Questions (Quick Check)</option>
              <option value={10}>10 Questions (Standard)</option>
              <option value={15}>15 Questions (Deep Practice)</option>
              <option value={20}>20 Questions (Full Mock)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-gray-500" />
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 font-medium"
            >
              <option value="Easy">Easy (Foundational)</option>
              <option value="Medium">Medium (Exam Level)</option>
              <option value="Hard">Hard (Challenging)</option>
              <option value="Mixed">Mixed (All Levels)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-xl bg-white focus:outline-none focus:border-primary-500 font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI Practice Test...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary-200" />
                <span>Generate Test Now</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuizGenerator;
