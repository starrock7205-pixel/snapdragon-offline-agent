import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Copy, 
  BookOpen, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck, 
  ListFilter,
  CheckCircle,
  FileCode
} from 'lucide-react';

interface ResponseDisplayProps {
  /** The raw markdown or agent text output */
  content: string;
  /** Optional title for the summary */
  title?: string;
  /** Whether to show copy/view toggle controls */
  showControls?: boolean;
  /** Additional styling */
  className?: string;
}

/**
 * Filter out internal technical logs, GPU/NPU metrics, and tool execution traces
 * from user-facing text safely without swallowing normal paragraphs.
 */
function sanitizeAgentRawText(raw: string): string {
  if (!raw) return '';

  const lines = raw.split('\n');
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip technical tool execution lines, hardware telemetry artifacts, and system logs
    if (
      /^Tool\s+[A-Z_]+\s+finished/i.test(trimmed) ||
      /^Tool:\s+[A-Z_]+/i.test(trimmed) ||
      /^Invoking local tool:/i.test(trimmed) ||
      /^Observation from\s+[A-Z_]+/i.test(trimmed) ||
      /^Scan\s+\/workspace\//i.test(trimmed) ||
      /^Saved note\s+/i.test(trimmed) ||
      /^Found \d+ files matching/i.test(trimmed) ||
      /^ZERO CLOUD EGRESS/i.test(trimmed) ||
      /^ZERO CLOUD DISPATCH/i.test(trimmed) ||
      /^GPU Status:/i.test(trimmed) ||
      /^NPU TOPS:/i.test(trimmed) ||
      /^VRAM Allocated:/i.test(trimmed) ||
      /^Active Accelerator:/i.test(trimmed) ||
      /^First-Token Latency:/i.test(trimmed) ||
      /^Hardware & Diagnostics:/i.test(trimmed) ||
      /^Snapdragon Local Agent·\d+:\d+/i.test(trimmed) ||
      /^Agent Timeline \(\d+ Steps Logged\)/i.test(trimmed) ||
      /^Model experiencing high cloud demand/i.test(trimmed)
    ) {
      continue;
    }

    filteredLines.push(line);
  }

  return filteredLines.join('\n').trim();
}

/**
 * Clean up raw math formulas and markdown symbols into clear, normal typography
 */
function cleanTypography(str: string): string {
  if (!str) return '';

  return str
    // Standard physics/math formulas
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
    // Clean raw LaTeX command structures
    .replace(/\\vec\{([a-zA-Z0-9_\^]+)\}/g, '$1')
    .replace(/\\text\{([^\}]+)\}/g, '$1')
    .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^\}]+)\}/g, '√($1)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    // Clean Greek letters & math symbols
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\approx/g, '≈')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\infty/g, '∞')
    .replace(/\\int/g, '∫')
    .replace(/\\partial/g, '∂')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\omega/g, 'ω')
    .replace(/\^\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\degree/g, '°')
    .replace(/\\iff/g, '⟺')
    .replace(/\\implies/g, '⟹')
    // Remove standalone dollar signs around math formulas
    .replace(/\$\$([^\$]+)\$\$/g, '$1')
    .replace(/\$([^\$]+)\$/g, '$1')
    // Remove lingering LaTeX backslashes before known identifiers
    .replace(/\\(text|vec|frac|sum|prod|lim)/g, '')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    // Strip rogue backslashes and loose raw markdown clutter
    .replace(/\\/g, '')
    .replace(/^#{1,6}\s*$/gm, '');
}

/**
 * Helper to render inline bold, italic, code tags cleanly
 */
