import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookOpen, Layers, HelpCircle, Globe, Gauge } from 'lucide-react';

const CLASS_LEVELS = [
  { value: 'Class 10 (CBSE/ICSE)', label: 'Class 10 (CBSE/ICSE)' },
  { value: 'Class 11 (CBSE/State)', label: 'Class 11 (CBSE/State)' },
  { value: 'Class 12 (CBSE/State)', label: 'Class 12 (CBSE/State)' },
  { value: 'JEE Main / Advanced', label: 'JEE Main / Advanced (Physics, Chem, Math)' },
  { value: 'NEET (UG)', label: 'NEET UG (Physics, Chem, Bio)' },
  { value: 'Class 9 (CBSE/ICSE)', label: 'Class 9 (CBSE/ICSE)' },
  { value: 'B.Tech 1st Year (Engg Basics)', label: 'B.Tech 1st Year (Engineering Basics)' },
  { value: 'B.Tech CSE / IT', label: 'B.Tech CSE / IT (Computer Science)' },
  { value: 'B.Tech ECE / EE', label: 'B.Tech ECE / EE (Electronics & Electrical)' },
  { value: 'B.Tech Mech / Civil', label: 'B.Tech Mech / Civil' },
  { value: 'GATE CS / IT', label: 'GATE CS / IT' },
  { value: 'GATE Engineering', label: 'GATE Core Engineering' },
  { value: 'UGC NET / General Aptitude', label: 'UGC NET / General Aptitude' },
  { value: 'UPSC / State PSC CSAT', label: 'UPSC / State PSC CSAT' },
  { value: 'custom', label: '✏️ Other / Custom Class or Exam' },
];

const SUBJECT_SUGGESTIONS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology',
  'Data Structures', 'Algorithms', 'Computer Networks', 'Operating Systems',
  'DBMS', 'Digital Electronics', 'Thermodynamics', 'General Aptitude'
];

export function QuizGenerator({ initialValues, onGenerate, isLoading }) {
  const [classLevel, setClassLevel] = useState('Class 12 (CBSE/State)');
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
    <div className="bg-white rounded-card border border-surface-200 shadow-subtle p-6 max-w-2xl mx-auto">
      <div className="mb-6 pb-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Configure AI Practice Test
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Select syllabus details to generate high-yield MCQs
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Class / Grade Level */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary-600" />
            Class / Grade / Exam Level
          </label>
          <select
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-card bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
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
              className="mt-2 w-full py-2 px-3 text-sm border border-surface-300 rounded-card focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          )}
        </div>

        {/* Subject & Quick Chips */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary-600" />
            Subject Name
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Physics, Data Structures, Macroeconomics"
            required
            className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-card focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />

          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUBJECT_SUGGESTIONS.map((sub) => (
              <button
                type="button"
                key={sub}
                onClick={() => setSubject(sub)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-card border transition ${
                  subject === sub
                    ? 'bg-primary-50 border-primary-300 text-primary-700 font-semibold'
                    : 'bg-surface-50 border-surface-200 text-gray-600 hover:bg-surface-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter / Topic */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary-600" />
            Chapter / Specific Topic
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Electrostatics, Binary Search Trees, Chemical Kinetics"
            required
            className="w-full py-2.5 px-3 text-sm border border-surface-300 rounded-card focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Question Count & Difficulty & Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Question Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full py-2 px-3 text-sm border border-surface-300 rounded-card bg-white focus:outline-none focus:border-primary-500"
            >
              <option value={5}>5 Questions (Quick Check)</option>
              <option value={10}>10 Questions (Standard)</option>
              <option value={15}>15 Questions (Deep Practice)</option>
              <option value={20}>20 Questions (Full Mock)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-gray-500" />
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-surface-300 rounded-card bg-white focus:outline-none focus:border-primary-500"
            >
              <option value="Easy">Easy (Foundational)</option>
              <option value="Medium">Medium (Exam Level)</option>
              <option value="Hard">Hard (Challenging)</option>
              <option value="Mixed">Mixed (All Levels)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-surface-300 rounded-card bg-white focus:outline-none focus:border-primary-500"
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
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-card transition shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI Questions with Llama 3.3 70B...</span>
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
