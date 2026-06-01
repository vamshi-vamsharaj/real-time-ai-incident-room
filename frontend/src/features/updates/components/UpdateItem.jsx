const timeLabel = (dateStr) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Deterministic color from author initials — gives each person
 * a consistent avatar color across the timeline.
 */
const avatarColor = (name = '') => {
  const colors = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

const UpdateItem = ({ update, isNew = false }) => {
  return (
    <div
      className={`flex gap-3 group animate-fadeIn ${isNew ? 'animate-slideUp' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5 ${avatarColor(update.author_name)}`}
      >
        {initials(update.author_name)}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {update.author_name}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
            {timeLabel(update.created_at)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {update.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateItem;