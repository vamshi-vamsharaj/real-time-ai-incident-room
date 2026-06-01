/**
 * DeleteConfirmModal
 *
 * A focused danger-confirmation dialog. Design language: GitHub / Linear —
 * muted background, crisp border, high-contrast danger CTA, subtle animation.
 *
 * Props:
 *   onConfirm  — async fn; called when "Delete Incident" is clicked
 *   onClose    — fn; called on Cancel or backdrop click or Escape
 *   deleting   — bool; shows spinner and disables buttons while in-flight
 *   error      — string | null; shown inline if the DELETE call fails
 */

import { useEffect, useRef } from 'react';

const DeleteConfirmModal = ({ onConfirm, onClose, deleting = false, error = null }) => {
  const cancelRef = useRef(null);

  // Auto-focus Cancel so Escape / Tab feels natural
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !deleting) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [deleting, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={() => !deleting && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 animate-slideUp">

        {/* ── Icon + Title ───────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            {/* Danger icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-red-500">
                <path
                  d="M9 2L1.5 15.5h15L9 2z"
                  stroke="currentColor" strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M9 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="13" r="0.7" fill="currentColor" />
              </svg>
            </div>

            <div className="min-w-0 pt-0.5">
              <h2
                id="delete-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug"
              >
                Delete Incident?
              </h2>
              <p
                id="delete-modal-description"
                className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
              >
                This action cannot be undone. All updates and AI analyses will
                be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* ── Inline error ───────────────────────────────────────────────── */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className={[
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'bg-red-600 hover:bg-red-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            {deleting ? (
              <>
                {/* Inline spinner */}
                <svg
                  className="animate-spin w-3.5 h-3.5 text-white/80"
                  viewBox="0 0 14 14" fill="none"
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M7 2a5 5 0 015 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7"
                    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete Incident
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;