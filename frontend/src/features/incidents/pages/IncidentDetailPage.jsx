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

// ── Tiny helpers ──────────────────────────────────────────────────────
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

// ── Sidebar row ───────────────────────────────────────────────────────
const MetaRow = ({ label, children }) => (
  <div>
    <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </p>
    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{children}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────
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

  // ── Loading / Error ───────────────────────────────────────────────
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

  // ── Page ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">

      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 12L3 7l6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          {/* Breadcrumb */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-300 dark:text-slate-600">
            <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-slate-900 dark:text-slate-100 font-medium truncate max-w-xs">
            {incident.title}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Live badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>

            
          </div>
        </div>
      </header>

      {/* ── BODY: 2-col layout ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6">

          {/* ── LEFT: Main content ────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <PriorityBadge priority={incident.priority} />
                {/* StatusBadge transitions smoothly when status changes via socket */}
                <StatusBadge status={incident.status} size="lg" />
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug mb-3">
                {incident.title}
              </h1>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Activity timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400">
                  <path d="M8 2v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Activity
                </h2>
                {!updatesLoading && (
                  <span className="ml-auto text-[11px] text-slate-400 tabular-nums">
                    {updates.length} update{updates.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <UpdateFeed
                updates={updates}
                loading={updatesLoading}
                error={updatesError}
                newestId={newestId}
              />
            </div>

            {/* Post update form */}
            {incident.status !== 'resolved' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Post Update
                </h2>
                <UpdateForm incidentId={id} onPosted={handlePosted} />
              </div>
            )}

            {/* Resolved — no more updates allowed */}
            {incident.status === 'resolved' && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 dark:text-slate-500">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5.5 8l2 2L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                This incident has been resolved. No further updates can be posted.
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ────────────────────────────────────── */}
          <aside className="xl:w-72 flex-shrink-0 space-y-4">

            {/* Status workflow */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Status Workflow
              </p>
              <StatusWorkflow
                currentStatus={incident.status}
                onChangeStatus={handleStatusChange}
                loading={statusChanging}
                error={statusError}
              />
            </div>

            {/* Metadata */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Details
              </p>

              <MetaRow label="Reporter">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    {incident.reporter_name?.[0]?.toUpperCase()}
                  </span>
                  {incident.reporter_name}
                </span>
              </MetaRow>

              <MetaRow label="Priority">
                <PriorityBadge priority={incident.priority} />
              </MetaRow>

              <MetaRow label="Status">
                <StatusBadge status={incident.status} />
              </MetaRow>

              <MetaRow label="Created">
                <span className="text-slate-600 dark:text-slate-300 text-sm">
                  {fmt(incident.created_at)}
                </span>
              </MetaRow>

              <MetaRow label="Last Updated">
                <span className="text-slate-600 dark:text-slate-300 text-sm">
                  {timeAgo(incident.updated_at || incident.created_at)}
                </span>
              </MetaRow>

              {incident.latest_update && (
                <MetaRow label="Latest Update">
                  <span className="text-slate-500 dark:text-slate-400 text-xs italic leading-relaxed">
                    {incident.latest_update}
                  </span>
                </MetaRow>
              )}
            </div>

            {/* Phase 5 placeholder */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-5 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto mb-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400">
                  <path d="M7 1l1.8 3.6L13 5.5l-3 2.9.7 4.1L7 10.4 3.3 12.5l.7-4.1-3-2.9 4.2-.9L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                AI Summary
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Coming in Phase 5
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;