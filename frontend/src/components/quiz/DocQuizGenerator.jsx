import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, Loader2, Sparkles, Gauge, Globe } from 'lucide-react';

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
    <div className="bg-white rounded-card border border-surface-200 shadow-subtle p-6 max-w-2xl mx-auto">
      <div className="mb-6 pb-4 border-b border-surface-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Generate Test from Notes or Documents
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload PDF lecture slides, chapter notes, or handouts to extract instant MCQs
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-card bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
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
            className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-surface-300 hover:border-primary-400 bg-surface-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Click to browse or drag & drop your study document
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports PDF, Word (.docx), and Plain Text (.txt) up to 10MB
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-card border border-primary-200 bg-primary-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-card bg-primary-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full py-2 px-3 text-sm border border-surface-300 rounded-card bg-white focus:outline-none focus:border-primary-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

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
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

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

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !file}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-card transition shadow-sm flex items-center justify-center gap-2"
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
