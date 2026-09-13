import React from 'react';

/**
 * Clean, lightweight Markdown & Rich Text Renderer for Prepo.ai Academy
 * Parses Headings (###, ##, #), bullet lists (- , * ), bold (**), italics (*),
 * inline code (`), and blockquotes cleanly without requiring heavy external dependencies.
 */
export function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let currentTable = [];
  let tableHeaderParsed = false;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-1.5 pl-5 list-disc text-gray-700 marker:text-primary-600">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = () => {
    if (currentTable.length > 0) {
      const headerRow = currentTable[0];
      const bodyRows = currentTable.slice(2); // skip separator row like |---|---|

      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-xl border border-surface-200 shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface-100 text-gray-800 font-bold border-b border-surface-200">
              <tr>
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3.5 py-2.5 font-bold" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2.5 text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = [];
      tableHeaderParsed = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table line: | Cell | Cell |
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      const cells = line.split('|').slice(1, -1);
      currentTable.push(cells);
      continue;
    } else if (currentTable.length > 0) {
      flushTable();
    }

    // Bullet points: - item or * item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.substring(2));
      continue;
    } else {
      flushList();
    }

    // Empty line
    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm sm:text-base font-extrabold text-gray-900 mt-4 mb-2 tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-4 bg-primary-600 rounded-full inline-block" />
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(4)) }} />
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-base sm:text-lg font-black text-gray-900 mt-5 mb-2.5 tracking-tight" dangerouslySetInnerHTML={{ __html: formatInline(line.substring(3)) }} />
      );
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-lg sm:text-xl font-black text-gray-900 mt-6 mb-3 tracking-tight" dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
      );
      continue;
    }

    // Blockquotes: > quote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-3 pl-4 border-l-3 border-primary-500 bg-primary-50/50 py-2 pr-3 rounded-r-xl text-xs sm:text-sm font-medium text-gray-700 italic">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
        </blockquote>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
  }

  flushList();
  flushTable();

  return <div className="space-y-1 text-gray-800">{elements}</div>;
}

// Inline formatting helper for bold, italic, code
function formatInline(text) {
  if (!text) return '';
  return text
    // Inline code `code`
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-200 text-primary-800 font-mono text-[11px] sm:text-xs font-semibold">$1</code>')
    // Bold **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-gray-900">$1</strong>')
    // Italic *text*
    .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800">$1</em>');
}

export default MarkdownContent;
