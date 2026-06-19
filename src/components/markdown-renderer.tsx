import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentListItems: React.ReactNode[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  const parseInline = (text: string): React.ReactNode => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {boldParts.flatMap((part, boldIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return [
              <strong key={`b-${boldIdx}`} className="font-bold text-white text-glow">
                {part.slice(2, -2)}
              </strong>
            ];
          }
          const codeParts = part.split(/(`.*?`)/g);
          return codeParts.map((subPart, codeIdx) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={`c-${boldIdx}-${codeIdx}`} className="bg-[#02306d]/40 border border-[#00b4d8]/20 px-1.5 py-0.5 rounded text-[#90e0ef] font-mono text-[11px]">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          });
        })}
      </>
    );
  };

  const flushList = (key: number) => {
    if (currentListType === 'ul' && currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc list-inside ml-4 space-y-1.5 my-2.5 text-xs text-[#ade8f4]/85">
          {currentListItems}
        </ul>
      );
    } else if (currentListType === 'ol' && currentListItems.length > 0) {
      elements.push(
        <ol key={`ol-${key}`} className="list-decimal list-inside ml-4 space-y-1.5 my-2.5 text-xs text-[#ade8f4]/85">
          {currentListItems}
        </ol>
      );
    }
    currentListItems = [];
    currentListType = null;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Match unordered list item
    const ulMatch = line.match(/^(\*|-)\s+(.*)/);
    // Match ordered list item
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (ulMatch) {
      if (currentListType !== 'ul') {
        flushList(index);
        currentListType = 'ul';
      }
      currentListItems.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInline(ulMatch[2])}
        </li>
      );
    } else if (olMatch) {
      if (currentListType !== 'ol') {
        flushList(index);
        currentListType = 'ol';
      }
      currentListItems.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInline(olMatch[2])}
        </li>
      );
    } else {
      flushList(index);
      
      if (trimmedLine.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-sm font-bold text-[#00b4d8] mt-4 mb-2 tracking-wide uppercase">
            {parseInline(trimmedLine.slice(4))}
          </h3>
        );
      } else if (trimmedLine.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-base font-extrabold text-white mt-5 mb-2.5 border-b border-[#02306d]/20 pb-1">
            {parseInline(trimmedLine.slice(3))}
          </h2>
        );
      } else if (trimmedLine.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} className="text-lg font-black text-white mt-6 mb-3">
            {parseInline(trimmedLine.slice(2))}
          </h1>
        );
      } else if (trimmedLine !== '') {
        elements.push(
          <p key={`p-${index}`} className="text-xs text-[#ade8f4]/85 leading-relaxed my-2">
            {parseInline(trimmedLine)}
          </p>
        );
      }
    }
  });

  // Flush any remaining list at the end
  flushList(lines.length);

  return <div className="markdown-body space-y-1">{elements}</div>;
};
