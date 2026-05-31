import { useState, useEffect, useCallback } from 'react';
import { fetchIncidents } from '../services/incidentService';

export const useIncidents = () => {
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

  const addIncident = (incident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  return { incidents, loading, error, reload: load, addIncident };
};