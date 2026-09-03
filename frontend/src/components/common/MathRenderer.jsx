import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/contrib/auto-render';

/**
 * Normalizes mathematical text:
 * 1. Restores corrupted JSON escape characters (\x0c Form Feed -> \f for \frac, \x08 -> \b, \t -> \t).
 * 2. Strips unwanted newlines in single-line math expressions.
 * 3. Converts common text trigonometric/Greek words (theta, alpha, beta, etc.) into LaTeX commands (\theta, \alpha, \beta).
 * 4. Replaces block delimiters ($$...$$, \[...\]) with inline delimiters so formulas don't split onto multiple lines.
 * 5. Auto-wraps bare LaTeX expressions in mixed sentences into $...$ so KaTeX auto-renders them cleanly.
 */
function normalizeMathText(str) {
  if (!str || typeof str !== 'string') return '';
  
  // Replace newlines with spaces so formulas stay on one line
  let s = str.replace(/\r?\n+/g, ' ').trim();

  // 1. Repair control characters corrupted by raw JSON parsing
  s = s.replace(/\x0c/g, '\\f');                       // Form feed (\x0c) -> \f (fixes \frac)
  s = s.replace(/\x08/g, '\\b');                       // Backspace (\x08) -> \b (fixes \beta, \bar)
  s = s.replace(/\t(heta|imes|ext|an|au|riangle)/g, '\\t$1'); // Tab (\x09) -> \t (fixes \theta, \times, \text, \tan)
  s = s.replace(/(?<!\\)int_/g, '\\int_');             // Lone int_ -> \int_
  s = s.replace(/(?<!\\)sum_/g, '\\sum_');             // Lone sum_ -> \sum_
  s = s.replace(/(?<!\\)lim_/g, '\\lim_');             // Lone lim_ -> \lim_
  s = s.replace(/(?<!\\)sqrt\{/g, '\\sqrt{');          // Lone sqrt{ -> \sqrt{
  s = s.replace(/(?<!\\)frac\{/g, '\\frac{');          // Lone frac{ -> \frac{

  // 2. Convert display/block delimiters ($$ or \[ \]) to inline ($) so options NEVER break into multiple lines
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, '$$$1$$');
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');

  // 3. Auto-convert common math words to LaTeX if backslash was missed by the LLM
  // e.g. "sin^2 theta" -> "\sin^2 \theta"
  const greekAndMathWords = [
    'theta', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'lambda', 'mu', 'pi', 'sigma', 'omega', 'phi', 'psi',
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'lim', 'times', 'cdot', 'approx', 'neq', 'pm'
  ];

  for (const word of greekAndMathWords) {
    const regex = new RegExp(`(?<!\\\\)\\b${word}\\b`, 'g');
    s = s.replace(regex, `\\${word}`);
  }

  // 4. Auto-wrap bare LaTeX expressions in mixed sentences
  // e.g. "What is \frac{d}{dx}\int_{0}^{x} f(t),dt?" -> "What is $\frac{d}{dx}\int_{0}^{x} f(t),dt$?"
  const parts = s.split(/(\$[^\$]+\$)/g);
  s = parts.map((part) => {
    if (part.startsWith('$') && part.endsWith('$')) return part;
    return part.replace(/(\\[a-zA-Z]+[a-zA-Z0-9\s\\\{\}\^\_\+\-\*\/\(\)\,\=\.]*?)(?=[\?\!\:\;]?(?:\s+[A-Za-z]{3,}|\s*$|\?|\!|$))/g, (m) => {
      const trimmed = m.trim();
      return trimmed ? `$${trimmed}$` : m;
    });
  }).join('');

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