function renderInlineRich(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold + Italic text without stars
      parts.push(
        <strong key={`bi-${lastIndex}`} className="font-semibold italic text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Bold text without stars
      parts.push(
        <strong key={`b-${lastIndex}`} className="font-semibold text-white">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Italic text
      parts.push(
        <span key={`i-${lastIndex}`} className="italic text-neutral-200">
          {match[4]}
        </span>
      );
    } else if (match[5]) {
      // Inline code
      parts.push(
        <code key={`c-${lastIndex}`} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-amber-300">
          {match[5]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  content,
  title,
  showControls = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'compact'>('structured');

  // 1. Sanitize text by stripping technical logs & GPU telemetry
  const sanitizedText = useMemo(() => {
    return sanitizeAgentRawText(content);
  }, [content]);

  // Handle clean copy to clipboard
  const handleCopyClean = () => {
    const plainText = sanitizedText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '• ');

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Render lines with semantic styling and table parsing
  const rawLines = useMemo(() => cleanTypography(sanitizedText).split('\n'), [sanitizedText]);

  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (keyIdx: number) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map(r => 
      r.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1)
    );
    tableBuffer = [];
    if (rows.length < 2) return;

    const header = rows[0];
    const dataRows = rows.slice(1).filter(row => !row.every(c => /^:?-+:?$/.test(c)));

    renderedElements.push(
      <div key={`tbl-${keyIdx}`} className="my-3 overflow-x-auto rounded-xl border border-neutral-800 bg-[#0A0D14]/80 shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-neutral-900/90 border-b border-neutral-800">
              {header.map((col, cIdx) => (
                <th key={cIdx} className="px-3.5 py-2 font-mono text-[11px] font-semibold text-neutral-200 uppercase tracking-wider">
                  {renderInlineRich(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-sans">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2 text-neutral-300">
                    {renderInlineRich(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let idx = 0; idx < rawLines.length; idx++) {
    const rawLine = rawLines[idx];
    const line = rawLine.trim();

    // Check code blocks
    if (line.startsWith('```')) {
      flushTable(idx);
      if (inCodeBlock) {
        const fullCode = codeBuffer.join('\n');
        renderedElements.push(
          <div key={`code-${idx}`} className="my-3 rounded-xl border border-neutral-800 bg-[#0A0D14] overflow-hidden">
            <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Code Output</span>
              </span>
            </div>
            <pre className="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {fullCode}
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Markdown Table Rows (e.g. | Col 1 | Col 2 |)
    if (line.startsWith('|') && line.endsWith('|')) {
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable(idx);
    }

    // Blank line
    if (!line) {
      renderedElements.push(<div key={`sp-${idx}`} className="h-2" />);
      continue;
    }

    // Markdown horizontal rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
      renderedElements.push(<div key={`hr-${idx}`} className="my-3 border-t border-neutral-800/80" />);
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      renderedElements.push(
        <div key={`q-${idx}`} className="p-3 my-2 bg-neutral-900/70 border-l-2 border-[#E10600] rounded-r-xl text-xs text-neutral-300 leading-relaxed">
          {renderInlineRich(line.replace(/^>\s*/, ''))}
        </div>
      );
      continue;
    }

    // H4 Section Title
    if (line.startsWith('####')) {
      const hText = line.replace(/^#+\s*/, '').replace(/#+\s*$/, '');
      const isWarning = hText.toLowerCase().includes('warning') || hText.toLowerCase().includes('trap');
      const isTip = hText.toLowerCase().includes('tip') || hText.toLowerCase().includes('must-know') || hText.toLowerCase().includes('pillar');

      renderedElements.push(
        <div
          key={`h4-${idx}`}
          className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mt-4 mb-1.5 ${
            isWarning ? 'text-amber-400' : isTip ? 'text-red-400' : 'text-neutral-200'
          }`}
        >
          {isWarning ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : isTip ? (
            <Lightbulb className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0" />
          )}
          <span>{renderInlineRich(hText)}</span>
        </div>
      );
      continue;
    }

    // H3 Section Title
    if (line.startsWith('###')) {
      const hText = line.replace(/^#+\s*/, '').replace(/#+\s*$/, '');
      renderedElements.push(
        <h3
          key={`h3-${idx}`}
          className="text-sm sm:text-base font-bold text-white tracking-tight mt-5 mb-2 pb-1.5 border-b border-neutral-800/90 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{renderInlineRich(hText)}</span>
        </h3>
      );
      continue;
    }

    // H2 or H1
    if (line.startsWith('##') || line.startsWith('#')) {
      const hText = line.replace(/^#+\s*/, '').replace(/#+\s*$/, '');
      renderedElements.push(
        <h2 key={`h2-${idx}`} className="text-base sm:text-lg font-bold text-white tracking-tight mt-6 mb-2">
          {renderInlineRich(hText)}
        </h2>
      );
      continue;
    }

    // Bullet items (- or * or •)
    if (line.match(/^[-*•]\s+/)) {
      const itemText = line.replace(/^[-*•]\s+/, '');
      renderedElements.push(
        <div key={`li-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
          <span>{renderInlineRich(itemText)}</span>
        </div>
      );
      continue;
    }

    // Numbered items (1. 2. 3.)
    const numMatch = line.match(/^([0-9]+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed my-1.5 pl-1">
          <span className="font-mono text-xs font-bold text-[#E10600] bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 shrink-0">
            {numMatch[1]}
          </span>
          <span className="pt-0.5">{renderInlineRich(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular paragraph
    renderedElements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm text-neutral-300 leading-relaxed my-1.5">
        {renderInlineRich(line)}
      </p>
    );
  }

  if (tableBuffer.length > 0) {
    flushTable(rawLines.length);
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar with Action Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] inline-block shadow-[0_0_8px_rgba(225,6,0,0.7)]" />
            <span className="font-semibold text-white">
              {title || 'High-Yield Knowledge Summary'}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              ~{readTimeMin} min read ({wordCount} words)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-800">
              <button
                onClick={() => setViewMode('structured')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'structured'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Structured Cards View"
              >
                <ListFilter className="w-3 h-3" />
                <span>Executive</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Continuous Document View"
              >
                <BookOpen className="w-3 h-3" />
                <span>Article</span>
              </button>
            </div>

            {/* Clean Copy Button */}
            <button
              onClick={handleCopyClean}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                copied
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Clean Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={viewMode === 'structured' ? 'space-y-2' : 'p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2'}>
        {renderedElements}
      </div>

      {/* Human-Readable Bottom Signature */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Polished On-Device Summary · Cleaned for Study & Presentation</span>
        </span>
        <span className="font-mono text-neutral-400">Zero Cloud Network Egress</span>
      </div>
    </div>
  );
};
