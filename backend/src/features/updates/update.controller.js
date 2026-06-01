import * as updateService from './update.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';

/**
 * GET /api/incidents/:id/updates
 * Returns all updates for the given incident in timeline order.
 */
export const getUpdates = asyncHandler(async (req, res) => {
  const updates = await updateService.getUpdatesByIncidentId(req.params.id);

  const serialized = updates.map((u) => ({
    ...u,
    _id: u._id.toString(),
    incident_id: u.incident_id.toString(),
  }));

  res.json({ success: true, data: serialized });
});

/**
 * POST /api/incidents/:id/updates
 * Creates a new update, then emits `incident:update` to the incident room.
 *
 * Side-effect: socket emit so all clients in room incident:{id} receive
 * the update instantly without polling.
 */
export const createUpdate = asyncHandler(async (req, res) => {
  const { message, author_name } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }
  if (!author_name || author_name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Author name must be at least 2 characters' });
  }

  const update = await updateService.createUpdate({
    incident_id: req.params.id,
    message: message.trim(),
    author_name: author_name.trim(),
  });

  const serialized = {
    ...update,
    _id: update._id.toString(),
    incident_id: update.incident_id.toString(),
  };

  // Emit to all clients currently in this incident's room
  const io = req.app.get('io');
  if (io) {
    io.to(`incident:${req.params.id}`).emit('incident:update', serialized);
  }

  res.status(201).json({ success: true, data: serialized });
});