import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { fetchAIResults, requestAISummary } from '../services/aiService';

/**
 * useAI(incidentId)
 *
 * Mirrors useUpdates exactly:
 *  1. Load existing results via REST on mount (history).
 *  2. Socket is already in the incident room — useUpdates handles join/leave.
 *     We just attach listeners here; no duplicate join needed.
 *  3. Listen for incident:ai_summary_generated → prepend to results list.
 *  4. Listen for incident:ai_error → surface error, exit spinner.
 *  5. Clean up listeners on unmount.
 *
 * isGenerating: true from the moment POST fires until socket delivers result
 * (or error). This drives the loading skeleton.
 */
const useAI = (incidentId) => {
  const socket = useSocket();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // ── Initial REST load (history) ──────────────────────────────────────
  const load = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAIResults(incidentId);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI results');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Socket: receive AI result ────────────────────────────────────────
  // NOTE: No join:incident here — useUpdates already emits it.
  // Attaching a second listener to the same event on the same socket
  // is fine as long as we clean up, which we do.
  useEffect(() => {
    if (!socket || !incidentId) return;

    const handleResult = ({ incidentId: eventId, aiResult }) => {
      if (eventId !== incidentId) return;
      setResults((prev) => {
        // Guard against duplicate (shouldn't happen but defensive)
        if (prev.some((r) => r._id === aiResult._id)) return prev;
        return [aiResult, ...prev];
      });
      setIsGenerating(false);
      setGenerateError(null);
    };

    const handleError = ({ incidentId: eventId, message }) => {
      if (eventId !== incidentId) return;
      setIsGenerating(false);
      setGenerateError(message || 'AI analysis failed. Please try again.');
    };

    socket.on('incident:ai_summary_generated', handleResult);
    socket.on('incident:ai_error', handleError);

    return () => {
      socket.off('incident:ai_summary_generated', handleResult);
      socket.off('incident:ai_error', handleError);
    };
  }, [socket, incidentId]);

  // ── Action: trigger generation ───────────────────────────────────────
  const generate = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await requestAISummary(incidentId);
      // 202 received — spinner stays on until socket delivers result
    } catch (err) {
      setIsGenerating(false);
      setGenerateError(
        err.response?.data?.message || 'Failed to start AI analysis. Please try again.'
      );
    }
  }, [incidentId, isGenerating]);

  return {
    results,        // all AI results, newest first
    loading,        // initial history load
    error,          // history load error
    isGenerating,   // true while waiting for socket delivery
    generateError,  // error from POST or socket:ai_error
    generate,       // call to trigger generation
  };
};

export default useAI;