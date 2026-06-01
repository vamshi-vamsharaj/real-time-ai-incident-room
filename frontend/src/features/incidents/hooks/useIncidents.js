import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchIncidents } from '../services/incidentService';

/**
 * useIncidents()
 *
 * Powers the dashboard. Subscribes to three global socket events:
 *
 *  incident:created        → prepend new card, bump stats
 *  incident:status_changed → patch the matching card's status in-place
 *  incident:deleted        → remove the card, update stats instantly   ← NEW
 *
 * No room join is needed — all events are broadcast to every connected client.
 */
export const useIncidents = () => {
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Real-time subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (incident) => {
      setIncidents((prev) => {
        if (prev.some((i) => i._id === incident._id)) return prev;
        return [incident, ...prev];
      });
    };

    const handleStatusChanged = ({ incidentId, status }) => {
      setIncidents((prev) =>
        prev.map((i) => (i._id === incidentId ? { ...i, status } : i))
      );
    };

    // ── NEW ────────────────────────────────────────────────────────────────
    const handleDeleted = ({ incidentId }) => {
      setIncidents((prev) => prev.filter((i) => i._id !== incidentId));
    };

    socket.on('incident:created',        handleCreated);
    socket.on('incident:status_changed', handleStatusChanged);
    socket.on('incident:deleted',        handleDeleted);   // ← NEW

    return () => {
      socket.off('incident:created',        handleCreated);
      socket.off('incident:status_changed', handleStatusChanged);
      socket.off('incident:deleted',        handleDeleted); // ← NEW
    };
  }, [socket]);

  // Called by the creating tab's form handler (optimistic add).
  const addIncident = useCallback((incident) => {
    setIncidents((prev) => {
      if (prev.some((i) => i._id === incident._id)) return prev;
      return [incident, ...prev];
    });
  }, []);

  // Called by the deleting tab's handler (optimistic remove).  ← NEW
  const removeIncident = useCallback((incidentId) => {
    setIncidents((prev) => prev.filter((i) => i._id !== incidentId));
  }, []);

  return { incidents, loading, error, reload: load, addIncident, removeIncident };
};