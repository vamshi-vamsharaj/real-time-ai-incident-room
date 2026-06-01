/**
 * AIResultCard — Refined
 *
 * Changes from previous version:
 * - px-4/p-4 → px-6/p-5 throughout (breathing room)
 * - Section label text-[10px] → text-xs
 * - Body text text-[13px] → text-sm
 * - Findings/actions items larger tap targets (py-1 → py-1.5)
 * - Risk card has more padding
 * - Bottom spacing increased
 */

const RISK = {
  critical: {
    label: 'Critical',
    bar:   'bg-red-500',
    badge: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400',
    card:  'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40',
    dot:   'bg-red-500',
    width: 'w-full',
  },
  high: {
    label: 'High',
    bar:   'bg-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400',
    card:  'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40',
    dot:   'bg-amber-500',
    width: 'w-3/4',
  },
  medium: {
    label: 'Medium',
    bar:   'bg-blue-500',
    badge: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400',
    card:  'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40',
    dot:   'bg-blue-500',
    width: 'w-1/2',
  },
  low: {
    label: 'Low',
    bar:   'bg-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400',
    card:  'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40',
    dot:   'bg-emerald-500',
    width: 'w-1/4',
  },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

// Section label + children — bumped from text-[10px] to text-xs
const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
      {title}
    </p>
    {children}
  </div>
);

const AIResultCard = ({ result, isLatest = false }) => {
  const risk = RISK[result.risk_level] || RISK.medium;

  return (
    // Outer wrapper — px-6 matches the panel's horizontal rhythm
    <div className="px-6 pb-2">
      <div className={`rounded-xl border overflow-hidden ${
        isLatest
          ? 'border-slate-200 dark:border-slate-700'
          : 'border-slate-100 dark:border-slate-800 opacity-85'
      }`}>

        {/* Risk level progress bar — top accent */}
        <div className="h-0.5 bg-slate-100 dark:bg-slate-800">
          <div className={`h-full ${risk.bar} ${risk.width} transition-all duration-500`} />
        </div>

        {/* Card header: risk badge + provider + timestamp */}
        <div className="px-5 pt-4 pb-3.5 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Risk badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${risk.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
              {risk.label} Risk
            </span>

            {/* Provider badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              result.is_fallback
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                : 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-600 dark:text-violet-400'
            }`}>
              {result.is_fallback ? (
                <>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1" />
                    <path d="M4.5 2.5v2.3l1.3 1.3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  Rule-based
                </>
              ) : (
                <>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M4.5 1l.9 2.3L8 4.5l-2.2 2-.4 2.7-2.4-1.5-2.4 1.5.4-2.7L.5 4.5l2.6-.7L4.5 1z"
                      stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                  </svg>
                  Gemini AI
                </>
              )}
            </span>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums flex-shrink-0">
            {fmt(result.generated_at)}
          </span>
        </div>

        {/* Card body — p-5 gives comfortable breathing room */}
        <div className="p-5 space-y-5">

          {/* Executive Summary */}
          <Section title="Summary">
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
              {result.executive_summary}
            </p>
          </Section>

          {/* Current Situation */}
          <Section title="Situation">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.current_situation}
            </p>
          </Section>

          {/* Key Findings */}
          {result.key_findings?.length > 0 && (
            <Section title="Key Findings">
              <ul className="space-y-2">
                {result.key_findings.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 py-0.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Risk Assessment block */}
          <Section title="Risk Assessment">
            <div className={`rounded-lg border px-4 py-3.5 ${risk.card}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${risk.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                  {risk.label}
                </span>
              </div>
              {/* risk_assessment.explanation if present, else fall back gracefully */}
              {(result.risk_assessment?.explanation || result.risk_level) && (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {result.risk_assessment?.explanation ||
                    `Risk classified as ${risk.label.toLowerCase()} based on incident priority and current status.`}
                </p>
              )}
            </div>
          </Section>

          {/* Recommended Actions */}
          {result.recommended_actions?.length > 0 && (
            <Section title="Recommended Actions">
              <ol className="space-y-2.5">
                {result.recommended_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {action}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Resolution Outlook */}
          <Section title="Outlook">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
              {result.resolution_outlook}
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default AIResultCard;