import { useState } from 'react';
import { createIncident } from '../services/incidentService';

const INITIAL = { title: '', description: '', priority: '', reporter_name: '' };

const IncidentForm = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.priority) e.priority = 'Select a priority level';
    if (!form.reporter_name.trim() || form.reporter_name.length < 2) e.reporter_name = 'Name must be at least 2 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);

    setSubmitting(true);
    try {
      const incident = await createIncident(form);
      onCreated(incident);
      onClose();
    } catch (err) {
      setErrors({ _global: err.response?.data?.message || 'Failed to create incident' });
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-slate-600' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Report Incident
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">All fields are required</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errors._global && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {errors._global}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Incident Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Payment API returning 500 errors"
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                errors.title
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what's happening, affected systems, initial observations..."
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none ${
                errors.description
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Priority + Reporter row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                  errors.priority
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <option value="">Select...</option>
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.priority}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                name="reporter_name"
                value={form.reporter_name}
                onChange={handleChange}
                placeholder="Reporter name"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                  errors.reporter_name
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.reporter_name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reporter_name}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Creating…' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;