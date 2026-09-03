import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Loader2, Sparkles, Gauge, Globe, Layers, ChevronDown, Check } from 'lucide-react';

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

/**
 * Custom Dropdown that strictly opens DOWNWARDS
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
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-surface-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1 animate-fadeIn">
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
                className={`w-full px-3.5 py-2 text-sm text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-surface-50'
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

export function DocQuizGenerator({ onGenerateFromDoc, isLoading }) {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      setError('Please upload a valid document (.pdf, .docx, or .txt)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select or upload a document file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('num_questions', numQuestions);
    formData.append('difficulty', difficulty);
    formData.append('language', language);

    onGenerateFromDoc(formData, file.name);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 sm:p-7 max-w-2xl mx-auto">
      <div className="mb-6 pb-4 border-b border-surface-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600 shrink-0" />
          <span>Generate Test from Study Notes</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Upload PDF lecture slides, chapter notes, or handouts to extract instant MCQs
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50 scale-[0.99]'
                : 'border-surface-300 hover:border-primary-400 bg-surface-50/50 hover:bg-surface-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Click to browse or drag & drop your study document
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports PDF, Word (.docx), and Plain Text (.txt) up to 10MB
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/40 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 font-medium">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition ml-2"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>Questions</span>
            </label>
            <CustomSelect
              value={numQuestions}
              onChange={setNumQuestions}
              options={QUESTION_COUNT_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-gray-500" />
              <span>Difficulty</span>
            </label>
            <CustomSelect
              value={difficulty}
              onChange={setDifficulty}
              options={DIFFICULTY_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>Language</span>
            </label>
            <CustomSelect
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_OPTIONS}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading || !file}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing document & generating test...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary-200" />
                <span>Extract AI Quiz from Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocQuizGenerator;
