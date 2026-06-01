/**
 * StatusBadge
 *
 * When `onChangeStatus` is provided:
 *   • Clicking the pill opens a compact dropdown showing ONLY the valid
 *     next transitions for the current status.
 *   • Resolved → no transitions → dropdown is disabled (pill is static).
 *   • A loading spinner replaces the animated dot while a PATCH is in-flight.
 *   • Click-outside closes the dropdown.
 *   • Keyboard: Enter/Space opens, Escape closes, Arrow keys navigate options.
 *
 * When `onChangeStatus` is omitted the badge is purely decorative (original behaviour).
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ── Static config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    pill:  'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    dot:   'bg-red-500 animate-pulse',
    ring:  'focus-visible:ring-red-300 dark:focus-visible:ring-red-700',
  },
  investigating: {
    label: 'Investigating',
    pill:  'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    dot:   'bg-amber-500 animate-pulse',
    ring:  'focus-visible:ring-amber-300 dark:focus-visible:ring-amber-700',
  },
  resolved: {
    label: 'Resolved',
    pill:  'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    dot:   'bg-emerald-500',
    ring:  'focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-700',
  },
};

// Valid forward-only transitions (mirrors backend)
const TRANSITIONS = {
  open:          ['investigating'],
  investigating: ['resolved'],
  resolved:      [],
};

const OPTION_CONFIG = {
  investigating: {
    label:       'Investigating',
    description: 'Mark as under investigation',
    icon:        (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 9L11.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    accent: 'text-amber-600 dark:text-amber-400',
    hover:  'hover:bg-amber-50 dark:hover:bg-amber-950/30',
  },
  resolved: {
    label:       'Resolved',
    description: 'Mark as fully resolved',
    icon:        (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: 'text-emerald-600 dark:text-emerald-400',
    hover:  'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

const StatusBadge = ({
  status,
  size          = 'sm',
  onChangeStatus,        // optional — when present badge becomes interactive
  loading: externalLoading = false,
}) => {
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(0); // keyboard nav index
  const containerRef          = useRef(null);
  const optionRefs            = useRef([]);

  const { label, pill, dot, ring } = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const nextStatuses               = TRANSITIONS[status] || [];
  const isInteractive              = !!onChangeStatus && nextStatuses.length > 0;

  const textSize = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1';
  const dotSize  = size === 'lg' ? 'w-2 h-2'             : 'w-1.5 h-1.5';

  // ── Click outside ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Focus first option when dropdown opens ────────────────────────────────
  useEffect(() => {
    if (open && optionRefs.current[0]) {
      optionRefs.current[0].focus();
      setFocused(0);
    }
  }, [open]);

  // ── Keyboard handler on the trigger pill ─────────────────────────────────
  const handleTriggerKeyDown = (e) => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  // ── Keyboard handler inside the dropdown ─────────────────────────────────
  const handleOptionKeyDown = (e, idx, nextStatus) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(nextStatus);
        break;
      case 'Escape':
        setOpen(false);
        containerRef.current?.querySelector('[data-trigger]')?.focus();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const next = Math.min(idx + 1, nextStatuses.length - 1);
        setFocused(next);
        optionRefs.current[next]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = Math.max(idx - 1, 0);
        setFocused(prev);
        optionRefs.current[prev]?.focus();
        break;
      }
      default:
        break;
    }
  };

  const select = useCallback((nextStatus) => {
    setOpen(false);
    onChangeStatus?.(nextStatus);
  }, [onChangeStatus]);

  // ── Spinner (while PATCH is in-flight) ───────────────────────────────────
  const Dot = externalLoading ? (
    <span className={`${dotSize} flex-shrink-0 relative`}>
      <span
        className={`absolute inset-0 rounded-full border-[1.5px] border-current opacity-30`}
      />
      <span
        className={`absolute inset-0 rounded-full border-t-[1.5px] border-current animate-spin`}
      />
    </span>
  ) : (
    <span
      className={`rounded-full flex-shrink-0 transition-colors duration-300 ${dot} ${dotSize}`}
    />
  );

  // ── Chevron (shown only when interactive and not resolved) ────────────────
  const Chevron = isInteractive && (
    <svg
      width="9" height="9"
      viewBox="0 0 9 9"
      fill="none"
      className={`flex-shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* ── Pill trigger ────────────────────────────────────────────────── */}
      <span
        data-trigger
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-haspopup={isInteractive ? 'listbox' : undefined}
        aria-expanded={isInteractive ? open : undefined}
        aria-label={isInteractive ? `Status: ${label}. Click to change` : undefined}
        onClick={() => isInteractive && setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className={[
          'inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide',
          'transition-all duration-300',
          pill,
          textSize,
          isInteractive
            ? `cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 ${ring} ${
                open ? 'shadow-sm' : 'hover:brightness-95 dark:hover:brightness-110'
              }`
            : 'cursor-default',
        ].join(' ')}
      >
        {Dot}
        {label}
        {Chevron}
      </span>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {open && isInteractive && (
        <div
          role="listbox"
          aria-label="Change status"
          className={[
            'absolute z-50 mt-1 w-52',
            // Position: on lg badge align left; on sm badge align right
            size === 'lg' ? 'left-0 top-full' : 'right-0 top-full',
            'bg-white dark:bg-slate-900',
            'rounded-xl border border-slate-200 dark:border-slate-800',
            'shadow-lg shadow-slate-200/60 dark:shadow-slate-950/60',
            'overflow-hidden animate-fadeIn',
          ].join(' ')}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Change status
            </p>
          </div>

          {/* Options */}
          {nextStatuses.map((nextStatus, idx) => {
            const opt = OPTION_CONFIG[nextStatus];
            if (!opt) return null;
            return (
              <button
                key={nextStatus}
                ref={(el) => { optionRefs.current[idx] = el; }}
                role="option"
                aria-selected={false}
                tabIndex={0}
                onClick={() => select(nextStatus)}
                onKeyDown={(e) => handleOptionKeyDown(e, idx, nextStatus)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5',
                  'text-left transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800',
                  opt.hover,
                ].join(' ')}
              >
                <span className={opt.accent}>{opt.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${opt.accent}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusBadge;