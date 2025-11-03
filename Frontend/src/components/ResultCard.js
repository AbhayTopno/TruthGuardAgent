import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function ResultCard({ results }) {
  const cardRef = useRef(null);
  const verdictRef = useRef(null);
  const evidenceRef = useRef([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
    );

    gsap.fromTo(
      verdictRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
    );

    if (evidenceRef.current.length > 0) {
      gsap.fromTo(
        evidenceRef.current,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.5,
          ease: 'power2.out',
        }
      );
    }
  }, [results]);

  if (results?.error) {
    return (
      <div className="backdrop-blur-xl bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-5xl mb-3">❌</div>
        <div className="text-red-400 font-semibold text-base sm:text-lg">
          {results.error}
        </div>
      </div>
    );
  }

  const resultData = results?.result || results || {};
  const formatted = results?.formatted_response || resultData?.raw_final || '';

  // strip fenced code blocks like ```markdown\n...\n```
  const stripFences = (s) =>
    typeof s === 'string'
      ? s.replace(/^```(?:[\w-]+)?\n/, '').replace(/\n```$/, '')
      : '';

  // Robust extractor: matches **Field:** value, Field: value, tolerates stray asterisks
  const extractFieldFromMarkdown = (md, field) => {
    if (!md) return undefined;
    const stripped = stripFences(md);

    // 1) Try matching bolded pattern: **Field:** value
    const boldRx = new RegExp(
      `\\*+\\s*${field}\\s*\\*+[:：]?\\s*([^\n\r]+)`,
      'i'
    );
    let m = stripped.match(boldRx);
    if (m && m[1]) return m[1].trim();

    // 2) Remove all asterisks and match "Field: value" at the start of any line (multiline)
    const noStars = stripped.replace(/\*/g, '');
    const lineRx = new RegExp(`^\\s*${field}\\s*[:：]\\s*([^\n\r]+)`, 'im');
    m = noStars.match(lineRx);
    if (m && m[1]) return m[1].trim();

    // 3) As a last resort, search anywhere for "Field" followed by a number/word
    const looseRx = new RegExp(`${field}\\s*[:：]?\\s*([\\d\\.]+|\\w+)`, 'i');
    m = stripped.match(looseRx);
    if (m && m[1]) return m[1].trim();

    return undefined;
  };

  // --- Extract verdict & confidence from formatted_response first ---
  let verdictRaw = undefined;
  let confidenceRaw = undefined;

  if (formatted) {
    verdictRaw = extractFieldFromMarkdown(formatted, 'Verdict');
    const confCandidate =
      extractFieldFromMarkdown(formatted, 'Confidence') ||
      extractFieldFromMarkdown(formatted, 'Confidence Score');
    if (confCandidate !== undefined) {
      // confidence may be "1.0", "0.7", "70", "70%"
      const numberMatch = (confCandidate + '').match(/[\d.]+/);
      if (numberMatch) {
        confidenceRaw = parseFloat(numberMatch[0]);
      } else {
        // if not numeric, attempt to parse as string number
        const parsed = parseFloat(confCandidate);
        if (!isNaN(parsed)) confidenceRaw = parsed;
      }
    }
  }

  // fallback to resultData fields only when formatted_response didn't provide them
  if (!verdictRaw) verdictRaw = resultData?.verdict;
  if (confidenceRaw === undefined || confidenceRaw === null)
    confidenceRaw = resultData?.confidence;

  // Normalize verdict (string)
  const verdict = (verdictRaw || 'unverified').toString().toLowerCase();

  // Normalize confidence to percent number for UI: if between 0 and 1 scale to 0-100
  const confidence =
    typeof confidenceRaw === 'number'
      ? Math.round(confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw)
      : typeof confidenceRaw === 'string' && !isNaN(parseFloat(confidenceRaw))
      ? Math.round(
          parseFloat(confidenceRaw) <= 1
            ? parseFloat(confidenceRaw) * 100
            : parseFloat(confidenceRaw)
        )
      : undefined;

  // Debug: remove in production
  console.log('ResultCard raw results:', results);
  console.log('Using formatted_response (stripped):', stripFences(formatted));
  console.log('verdictRaw (from formatted or fallback):', verdictRaw);
  console.log('confidenceRaw (from formatted or fallback):', confidenceRaw);
  console.log(
    'Displayed verdict:',
    verdict,
    'Displayed confidence (%):',
    confidence
  );

  // Evidence array
  let evidence = Array.isArray(resultData?.evidence) ? resultData.evidence : [];

  // Summary: prefer resultData.summary, fallback to markdown extraction
  const extractSummary = (md) => {
    if (!md) return undefined;
    const stripped = stripFences(md);
    const lines = stripped.split(/\r?\n/);
    const startIdx = lines.findIndex(
      (l) =>
        l.trim().toLowerCase().startsWith('### summary') ||
        l.trim().toLowerCase().startsWith('## summary')
    );
    if (startIdx === -1) return undefined;
    const acc = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^###?\s+/.test(lines[i])) break;
      if (lines[i].trim()) acc.push(lines[i].trim());
    }
    return acc.join(' ').trim();
  };

  const summary = resultData?.summary || extractSummary(formatted);

  const isTrue = verdict.includes('true');
  const isFalse = verdict.includes('false');

  const getVerdictColor = () => {
    if (isTrue) return 'from-green-500 to-emerald-600';
    if (isFalse) return 'from-red-500 to-rose-600';
    return 'from-yellow-500 to-orange-600';
  };

  const getVerdictIcon = () => {
    if (isTrue) return '✅';
    if (isFalse) return '❌';
    return '⚠️';
  };

  const getConfidenceColor = (c) => {
    if (c >= 80) return 'text-green-400';
    if (c >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      ref={cardRef}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl"
    >
      {/* Verdict Section */}
      <div
        ref={verdictRef}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 pb-6 border-b border-white/20"
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="text-4xl sm:text-5xl lg:text-6xl animate-bounce">
            {getVerdictIcon()}
          </div>
          <div>
            <h3 className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
              Verdict
            </h3>
            <p
              className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${getVerdictColor()} bg-clip-text text-transparent capitalize`}
            >
              {verdict}
            </p>
          </div>
        </div>

        {/* Confidence Score */}
        {confidence !== undefined && (
          <div className="w-full sm:w-auto sm:text-right">
            <h4 className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
              Confidence
            </h4>
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-32 h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getVerdictColor()} rounded-full transition-all duration-1000`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
              <span
                className={`text-xl sm:text-2xl font-bold ${getConfidenceColor(
                  confidence
                )}`}
              >
                {confidence}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Section */}
      {evidence && evidence.length > 0 && (
        <div>
          <h4 className="text-white font-semibold text-lg sm:text-xl mb-4 flex items-center space-x-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Evidence</span>
          </h4>
          <ul className="space-y-3">
            {evidence.map((item, i) => (
              <li
                key={i}
                ref={(el) => (evidenceRef.current[i] = el)}
                className="flex items-start space-x-2 sm:space-x-3 backdrop-blur-sm bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-blue-400 font-bold text-base sm:text-lg flex-shrink-0">
                  {i + 1}.
                </span>
                <span className="text-white/90 text-sm sm:text-base leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="text-white font-semibold text-base sm:text-lg mb-3 flex items-center space-x-2">
            <span className="text-xl sm:text-2xl">📝</span>
            <span>Summary</span>
          </h4>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed backdrop-blur-sm bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            {summary}
          </p>
        </div>
      )}

      {/* Full Markdown Report */}
      {formatted && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-base sm:text-lg flex items-center space-x-2">
              <span className="text-xl sm:text-2xl">📄</span>
              <span>Full Report</span>
            </h4>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(stripFences(formatted));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch (_) {}
              }}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 overflow-auto max-h-96">
            <pre className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {stripFences(formatted)}
            </pre>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-6 text-center text-white/40 text-xs sm:text-sm">
        <span>Verified at {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}

export default ResultCard;
