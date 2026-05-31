const config = {
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 border border-red-300',
  },
  high: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 border border-orange-300',
  },
  medium: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-800 border border-blue-300',
  },
  low: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
};

const PriorityBadge = ({ priority }) => {
  const { label, className } = config[priority] || config.low;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
};

export default PriorityBadge;