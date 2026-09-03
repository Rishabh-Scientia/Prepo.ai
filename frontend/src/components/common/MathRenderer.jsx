import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/contrib/auto-render';

/**
 * Normalizes mathematical text:
 * 1. Strips unwanted newlines in single-line math expressions.
 * 2. Replaces block delimiters ($$...$$, \[...\]) with inline delimiters so formulas don't split onto multiple lines.
 * 3. Converts common text trigonometric/Greek words (theta, alpha, beta, etc.) into LaTeX commands (\theta, \alpha, \beta).
 * 4. Ensures bare formulas (e.g. \sin^2\theta + \cos^2\theta = 1, or 2.26\times10^8\,\text{m/s}) are cleanly wrapped and rendered inline.
 */
function normalizeMathText(str) {
  if (!str || typeof str !== 'string') return '';
  
  // Replace newlines with spaces so formulas stay on one line
  let s = str.replace(/\r?\n+/g, ' ').trim();

  // Convert display/block delimiters ($$ or \[ \]) to inline ($) so options NEVER break into multiple lines
  s = s.replace(/\$\$(.*?)\$\$/g, '$$$1$$');
  s = s.replace(/\\\[(.*?)\\\]/g, '$$$1$$');

  // Auto-convert common math words to LaTeX if backslash was missed by the LLM
  // e.g. "sin^2 theta" -> "\sin^2 \theta"
  const greekAndMathWords = [
    'theta', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'lambda', 'mu', 'pi', 'sigma', 'omega', 'phi', 'psi',
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'lim', 'times', 'cdot', 'approx', 'neq', 'pm'
  ];

  for (const word of greekAndMathWords) {
    const regex = new RegExp(`(?<!\\\\)\\b${word}\\b`, 'g');
    s = s.replace(regex, `\\${word}`);
  }

  return s;
}

export function MathRenderer({ text = '', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || text === undefined || text === null) return;

    const normalized = normalizeMathText(String(text));
    if (!normalized) {
      containerRef.current.textContent = '';
      return;
    }

    const hasDelimiters = normalized.includes('$') || normalized.includes('\\(');
    const hasLatexPatterns = /\\[a-zA-Z]+|\^\{?[0-9a-zA-Z\+\-]+\}?|\_\{?[0-9a-zA-Z\+\-]+\}?/.test(normalized);

    // 1. If it's a bare LaTeX formula lacking delimiters (e.g. \sin^2\theta + \cos^2\theta = 1)
    if (!hasDelimiters && hasLatexPatterns) {
      try {
        containerRef.current.innerHTML = katex.renderToString(normalized, {
          displayMode: false,
          throwOnError: false,
        });
        return;
      } catch {
        // fall through to auto-render
      }
    }

    // 2. Prepare text for standard KaTeX rendering
    let processedText = normalized;
    if (!hasDelimiters && hasLatexPatterns) {
      processedText = `$${normalized}$`;
    }

    containerRef.current.textContent = processedText;

    try {
      if (typeof window !== 'undefined' && window.renderMathInElement) {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: false },
            { left: '\\[', right: '\\]', display: false },
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
 * Always renders with displayMode: false so formulas never break onto multiple lines.
 */
function renderManually(element, text) {
  if (!text || typeof text !== 'string') return;

  const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const parts = text.split(mathRegex);

  let html = '';
  for (const part of parts) {
    if (!part) continue;

    // Block math: $$...$$ -> rendered inline so options never break
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const formula = part.slice(2, -2).trim();
      try {
        html += katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch { html += escapeHtml(part); }
      continue;
    }

    // Block math: \[...\] -> rendered inline so options never break
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      const formula = part.slice(2, -2).trim();
      try {
        html += katex.renderToString(formula, { displayMode: false, throwOnError: false });
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
