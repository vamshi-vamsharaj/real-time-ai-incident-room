const EmptyState = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6">
    <div className="w-16 h-16 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-slate-400">
        <path
          d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 10h-4v-6h4v6z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M13 9h2v2h-2V9zm0 4h2v6h-2v-6z"
          fill="currentColor"
        />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
      No incidents yet
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-8 leading-relaxed">
      Your incident board is clear. When something breaks, report it here to coordinate your team's response.
    </p>
    <button
      onClick={onCreateClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Report First Incident
    </button>
  </div>
);

export default EmptyState;