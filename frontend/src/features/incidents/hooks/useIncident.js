import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchIncidentById, patchStatus, deleteIncident as deleteIncidentApi } from '../services/incidentService';

/**
 * useIncident(id)
 *
 * Powers the Incident Detail Page.
 *
 * - Fetches the incident via REST on mount.
 * - Listens for `incident:status_changed` — updates badge instantly cross-tab.
 * - Exposes `changeStatus(newStatus)` — optimistic PATCH + socket dedup.
 * - Exposes `deleteIncident()` — calls DELETE and returns { success }.     ← NEW
 */
const useIncident = (id) => {
  const socket = useSocket();

  const [incident,       setIncident]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusError,    setStatusError]    = useState(null);
  const [deleting,       setDeleting]       = useState(false); // ← NEW
  const [deleteError,    setDeleteError]    = useState(null);  // ← NEW

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidentById(id);
      setIncident(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Real-time: status changed in any tab ──────────────────────────────────
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusChanged = ({ incidentId, status }) => {
      if (incidentId !== id) return;
      setIncident((prev) => (prev ? { ...prev, status } : prev));
    };

    socket.on('incident:status_changed', handleStatusChanged);
    return () => socket.off('incident:status_changed', handleStatusChanged);
  }, [socket, id]);

  // ── Action: change status ─────────────────────────────────────────────────
  const changeStatus = useCallback(
    async (newStatus) => {
      setStatusChanging(true);
      setStatusError(null);
      try {
        const updated = await patchStatus(id, newStatus);
        setIncident(updated);
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update status';
        setStatusError(msg);
        return { success: false, message: msg };
      } finally {
        setStatusChanging(false);
      }
    },
    [id]
  );

  // ── Action: delete incident  ← NEW ────────────────────────────────────────
  const removeIncident = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteIncidentApi(id);
      // Socket broadcast (incident:deleted) will notify other tabs.
      // The calling component handles navigation after success.
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete incident';
      setDeleteError(msg);
      return { success: false, message: msg };
    } finally {
      setDeleting(false);
    }
  }, [id]);

  return {
    incident,
    loading,
    error,
    statusChanging,
    statusError,
    changeStatus,
    deleting,       // ← NEW
    deleteError,    // ← NEW
    removeIncident, // ← NEW
    reload: load,
  };
};

export default useIncident;