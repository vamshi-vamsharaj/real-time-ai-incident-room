import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

export const fetchUpdates = async (incidentId) => {
  const { data } = await api.get(`/incidents/${incidentId}/updates`);
  return data.data;
};

export const postUpdate = async (incidentId, { message, author_name }) => {
  const { data } = await api.post(`/incidents/${incidentId}/updates`, {
    message,
    author_name,
  });
  return data.data;
};