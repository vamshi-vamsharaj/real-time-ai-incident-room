import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useIncident from '../hooks/useIncident';
import useUpdates from '../../../features/updates/hooks/useUpdates';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusWorkflow from '../components/StatusWorkflow';
import UpdateFeed from '../../../features/updates/components/UpdateFeed';
import UpdateForm from '../../../features/updates/components/UpdateForm';
import Spinner from '../../../shared/components/Spinner';
import { useTheme } from '../../../context/ThemeContext';
import AISummaryPanel from '../../../features/ai/components/AISummaryPanel';

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PRIORITY_ACCENT = {
  critical: 'bg-red-500',
  high:     'bg-amber-500',
  medium:   'bg-blue-500',
  low:      'bg-slate-400',
};

const IncidentDetailPage = () => {
  const { id } = useParams();
  const { dark, toggle } = useTheme();

  const {
    incident,
    loading,
    error,
    statusChanging,
    statusError,
    changeStatus,
  } = useIncident(id);

  const { updates, loading: updatesLoading, error: updatesError, addUpdate } = useUpdates(id);
  const [newestId, setNewestId] = useState(null);

  const handlePosted = (update) => {
    addUpdate(update);
    setNewestId(update._id);
  };

  const handleStatusChange = async (newStatus) => {
    await changeStatus(newStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600 dark:text-red-400">{error || 'Incident not found'}</p>
        <Link to="/" className="text-xs text-slate-500 underline">← Back to dashboard</Link>
      </div>
    );
  }

  const priorityAccent = PRIORITY_ACCENT[incident.priority] || PRIORITY_ACCENT.medium;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">

      {/* ── Sticky top nav ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 [transform:translateZ(0)]">
        <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 12L3 7l6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
          <span className="text-slate-200 dark:text-slate-700">/</span>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate max-w-[240px]">
            {incident.title}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3.05 3.05l1.06 1.06M9.89 9.89l1.06 1.06M10.95 3.05l-1.06 1.06M4.11 9.89l-1.06 1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12 7.5A5 5 0 016 2a5 5 0 100 10 5 5 0 006-4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Priority accent bar ───────────────────────────────────── */}
      <div className={`h-0.5 ${priorityAccent} opacity-70`} />

      {/* ── Page body ─────────────────────────────────────────────── */}
      {/*
        FIX 1: sidebar width 340px → 420px (minmax(0,1fr) 420px)
        FIX 2: gap-6 → gap-8 for more breathing room
        FIX 3: py-6 → py-8 to give both columns room to start level
      */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8 xl:items-start">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Main content
              ══════════════════════════════════════════ */}
          <div className="min-w-0 space-y-5">

            {/* ── Incident header card ──────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <PriorityBadge priority={incident.priority} />
                <StatusBadge status={incident.status} size="lg" />
              </div>

              {/* FIX 4: title text-xl → text-2xl */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug mb-2">
                {incident.title}
              </h1>

              {/* FIX 5: description text-sm stays but color improved */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                {incident.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 dark:text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1.5 11c0-2.21 2.01-4 4.5-4s4.5 1.79 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {incident.reporter_name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 dark:text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3.5v2.8l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {fmt(incident.created_at)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 dark:text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Updated {timeAgo(incident.updated_at || incident.created_at)}
                </span>
              </div>
            </div>

            {/* ── Unified Activity Timeline ───────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400">
                    <path d="M7 1v4l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  {/* FIX 6: section title text-sm → text-base */}
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    Activity
                  </h2>
                </div>
                {!updatesLoading && (
                  <span className="text-xs text-slate-400 tabular-nums">
                    {updates.length} update{updates.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="px-6 py-5">
                <UpdateFeed
                  updates={updates}
                  loading={updatesLoading}
                  error={updatesError}
                  newestId={newestId}
                />
              </div>
            </div>

            {/* ── Post Update form ────────────────────────── */}
            {incident.status !== 'resolved' ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Post Update
                </h2>
                <UpdateForm incidentId={id} onPosted={handlePosted} />
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-5 py-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 dark:text-slate-500">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 7.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                This incident is resolved. No further updates can be posted.
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Sticky sidebar
              ══════════════════════════════════════════ */}
          {/*
            FIX 7: sticky top — header is 48px (h-12) + priority bar 2px + page padding 32px (py-8)
            Using top-6 (24px) because the sidebar is inside the padded grid container,
            so the offset from viewport top = header(48px) + bar(2px) + container top padding(32px)
            We want the sidebar to stick 24px below the header bar so: top-[58px]
          */}
          <aside className="xl:sticky xl:top-[58px] xl:h-[calc(100vh-58px)] xl:overflow-y-auto min-w-0 xl:pr-1">
  <div className="space-y-5 pb-8">
            {/* ── Status Workflow ───────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              {/* FIX 8: section labels text-[10px] → text-xs */}
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Status Workflow
              </p>
              <StatusWorkflow
                currentStatus={incident.status}
                onChangeStatus={handleStatusChange}
                loading={statusChanging}
                error={statusError}
              />
            </div>

            {/* ── Incident Details ─────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Details
              </p>
              <div className="space-y-3.5">
                <DetailRow label="Reporter">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-[9px] font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">
                      {incident.reporter_name?.[0]?.toUpperCase()}
                    </span>
                    {/* FIX 9: detail values text-sm stays, consistent */}
                    <span className="text-sm text-slate-700 dark:text-slate-300">{incident.reporter_name}</span>
                  </span>
                </DetailRow>
                <DetailRow label="Priority">
                  <PriorityBadge priority={incident.priority} />
                </DetailRow>
                <DetailRow label="Status">
                  <StatusBadge status={incident.status} />
                </DetailRow>
                <DetailRow label="Created">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{fmt(incident.created_at)}</span>
                </DetailRow>
                <DetailRow label="Updated">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{timeAgo(incident.updated_at || incident.created_at)}</span>
                </DetailRow>
                {incident.latest_update && (
                  <DetailRow label="Last note">
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
                      {incident.latest_update}
                    </span>
                  </DetailRow>
                )}
              </div>
            </div>

            {/* ── AI Analysis ──────────────────────────── */}
            <AISummaryPanel incidentId={id} isResolved={incident.status === 'resolved'} />
 </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 flex-shrink-0 w-16">
      {label}
    </span>
    <div className="flex-1 min-w-0 text-right">{children}</div>
  </div>
);

export default IncidentDetailPage;