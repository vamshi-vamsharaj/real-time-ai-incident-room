import { useEffect, useRef } from 'react';
import UpdateItem from './UpdateItem';
import Spinner from '../../../shared/components/Spinner';

const UpdateFeed = ({ updates, loading, error, newestId }) => {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever updates change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [updates.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500 flex-shrink-0">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-slate-400">
            <path d="M4 4h14a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No updates yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-[220px] leading-relaxed">
          Post the first update to start the incident timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pr-1">
      {updates.map((update) => (
        <UpdateItem
          key={update._id}
          update={update}
          isNew={update._id === newestId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default UpdateFeed;