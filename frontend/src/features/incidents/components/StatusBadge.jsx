/**
 * StatusBadge
 *
 * Displays the current status as a colored pill with an animated dot.
 * Uses CSS transitions so switching between statuses animates smoothly.
 * No flash — colors crossfade via Tailwind's transition utilities.
 */

const config = {
  open: {
    label: 'Open',
    pill: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    dot: 'bg-red-500 animate-pulse',
  },
  investigating: {
    label: 'Investigating',
    pill: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    pill: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const { label, pill, dot } = config[status] || config.open;

  const textSize = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1';
  const dotSize  = size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide transition-all duration-300 ${pill} ${textSize}`}
    >
      <span className={`rounded-full flex-shrink-0 transition-colors duration-300 ${dot} ${dotSize}`} />
      {label}
    </span>
  );
};

export default StatusBadge;