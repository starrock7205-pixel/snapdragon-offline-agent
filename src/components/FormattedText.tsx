import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Clean text formatter that strips raw markdown noise (asterisks, hashes, raw LaTeX codes)
 * and renders clean, elegant, normal typography.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  // 1. Sanitize raw LaTeX into clean readable Unicode
  const cleanLatex = (text: string) => {
    return text
      .replace(/\$\\vec\{F\}_\{?\\text\{net\}?\}?\s*=\s*m\\vec\{a\}\$/g, 'F_net = m · a')
      .replace(/\$\\Sigma\s*F\s*=\s*0\s*\\implies\s*v\s*=\s*\\text\{const\}\$/g, 'ΣF = 0 ⟹ v = constant')
      .replace(/\$\\vec\{F\}_\{?\\text\{pseudo\}?\}?\s*=\s*-m\\vec\{a\}\$/g, 'F_pseudo = -m · a')
      .replace(/\$F_\{?AB\}?\s*=\s*-F_\{?BA\}?\$/g, 'F_AB = -F_BA')
      .replace(/\$f_s\s*\\le\s*\\mu_s\s*N\$/g, 'f_s ≤ μ_s · N')
      .replace(/\$f_k\s*=\s*\\mu_k\s*N\$/g, 'f_k = μ_k · N')
      .replace(/\$\\tan\(\\theta\)\s*=\s*\\frac\{v\^2\}\{rg\}\$/g, 'tan(θ) = v² / (r · g)')
      .replace(/\$\\tan\(\\theta\)\s*=\s*\\frac\{v\^2\}\{r\s*\*\s*g\}\$/g, 'tan(θ) = v² / (r · g)')
      .replace(/\$n_1\s*\\sin\(\\theta_1\)\s*=\s*n_2\s*\\sin\(\\theta_2\)\$/g, 'n1 · sin(θ1) = n2 · sin(θ2)')
      .replace(/\$\\sin\(\\theta_c\)\s*=\s*\\frac\{n_2\}\{n_1\}\$/g, 'sin(θc) = n2 / n1')
      .replace(/\$\\sin\(\\theta_c\)\s*=\s*n_2\s*\/\s*n_1\$/g, 'sin(θc) = n2 / n1')
      .replace(/\$\\theta\s*=\s*\\frac\{\\pi\}\{4\}\s*-\s*\\frac\{\\alpha\}\{2\}\$/g, 'θ = 45° - α/2')
      .replace(/\$\\theta_c\s*=\s*59\.7\^\\circ\$/g, 'θc = 59.7°')
      .replace(/\\vec\{([a-zA-Z]+)\}/g, '$1')
      .replace(/\\text\{([^\}]+)\}/g, '$1')
      .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, '($1 / $2)')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\mu/g, 'μ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\delta/g, 'δ')
      .replace(/\\Sigma/g, 'Σ')
      .replace(/\\approx/g, '≈')
      .replace(/\\times/g, '×')
      .replace(/\\iff/g, '⟺')
      .replace(/\\implies/g, '⟹')
      .replace(/\$([^\$]+)\$/g, '$1'); // Strip remaining single dollar math signs
  };

  const lines = cleanLatex(content).split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2.5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInline = (str: string) => {
    // Parse **bold** and *italic* cleanly without leaving asterisks
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // Bold
        parts.push(
          <strong key={`b-${lastIndex}`} className="font-semibold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic
        parts.push(
          <span key={`i-${lastIndex}`} className="italic text-neutral-200">
            {match[3]}
          </span>
        );
      } else if (match[4]) {
        // Code
        parts.push(
          <code key={`c-${lastIndex}`} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-amber-300">
            {match[4]}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList();
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
      return;
    }

    // Blockquote
    if (line.startsWith('>')) {
      flushList();
      elements.push(
        <div key={`quote-${idx}`} className="p-3 my-2 bg-neutral-900/60 border-l-2 border-[#E10600] rounded-r-lg text-xs text-neutral-300">
          {renderInline(line.replace(/^>\s*/, ''))}
        </div>
      );
      return;
    }

    // Headings (H1, H2, H3, H4)
    if (line.startsWith('####')) {
      flushList();
      elements.push(
        <h4 key={`h4-${idx}`} className="text-xs font-bold text-white uppercase tracking-wider font-mono mt-4 mb-1.5 text-neutral-200 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          <span>{renderInline(line.replace(/^####\s*/, ''))}</span>
        </h4>
      );
      return;
    }

    if (line.startsWith('###')) {
      flushList();
      elements.push(
        <h3 key={`h3-${idx}`} className="text-sm font-bold text-white tracking-tight mt-5 mb-2 pb-1 border-b border-neutral-800/80 flex items-center gap-2">
          <span>{renderInline(line.replace(/^###\s*/, ''))}</span>
        </h3>
      );
      return;
    }

    if (line.startsWith('##')) {
      flushList();
      elements.push(
        <h2 key={`h2-${idx}`} className="text-base font-bold text-white tracking-tight mt-6 mb-2.5">
          {renderInline(line.replace(/^##\s*/, ''))}
        </h2>
      );
      return;
    }

    // Bullet list items (- or * or •)
    if (line.match(/^[-*•]\s+/)) {
      inList = true;
      const textWithoutBullet = line.replace(/^[-*•]\s+/, '');
      listItems.push(
        <li key={`li-${idx}`} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 shrink-0 mt-1.5" />
          <span>{renderInline(textWithoutBullet)}</span>
        </li>
      );
      return;
    }

    // Numbered list items (1. 2. 3.)
    const numMatch = line.match(/^([0-9]+)\.\s+(.*)/);
    if (numMatch) {
      inList = true;
      listItems.push(
        <li key={`li-num-${idx}`} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed">
          <span className="font-mono text-[11px] text-[#E10600] font-semibold shrink-0 mt-0.5">
            {numMatch[1]}.
          </span>
          <span>{renderInline(numMatch[2])}</span>
        </li>
      );
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-xs text-neutral-300 leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
