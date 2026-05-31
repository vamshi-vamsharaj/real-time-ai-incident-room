import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchIncidentById, patchStatus } from '../services/incidentService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../../../shared/components/Spinner';
import { useTheme } from '../../../context/ThemeContext';

const STATUS_TRANSITIONS = {
  open: ['investigating'],
  investigating: ['resolved'],
  resolved: [],
};

const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchIncidentById(id);
        setIncident(data);
      } catch {
        setError('Incident not found or failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await patchStatus(id, newStatus);
      setIncident(updated);
    } catch {
      // fail silently on detail page — socket will handle in Phase 3
    } finally {
      setUpdating(false);
    }
  };

  const nextStatuses = incident ? STATUS_TRANSITIONS[incident.status] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 12L3 7l6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="white" className="dark:stroke-slate-900" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">IncidentRoom</span>
            </div>
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-2">
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13.5 8.5A5.5 5.5 0 017.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 006-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Link to="/" className="mt-4 inline-block text-xs text-slate-500 underline">Go back</Link>
          </div>
        ) : incident && (
          <div className="space-y-6">
            {/* Header card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-7">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <PriorityBadge priority={incident.priority} />
                <StatusBadge status={incident.status} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3 leading-snug">
                {incident.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {incident.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Reporter</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{incident.reporter_name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Created</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {new Date(incident.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Updated</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {new Date(incident.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status actions */}
            {nextStatuses.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="text-xs font-medium text-slate-500 mb-3">Advance Status</p>
                <div className="flex gap-2">
                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white disabled:opacity-50 transition-all capitalize"
                    >
                      {updating ? <Spinner size="sm" /> : null}
                      Mark as {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for Phase 3 features */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Real-time updates feed and AI summary panel — coming in Phase 3 & 5
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IncidentDetailPage;