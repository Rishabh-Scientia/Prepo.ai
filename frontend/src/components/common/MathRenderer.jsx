import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Parses and renders text containing KaTeX expressions ($inline$ or $$display$$).
 */
export function MathRenderer({ text = '', className = '' }) {
  const renderedHtml = useMemo(() => {
    if (!text || typeof text !== 'string') return '';

    // Regex to capture $$...$$ (display) and $...$ (inline)
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const parts = text.split(mathRegex);

    return parts.map((part) => {
      if (!part) return '';

      // Block math: $$...$$
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        try {
          return katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return part;
        }
      }

      // Inline math: $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const formula = part.slice(1, -1).trim();
        try {
          return katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return part;
        }
      }

      // Plain text: escape HTML characters
      return part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br />');
    }).join('');
  }, [text]);

  return (
    <span
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export default MathRenderer;
