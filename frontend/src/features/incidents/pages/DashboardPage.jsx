import { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import IncidentList from '../components/IncidentList';
import IncidentForm from '../components/IncidentForm';
import StatCard from '../components/StatCard';
import Spinner from '../../../shared/components/Spinner';
import { useTheme } from '../../../context/ThemeContext';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ── Stat card definitions ──────────────────────────────────────────────
const STATS = [
  {
    key: 'total',
    label: 'Total Incidents',
    compute: (i) => i.length,
    accent: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700/60',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'open',
    label: 'Open',
    compute: (i) => i.filter((x) => x.status === 'open').length,
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800/40',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="3" fill="currentColor" opacity="0.35" />
      </svg>
    ),
  },
  {
    key: 'investigating',
    label: 'Investigating',
    compute: (i) => i.filter((x) => x.status === 'investigating').length,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 12.5L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'resolved',
    label: 'Resolved',
    compute: (i) => i.filter((x) => x.status === 'resolved').length,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const DashboardPage = () => {
  // removeIncident is the optimistic local-removal fn from useIncidents.
  // It's also called automatically via the incident:deleted socket event,
  // so calling it from the card's onDeleted prop (same-tab) just deduplicates
  // the removal via the existing _id check in the hook.
  const { incidents, loading, error, addIncident, removeIncident } = useIncidents();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const { dark, toggle } = useTheme();

  // ── Filtered + sorted list ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return incidents
      .filter((i) => {
        if (filterStatus !== 'all' && i.status !== filterStatus) return false;
        if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.reporter_name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [incidents, search, filterStatus, filterPriority]);

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">

      {/* ── NAVBAR ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="white" className="dark:stroke-slate-900" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M7 1v12M1 4l6 3 6-3" stroke="white" className="dark:stroke-slate-900" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              IncidentRoom
            </span>
          </div>

          {/* Search — hidden on mobile */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents…"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-600 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
            {/* Live indicator */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>

            {/* Create */}
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-2">
            Incident Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Monitor, track and resolve critical incidents in real time.
          </p>
        </div>

        {/* ── STATS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {STATS.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              value={s.compute(incidents)}
              icon={s.icon}
              accent={s.accent}
              bg={s.bg}
              border={s.border}
              loading={loading}
            />
          ))}
        </div>

        {/* ── FILTERS ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter:</span>

          {['all', 'open', 'investigating', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all capitalize ${
                filterStatus === s
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all capitalize ${
                filterPriority === p
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Showing count */}
        {!loading && incidents.length > 0 && (
          <p className="text-xs text-slate-400 mb-4">
            Showing {filtered.length} of {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── CONTENT ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-slate-500 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          // Pass removeIncident so each IncidentCard can call it after
          // a successful delete (same-tab optimistic update).
          // The socket handler in useIncidents deduplicates cross-tab removals.
          <IncidentList
            incidents={filtered}
            onCreateClick={() => setShowForm(true)}
            onDeletedIncident={removeIncident}
          />
        )}
      </main>

      {/* Mobile search bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents…"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <IncidentForm
          onClose={() => setShowForm(false)}
          onCreated={(incident) => {
            addIncident(incident);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;