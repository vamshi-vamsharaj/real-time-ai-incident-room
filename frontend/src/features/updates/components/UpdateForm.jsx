import { useState } from 'react';
import { postUpdate } from '../services/updateService';

const UpdateForm = ({ incidentId, onPosted }) => {
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    // Persist author name in sessionStorage so it doesn't reset between updates
    return sessionStorage.getItem('incident_author') || '';
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!message.trim()) e.message = 'Update message is required';
    if (!authorName.trim() || authorName.trim().length < 2) {
      e.authorName = 'Name must be at least 2 characters';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setSubmitting(true);
    try {
      const update = await postUpdate(incidentId, {
        message: message.trim(),
        author_name: authorName.trim(),
      });

      // Persist name so the user doesn't retype it
      sessionStorage.setItem('incident_author', authorName.trim());

      // Notify parent (optimistic add)
      onPosted(update);

      // Clear only the message field; keep the author name
      setMessage('');
      setErrors({});
    } catch (err) {
      setErrors({
        _global: err.response?.data?.message || 'Failed to post update',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter submits the form
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errors._global && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {errors._global}
        </div>
      )}

      {/* Author name — compact single row */}
      <div>
        <input
          value={authorName}
          onChange={(e) => {
            setAuthorName(e.target.value);
            if (errors.authorName) setErrors((p) => ({ ...p, authorName: undefined }));
          }}
          placeholder="Your name"
          className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
            errors.authorName
              ? 'border-red-300 dark:border-red-700'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {errors.authorName && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.authorName}</p>
        )}
      </div>

      {/* Message textarea */}
      <div>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
          }}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Post an update — what's the current status, what just happened, what's being done…"
          className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none ${
            errors.message
              ? 'border-red-300 dark:border-red-700'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>
        )}
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          ⌘ + Enter to submit
        </p>
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 6.5h10M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Post Update
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateForm;