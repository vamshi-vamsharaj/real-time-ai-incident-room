import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchUpdates } from '../services/updateService';

/**
 * useUpdates(incidentId)
 *
 * Responsibilities:
 * 1. Load existing updates via REST on mount.
 * 2. Emit join:incident so the server adds this socket to the room.
 * 3. Listen for incident:update events and prepend them to local state.
 * 4. On unmount, emit leave:incident and remove the listener.
 *
 * The join/leave pattern means only clients on this incident's detail
 * page receive updates — the dashboard is never flooded.
 */
const useUpdates = (incidentId) => {
  const socket = useSocket();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial REST load
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUpdates(incidentId);
      setUpdates(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load updates');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
  if (!incidentId || !socket) return;

  load();

  socket.emit('join:incident', { incidentId });

  const handleNewUpdate = (update) => {
    setUpdates((prev) => {
      const alreadyExists = prev.some((u) => u._id === update._id);
      if (alreadyExists) return prev;
      return [...prev, update];
    });
  };

  socket.on('incident:update', handleNewUpdate);

  return () => {
    socket.emit('leave:incident', { incidentId });
    socket.off('incident:update', handleNewUpdate);
  };
}, [incidentId, socket, load]);

  /**
   * addUpdate is called by UpdateForm after a successful POST.
   * We add optimistically here so the posting client sees the update
   * instantly, without waiting for the socket echo.
   * The duplicate guard in handleNewUpdate prevents double-rendering.
   */
  const addUpdate = useCallback((update) => {
    setUpdates((prev) => {
      const alreadyExists = prev.some((u) => u._id === update._id);
      if (alreadyExists) return prev;
      return [...prev, update];
    });
  }, []);

  return { updates, loading, error, addUpdate };
};

export default useUpdates;