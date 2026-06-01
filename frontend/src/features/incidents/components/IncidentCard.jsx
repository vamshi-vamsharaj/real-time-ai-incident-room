import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

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

const IncidentCard = ({ incident }) => {
  const accent = priorityAccent[incident.priority] || priorityAccent.low;

  return (
    <Link
      to={`/incidents/${incident._id}`}
      className={`group block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${accent} p-5 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-950/40 hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn`}
    >
      {/* Title + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {incident.title}
        </h3>
        {/* StatusBadge transitions smoothly when status prop changes */}
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
  );
};

export default IncidentCard;