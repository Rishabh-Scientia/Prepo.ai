import React from 'react';
import { Sparkles, Mail, Globe, Layers, BookOpen } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-surface-200 mt-20 text-gray-600">
      
      {/* ── TOP SECTION (3 COLUMNS) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                P
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Prepo<span className="text-primary-600">.ai</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              AI-powered adaptive test engine for school, college, and competitive exam preparation. Generate instant custom mock tests from syllabus topics or lecture notes with 4-part AI reasoning.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('home')}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('config')}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  Start Practice Test
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('profile', 'history')}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  Attempt History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('profile', 'teacher')}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  Teacher Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Levels */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Supported Academic Levels
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></span>
                <span>Class 1st – 12th (CBSE / ICSE / State)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></span>
                <span>JEE Main / Advanced & NEET UG</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></span>
                <span>Undergraduate (B.Tech / B.Sc / B.Com)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"></span>
                <span>GATE, UGC NET & Competitive Exams</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── BOTTOM BRANDING & SOCIAL LINKS ── */}
      <div className="border-t border-surface-200 bg-surface-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          {/* Colorful Your Bench Attribution */}
          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} Prepo.ai | A <strong className="font-extrabold"><span className="text-emerald-600">Your</span> <span className="text-gray-900">Bench</span></strong> Product. All rights reserved.
          </div>

          {/* Social / External Links */}
          <div className="flex items-center gap-2.5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/your.bench"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram (@your.bench)"
              className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-transparent transition-all shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/yourbench/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn (Your Bench)"
              className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:yoursbench@gmail.com"
              title="Support Email (yoursbench@gmail.com)"
              className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all shadow-xs"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* Website */}
            <a
              href="https://your-bench-flax.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              title="Your Bench Official Website"
              className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 transition-all shadow-xs"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
