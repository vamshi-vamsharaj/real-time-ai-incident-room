import asyncHandler from '../../shared/utils/asyncHandler.js';
import * as aiService from './ai.service.js';

/**
 * Serializes an AiResult document to a plain JSON-safe object.
 * Mirrors the serialize pattern in incident.controller.js.
 */
const serialize = (doc) => ({
  ...doc,
  _id: doc._id.toString(),
  incident_id: doc.incident_id.toString(),
});

// ── POST /api/ai/summarize/:incidentId ────────────────────────────────────
/**
 * Immediately returns 202 Accepted.
 * Kicks off AI generation asynchronously — result arrives via socket.
 *
 * WHY 202?
 * Gemini can take 2-8 seconds. Holding the HTTP connection open that long
 * risks timeouts, confuses loading states, and blocks the event loop.
 * The 202 pattern (fire-and-socket) is the correct async design here.
 */
export const requestSummary = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const io = req.app.get('io');

  // Respond immediately — do not await AI generation
  res.status(202).json({
    success: true,
    message: 'AI analysis started. Result will arrive via socket.',
  });

  // Run async — errors are caught internally so they never crash the server
  aiService
    .generateAndSave(incidentId)
    .then((saved) => {
      if (io) {
        io.to(`incident:${incidentId}`).emit('incident:ai_summary_generated', {
          incidentId,
          aiResult: serialize(saved),
        });
      }
      console.log(`[AI] Summary generated for incident ${incidentId} (${saved.provider})`);
    })
    .catch((err) => {
      console.error(`[AI] Generation failed for incident ${incidentId}:`, err.message);
      // Notify the room so the UI can exit spinner state with an error message
      if (io) {
        io.to(`incident:${incidentId}`).emit('incident:ai_error', {
          incidentId,
          message: 'AI analysis failed. Please try again.',
        });
      }
    });
});

// ── GET /api/ai/results/:incidentId ──────────────────────────────────────
/**
 * Returns all AI results for the incident, newest first.
 * Called on detail page mount so users see history immediately.
 */
export const getResults = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const results = await aiService.getResultsByIncidentId(incidentId);
  res.json({ success: true, data: results.map(serialize) });
});