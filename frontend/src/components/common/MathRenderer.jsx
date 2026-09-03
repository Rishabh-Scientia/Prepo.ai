import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/contrib/auto-render';

/**
 * Robust KaTeX Math Renderer
 * Supports all delimiter formats: $$...$$, $...$, \[...\], \(...\)
 * Also seamlessly renders bare LaTeX expressions that lack enclosing delimiters (e.g. 2.26\times10^8\,\text{m/s}).
 */
export function MathRenderer({ text = '', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || text === undefined || text === null) return;

    const rawStr = String(text).trim();
    if (!rawStr) {
      containerRef.current.textContent = '';
      return;
    }

    const hasDelimiters = rawStr.includes('$') || rawStr.includes('\\(') || rawStr.includes('\\[');
    const hasLatexPatterns = /\\[a-zA-Z]+|\^\{?[0-9a-zA-Z\+\-]+\}?|\_\{?[0-9a-zA-Z\+\-]+\}?|\\,/.test(rawStr);

    // 1. If it's a bare LaTeX expression without delimiters (e.g. options: 2.26\times10^8\,\text{m/s})
    if (!hasDelimiters && hasLatexPatterns) {
      try {
        containerRef.current.innerHTML = katex.renderToString(rawStr, {
          displayMode: false,
          throwOnError: false,
        });
        return;
      } catch {
        // Fall back to auto-render with wrapped delimiters
      }
    }

    // 2. Prepare text for standard KaTeX rendering
    let processedText = rawStr;
    if (!hasDelimiters && hasLatexPatterns) {
      processedText = `$${rawStr}$`;
    }

    containerRef.current.textContent = processedText;

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
        renderManually(containerRef.current, processedText);
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
 * Handles $$...$$, \[...\], $...$, \(...\) delimiters, and bare formulas.
 */
function renderManually(element, text) {
  if (!text || typeof text !== 'string') return;

  // Combined regex for all KaTeX delimiters
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
