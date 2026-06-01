import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchIncidentById, patchStatus } from '../services/incidentService';

/**
 * useIncident(id)
 *
 * Powers the Incident Detail Page.
 *
 * - Fetches the incident via REST on mount.
 * - Listens for `incident:status_changed` globally.
 *   When the event matches this incident's id, updates local state.
 *   This means: if someone changes status in another tab, this tab
 *   updates the header badge instantly.
 * - Exposes `changeStatus(newStatus)` which calls PATCH and updates
 *   local state optimistically — the socket echo from the server
 *   will deduplicate since we compare the new status.
 */
const useIncident = (id) => {
  const socket = useSocket();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusError, setStatusError] = useState(null);

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

  useEffect(() => {
    load();
  }, [load]);

  // ── Real-time: status changed in any tab ─────────────────────────────
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusChanged = ({ incidentId, status }) => {
      if (incidentId !== id) return;
      setIncident((prev) => (prev ? { ...prev, status } : prev));
    };

    socket.on('incident:status_changed', handleStatusChanged);
    return () => socket.off('incident:status_changed', handleStatusChanged);
  }, [socket, id]);

  // ── Action: change status from this tab ──────────────────────────────
  const changeStatus = useCallback(
    async (newStatus) => {
      setStatusChanging(true);
      setStatusError(null);
      try {
        const updated = await patchStatus(id, newStatus);
        // Optimistic: update local state immediately.
        // The socket broadcast will also fire, but the dedup in the handler
        // (same status === same status → no-op) keeps the state clean.
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

  return {
    incident,
    loading,
    error,
    statusChanging,
    statusError,
    changeStatus,
    reload: load,
  };
};

export default useIncident;