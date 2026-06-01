import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchIncidents } from '../services/incidentService';

/**
 * useIncidents()
 *
 * Powers the dashboard. Subscribes to two global socket events:
 *
 *  incident:created       → prepend new card, bump stats
 *  incident:status_changed → patch the matching card's status in-place
 *
 * No room join is needed — both events are broadcast to all connected clients.
 */
export const useIncidents = () => {
  const socket = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    load();
  }, [load]);

  // ── Real-time subscriptions ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (incident) => {
      setIncidents((prev) => {
        // Guard against duplicates (the creating tab gets it via POST response AND socket)
        if (prev.some((i) => i._id === incident._id)) return prev;
        return [incident, ...prev];
      });
    };

    const handleStatusChanged = ({ incidentId, status }) => {
      setIncidents((prev) =>
        prev.map((i) =>
          i._id === incidentId ? { ...i, status } : i
        )
      );
    };

    socket.on('incident:created', handleCreated);
    socket.on('incident:status_changed', handleStatusChanged);

    return () => {
      socket.off('incident:created', handleCreated);
      socket.off('incident:status_changed', handleStatusChanged);
    };
  }, [socket]);

  // Called by the creating tab's form handler (optimistic add).
  // The socket echo will be deduplicated by handleCreated.
  const addIncident = useCallback((incident) => {
    setIncidents((prev) => {
      if (prev.some((i) => i._id === incident._id)) return prev;
      return [incident, ...prev];
    });
  }, []);

  return { incidents, loading, error, reload: load, addIncident };
};