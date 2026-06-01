import { useEffect, useRef, useState } from 'react';

/**
 * StatCard
 *
 * Displays a single metric. When `value` changes, it plays a brief
 * scale-pop animation via CSS class toggling. This is pure CSS — no
 * third-party animation library needed.
 */
const StatCard = ({ label, value, icon, accent, bg, border, loading }) => {
  const [animating, setAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && !loading) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 400);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value, loading]);

  return (
    <div
      className={`rounded-xl border ${border} ${bg} px-5 py-4 flex items-center gap-4 transition-all duration-300`}
    >
      <div className={`${accent} flex-shrink-0`}>{icon}</div>
      <div>
        <p
          className={`text-2xl font-bold ${accent} leading-none mb-1 transition-transform duration-200 ${
            animating ? 'animate-countPop' : ''
          }`}
        >
          {loading ? '—' : value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard;