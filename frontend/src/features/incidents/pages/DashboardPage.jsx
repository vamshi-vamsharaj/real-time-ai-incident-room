import { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import IncidentList from '../components/IncidentList';
import IncidentForm from '../components/IncidentForm';
import Spinner from '../../../shared/components/Spinner';
import { useTheme } from '../../../context/ThemeContext';

const statConfig = [
  {
    key: 'total',
    label: 'Total Incidents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    compute: (incidents) => incidents.length,
    accent: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700/60',
  },
  {
    key: 'open',
    label: 'Open',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="3" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    compute: (incidents) => incidents.filter((i) => i.status === 'open').length,
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800/40',
  },
  {
    key: 'high',
    label: 'High Priority',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l7 13H2L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 8v3M9 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    compute: (incidents) => incidents.filter((i) => i.priority === 'critical' || i.priority === 'high').length,
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800/40',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    compute: (incidents) => incidents.filter((i) => i.status === 'resolved').length,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
  },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const DashboardPage = () => {
  const { incidents, loading, error, addIncident } = useIncidents();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const { dark, toggle } = useTheme();

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="white" className="dark:stroke-slate-900" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M7 1v12M1 4l6 3 6-3" stroke="white" className="dark:stroke-slate-900" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              IncidentRoom
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              >
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
            

            {/* Create button */}
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
        {/* ── HERO ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-[11px] font-medium text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-2">
            Incident Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Monitor, track and resolve critical incidents in real time.
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {statConfig.map(({ key, label, icon, compute, accent, bg, border }) => (
            <div
              key={key}
              className={`rounded-xl border ${border} ${bg} px-5 py-4 flex items-center gap-4 transition-all`}
            >
              <div className={`${accent} flex-shrink-0`}>{icon}</div>
              <div>
                <p className={`text-2xl font-bold ${accent} leading-none mb-1`}>
                  {loading ? '—' : compute(incidents)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter:</span>

          {['all', 'open', 'investigating', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all capitalize ${
                filterStatus === s
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
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
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}

          {(search || filterStatus !== 'all' || filterPriority !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); }}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── INCIDENT COUNT ── */}
        {!loading && incidents.length > 0 && (
          <p className="text-xs text-slate-400 mb-4">
            Showing {filtered.length} of {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v5M10 14v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <IncidentList incidents={filtered} onCreateClick={() => setShowForm(true)} />
        )}
      </main>

      {/* Mobile search */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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

      {/* Form modal */}
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