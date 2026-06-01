import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

export const fetchIncidents = async () => {
  const { data } = await api.get('/incidents');
  return data.data;
};

export const fetchIncidentById = async (id) => {
  const { data } = await api.get(`/incidents/${id}`);
  return data.data;
};

export const createIncident = async (payload) => {
  const { data } = await api.post('/incidents', payload);
  return data.data;
};

export const patchStatus = async (id, status) => {
  const { data } = await api.patch(`/incidents/${id}/status`, { status });
  return data.data;
};

// ── NEW ───────────────────────────────────────────────────────────────────────
export const deleteIncident = async (id) => {
  const { data } = await api.delete(`/incidents/${id}`);
  return data;
};