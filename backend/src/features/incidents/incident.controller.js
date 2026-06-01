import * as incidentService from './incident.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const serialize = (incident) => ({
  ...incident,
  _id: incident._id.toString(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const getIncidents = asyncHandler(async (req, res) => {
  const incidents = await incidentService.getAllIncidents();
  res.json({ success: true, data: incidents.map(serialize) });
});

export const getIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, data: serialize(incident) });
});

export const createIncident = asyncHandler(async (req, res) => {
  const { title, description, priority, reporter_name } = req.body;

  if (!title || !description || !priority || !reporter_name) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const incident  = await incidentService.createIncident({ title, description, priority, reporter_name });
  const serialized = serialize(incident);

  const io = req.app.get('io');
  if (io) io.emit('incident:created', serialized);

  res.status(201).json({ success: true, data: serialized });
});

export const patchIncidentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'investigating', 'resolved'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const result = await incidentService.updateIncidentStatus(req.params.id, status);

  if (result.error === 'not_found') {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  if (result.error === 'invalid_transition') {
    const msg =
      result.allowed.length === 0
        ? `Incident is already resolved and cannot be changed`
        : `Cannot transition from "${result.from}" to "${result.to}". Allowed: ${result.allowed.join(', ')}`;
    return res.status(400).json({ success: false, message: msg });
  }

  const serialized = serialize(result.incident);

  const io = req.app.get('io');
  if (io) {
    io.emit('incident:status_changed', {
      incidentId:     serialized._id,
      status:         serialized.status,
      previousStatus: result.previousStatus,
      incident:       serialized,
    });
  }

  res.json({ success: true, data: serialized });
});

/**
 * DELETE /api/incidents/:id
 *
 * Hard-deletes the incident plus all child records:
 *   • incident_updates  (Update model — import dynamically to avoid circular deps)
 *   • ai_results        (AiResult model)
 *
 * Emits  incident:deleted  so every connected tab removes the card immediately.
 */
export const deleteIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const incident = await incidentService.deleteIncidentById(id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  // ── Cascade: delete child records ─────────────────────────────────────────
  // Dynamic imports prevent circular-dependency warnings and keep this file clean.
  try {
    const { default: Update }   = await import('../updates/update.model.js');
    const { default: AiResult } = await import('../ai/aiResult.model.js');

    await Promise.all([
      Update.deleteMany({ incident_id: id }),
      AiResult.deleteMany({ incident_id: id }),
    ]);
  } catch (cascadeErr) {
    // Log but do not fail the request — the incident is already deleted.
    console.error('Cascade delete partial failure:', cascadeErr.message);
  }

  // ── Real-time broadcast ───────────────────────────────────────────────────
  const io = req.app.get('io');
  if (io) {
    io.emit('incident:deleted', { incidentId: id });
  }

  res.json({ success: true, message: 'Incident deleted', data: { incidentId: id } });
});