import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Triggers AI summary generation.
 * Returns 202 immediately — result arrives via socket event.
 */
export const requestAISummary = async (incidentId) => {
  const { data } = await axios.post(`${BASE}/api/ai/summarize/${incidentId}`);
  return data;
};

/**
 * Fetches all AI results for an incident (history), newest first.
 * Called on mount so users see past generations without re-generating.
 */
export const fetchAIResults = async (incidentId) => {
  const { data } = await axios.get(`${BASE}/api/ai/results/${incidentId}`);
  return data.data;
};