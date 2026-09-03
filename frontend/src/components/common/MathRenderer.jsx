import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/contrib/auto-render';

/**
 * Robust KaTeX Math Renderer
 * Supports all delimiter formats: $$...$$, $...$, \[...\], \(...\)
 * Uses KaTeX auto-render for maximum compatibility with backend LaTeX output.
 */
export function MathRenderer({ text = '', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Set raw text content first (safely escapes HTML)
    containerRef.current.textContent = text;

    // Use KaTeX auto-render with all standard delimiters
    try {
      if (typeof window !== 'undefined' && window.renderMathInElement) {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
          ],
          throwOnError: false,
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        });
      } else {
        // Fallback: manual regex-based rendering for SSR or if auto-render not loaded
        renderManually(containerRef.current, text);
      }
    } catch (err) {
      console.warn('KaTeX rendering notice:', err);
    }
  }, [text]);

  return (
    <span
      ref={containerRef}
      className={`math-rendered-content ${className}`}
    />
  );
}

/**
 * Manual fallback renderer when auto-render CDN isn't available.
 * Handles $$...$$, \[...\], $...$, \(...\) delimiters.
 */
function renderManually(element, text) {
  if (!text || typeof text !== 'string') return;

  // Combined regex for all KaTeX delimiters
  // Order matters: block-level first ($$, \[...\]), then inline ($, \(...\))
  const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const parts = text.split(mathRegex);

  let html = '';
  for (const part of parts) {
    if (!part) continue;

    // Block math: $$...$$
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const formula = part.slice(2, -2).trim();
      try {
        html += katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch { html += escapeHtml(part); }
      continue;
    }

    // Block math: \[...\]
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      const formula = part.slice(2, -2).trim();
      try {
        html += katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch { html += escapeHtml(part); }
      continue;
    }

    // Inline math: $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const formula = part.slice(1, -1).trim();
      try {
        html += katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch { html += escapeHtml(part); }
      continue;
    }

    // Inline math: \(...\)
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const formula = part.slice(2, -2).trim();
      try {
        html += katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch { html += escapeHtml(part); }
      continue;
    }

    // Plain text
    html += escapeHtml(part);
  }

  element.innerHTML = html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathRenderer;
