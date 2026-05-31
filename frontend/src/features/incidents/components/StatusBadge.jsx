const config = {
  open: {
    label: 'Open',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
  investigating: {
    label: 'Investigating',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status }) => {
  const { label, className, dot } = config[status] || config.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;