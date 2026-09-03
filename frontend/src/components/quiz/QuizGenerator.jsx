import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, BookOpen, Layers, HelpCircle, Globe, Gauge, ChevronDown, Check } from 'lucide-react';

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

const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: '5 Questions (Quick Check)' },
  { value: 10, label: '10 Questions (Standard)' },
  { value: 15, label: '15 Questions (Deep Practice)' },
  { value: 20, label: '20 Questions (Full Mock)' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (Foundational)' },
  { value: 'Medium', label: 'Medium (Exam Level)' },
  { value: 'Hard', label: 'Hard (Challenging)' },
  { value: 'Mixed', label: 'Mixed (All Levels)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi (हिन्दी)' },
  { value: 'Hinglish', label: 'Hinglish' },
];

const SUBJECT_SUGGESTIONS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology',
  'Science', 'Social Science', 'Computer Science', 'English',
  'Data Structures', 'DBMS', 'General Knowledge'
];

/**
 * Custom Dropdown that strictly opens DOWNWARDS
 * Solves browser OS upwards-flipping bug
 */
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full py-2.5 px-3.5 text-sm border rounded-xl bg-white hover:border-surface-400 focus:outline-none transition-all font-medium text-gray-800 flex items-center justify-between text-left ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-surface-300'
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-primary-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-surface-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-fadeIn">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-surface-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
        
        {/* Class / Grade Level — Always Opens Downwards */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-primary-600" />
            Class / Grade / Exam Level
          </label>
          
          <CustomSelect
            value={classLevel}
            onChange={(val) => setClassLevel(val)}
            options={CLASS_LEVELS}
          />

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

        {/* Question Count & Difficulty & Language Grid — All Open Downwards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Number of Questions
            </label>
            <CustomSelect
              value={numQuestions}
              onChange={(val) => setNumQuestions(val)}
              options={QUESTION_COUNT_OPTIONS}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-gray-500" />
              Difficulty
            </label>
            <CustomSelect
              value={difficulty}
              onChange={(val) => setDifficulty(val)}
              options={DIFFICULTY_OPTIONS}
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              Language
            </label>
            <CustomSelect
              value={language}
              onChange={(val) => setLanguage(val)}
              options={LANGUAGE_OPTIONS}
            />
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
