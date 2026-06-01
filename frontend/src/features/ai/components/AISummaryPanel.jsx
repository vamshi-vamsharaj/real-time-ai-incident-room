import { useState } from 'react';
import useAI from '../hooks/useAI';
import AIResultCard from './AIResultCard';

// ── Loading skeleton ──────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="space-y-5 animate-pulse px-6 pb-6">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
      <div className="h-3.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="space-y-2.5">
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
      <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full" />
      <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="h-px bg-slate-100 dark:bg-slate-800" />
    <div className="space-y-2 pl-3">
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
      <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <p className="text-xs text-center text-slate-400 dark:text-slate-600 pt-1">
      Analysing incident data…
    </p>
  </div>
);

// ── Empty / CTA state ─────────────────────────────────────────────────────
const EmptyState = ({ onGenerate, isGenerating, generateError, isResolved }) => (
  <div className="px-6 pb-6 flex flex-col items-center text-center gap-4 pt-2">
    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 17 17" fill="none" className="text-violet-500">
        <path d="M8.5 1.5l1.6 4L14.5 7l-3.2 2.9.8 4.4-4.1-2.3L4 14.3l.8-4.4L1.5 7l4.4-.5L8.5 1.5z"
          stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      </svg>
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
        AI Incident Intelligence
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-[240px]">
        Risk assessment, key findings, and recommended actions — generated from live incident data.
      </p>
    </div>

    {generateError && (
      <p className="text-xs text-red-500 dark:text-red-400 leading-snug max-w-[240px]">
        {generateError}
      </p>
    )}

    <button
      onClick={onGenerate}
      disabled={isGenerating || isResolved}
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
        isResolved
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white shadow-sm'
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 1l1.1 2.7L9.5 5 7.2 7l.6 3L5.5 8.5 3.2 10l.6-3L1.5 5l2.9-.3L5.5 1z"
          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
      {isResolved ? 'Incident Resolved' : 'Generate Analysis'}
    </button>

    {isResolved && (
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Past analyses are available below if previously generated.
      </p>
    )}
  </div>
);

// ── History cards — replaces the tab rail ─────────────────────────────────
// Each card shows timestamp, provider, risk level, and a text preview.
// Clicking selects that result for display in the main area.

const RISK_MINI = {
  critical: { dot: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',     label: 'Critical' },
  high:     { dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400', label: 'High'     },
  medium:   { dot: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',   label: 'Medium'   },
  low:      { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Low'  },
};

const fmtShort = (d) =>
  d ? new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '—';

const HistoryCards = ({ results, selectedIndex, onSelect }) => {
  if (results.length <= 1) return null;

  return (
    <div className="px-6 pb-2">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
        History
      </p>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {results.map((r, i) => {
          const risk = RISK_MINI[r.risk_level] || RISK_MINI.medium;
          const isSelected = selectedIndex === i;
          const label = i === 0 ? 'Latest' : `Generation ${results.length - i}`;

          return (
            <button
              key={r._id}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Top row: label + timestamp */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${
                  isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {label}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                  {fmtShort(r.generated_at)}
                </span>
              </div>
              {/* Bottom row: risk level + provider + preview */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${risk.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                  {risk.label} Risk
                </span>
                <span className="text-[11px] text-slate-300 dark:text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {r.is_fallback ? 'Rule-based' : 'Gemini AI'}
                </span>
              </div>
              {/* Preview text */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">
                {r.executive_summary}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────
const AISummaryPanel = ({ incidentId, isResolved }) => {
  const { results, loading, isGenerating, generateError, generate } = useAI(incidentId);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const showSkeleton = isGenerating && results.length === 0;
  const showEmpty    = !isGenerating && results.length === 0;
  const selectedResult = results[selectedIndex] || null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* ── Panel header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none" className="text-violet-500">
            <path d="M6.5 1l1.3 3L11.5 5l-2.6 2.5.6 3.5L6.5 9.3 3.5 11l.6-3.5L1.5 5l3.7-.8L6.5 1z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
          </svg>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            AI Analysis
          </h2>
          {results.length > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              {results.length} generation{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Regenerate — only when results already exist */}
        {results.length > 0 && !isResolved && (
          <button
            onClick={() => { generate(); setSelectedIndex(0); }}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-all disabled:opacity-40"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none"
              className={isGenerating ? 'animate-spin' : ''}>
              <path d="M9 5A4 4 0 1 1 5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M5 1l1.5 1.5L5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isGenerating ? 'Analysing…' : 'Regenerate'}
          </button>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}

      {/* Initial history load shimmer */}
      {loading && results.length === 0 && !isGenerating && (
        <div className="space-y-2.5 animate-pulse px-6 py-5">
          <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      )}

      {/* Skeleton while first generation is in-flight */}
      {showSkeleton && <div className="pt-5"><LoadingSkeleton /></div>}

      {/* Inline "generating" banner when results already exist */}
      {isGenerating && results.length > 0 && (
        <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
          <svg width="12" height="12" viewBox="0 0 11 11" fill="none" className="text-violet-500 animate-spin flex-shrink-0">
            <path d="M10 5.5A4.5 4.5 0 1 1 5.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-violet-600 dark:text-violet-400">Generating new analysis…</span>
        </div>
      )}

      {/* Error (when results already exist) */}
      {generateError && results.length > 0 && (
        <p className="mx-6 mt-4 text-xs text-red-500 dark:text-red-400">{generateError}</p>
      )}

      {/* Empty state — no results yet */}
      {showEmpty && !loading && (
        <div className="pt-5">
          <EmptyState
            onGenerate={generate}
            isGenerating={isGenerating}
            generateError={generateError}
            isResolved={isResolved}
          />
        </div>
      )}

      {/* Results: selected analysis + history cards below */}
      {!showEmpty && !showSkeleton && results.length > 0 && (
        <div className="pt-5 space-y-6">
          {/* Selected result */}
          {selectedResult && (
            <div className="animate-fadeIn">
              <AIResultCard result={selectedResult} isLatest={selectedIndex === 0} />
            </div>
          )}

          {/* History cards — only shown when multiple results exist */}
          <HistoryCards
            results={results}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          {/* Bottom padding */}
          <div className="pb-2" />
        </div>
      )}
    </div>
  );
};

export default AISummaryPanel;