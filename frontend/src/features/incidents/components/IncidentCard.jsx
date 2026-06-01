import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import DeleteConfirmModal from './DeleteConfirmModal';
import { deleteIncident as deleteIncidentApi } from '../services/incidentService';

const priorityAccent = {
  critical: 'border-l-red-500',
  high:     'border-l-orange-400',
  medium:   'border-l-blue-400',
  low:      'border-l-slate-300 dark:border-l-slate-600',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/**
 * IncidentCard
 *
 * Props:
 *   incident       — the incident object
 *   onDeleted(id)  — optional callback; called after a successful delete so the
 *                    parent (DashboardPage) can optimistically remove the card
 *                    and update stats before the socket event arrives.
 */
const IncidentCard = ({ incident, onDeleted }) => {
  const accent = priorityAccent[incident.priority] || priorityAccent.low;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState(null);

  const handleDeleteClick = (e) => {
    // Prevent the Link from navigating when clicking the trash button
    e.preventDefault();
    e.stopPropagation();
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteIncidentApi(incident._id);
      setShowDeleteModal(false);
      // Optimistic: tell parent immediately; socket will sync other tabs
      onDeleted?.(incident._id);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete incident');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setDeleteError(null);
    }
  };

  return (
    <>
      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div className="relative group">
        <Link
          to={`/incidents/${incident._id}`}
          className={[
            'block bg-white dark:bg-slate-900 rounded-xl',
            'border border-slate-200 dark:border-slate-800 border-l-4',
            accent,
            'p-5',
            'hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-950/40',
            'hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn',
          ].join(' ')}
        >
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 pr-6">
              {incident.title}
            </h3>
            <StatusBadge status={incident.status} />
          </div>

          {/* Description preview */}
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
            {incident.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <PriorityBadge priority={incident.priority} />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {incident.reporter_name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {timeAgo(incident.updated_at || incident.created_at)}
              </p>
            </div>
          </div>

          {/* Latest update strip */}
          {incident.latest_update && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic line-clamp-1">
                ↪ {incident.latest_update}
              </p>
            </div>
          )}
        </Link>

        {/* ── Delete button (hover reveal) ──────────────────────────── */}
        {/* Desktop: appears top-right on hover */}
        <button
          onClick={handleDeleteClick}
          title="Delete incident"
          aria-label="Delete incident"
          className={[
            // Position: overlaps the card, top-right corner
            'absolute top-3 right-3 z-10',
            // Sizing
            'w-6 h-6 flex items-center justify-center rounded-md',
            // Colors — subtle danger
            'text-slate-300 dark:text-slate-600',
            'hover:text-red-500 dark:hover:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-950/30',
            // Visibility: hidden until card is hovered; always visible on mobile
            'opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
            // On touch devices always show (no hover)
            'max-sm:opacity-100',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300',
          ].join(' ')}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleConfirm}
          onClose={handleClose}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </>
  );
};

export default IncidentCard;