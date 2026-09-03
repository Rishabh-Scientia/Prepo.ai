import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-surface-200 py-8 px-4 mt-16 text-center text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center text-white font-bold text-[10px]">
            P
          </div>
          <span className="font-semibold text-gray-800">Prepo.ai</span>
          <span className="text-gray-400">|</span>
          <span>AI-Powered Adaptive Assessment Platform</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600">
          <span>CBSE Class 10 & 12</span>
          <span>•</span>
          <span>JEE & NEET</span>
          <span>•</span>
          <span>B.Tech & GATE</span>
          <span>•</span>
          <span>Instant Step-by-Step AI Explanations</span>
        </div>

        <div>
          © {new Date().getFullYear()} Prepo.ai (Your Bench). All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
