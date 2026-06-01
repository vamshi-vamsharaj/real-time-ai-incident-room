import Spinner from '../../../shared/components/Spinner';

/**
 * StatusWorkflow
 *
 * Displays the current status and the available next transition as a
 * single prominent button. When there are no more transitions (resolved),
 * it shows a final state indicator instead.
 *
 * Design principle: show exactly one action at a time. No dropdowns,
 * no ambiguity — the workflow is linear.
 */

const NEXT = {
  open: { status: 'investigating', label: 'Start Investigating', icon: '⚡' },
  investigating: { status: 'resolved', label: 'Mark as Resolved', icon: '✓' },
  resolved: null,
};

const STEP_LABEL = {
  open: '1 of 3',
  investigating: '2 of 3',
  resolved: '3 of 3',
};

const StatusWorkflow = ({ currentStatus, onChangeStatus, loading, error }) => {
  const next = NEXT[currentStatus];

  return (
    <div className="space-y-2">
      {/* Progress indicator */}
      <div className="flex items-center gap-1.5 mb-3">
        {['open', 'investigating', 'resolved'].map((s, idx) => {
          const states = ['open', 'investigating', 'resolved'];
          const currentIdx = states.indexOf(currentStatus);
          const isPast    = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isPast
                    ? 'bg-emerald-400 dark:bg-emerald-500 w-8'
                    : isCurrent
                    ? 'bg-blue-500 w-8'
                    : 'bg-slate-200 dark:bg-slate-700 w-6'
                }`}
              />
            </div>
          );
        })}
        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 tabular-nums">
          {STEP_LABEL[currentStatus]}
        </span>
      </div>

      {/* Action button or final state */}
      {next ? (
        <button
          onClick={() => onChangeStatus(next.status)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-700 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <span className="text-base leading-none">{next.icon}</span>
          )}
          {loading ? 'Updating…' : next.label}
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Incident resolved
        </div>
      )}

      {/* Transition error */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default StatusWorkflow;