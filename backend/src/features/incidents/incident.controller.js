import * as incidentService from './incident.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';

export const getIncidents = asyncHandler(async (req, res) => {
  const incidents = await incidentService.getAllIncidents();
  const serialized = incidents.map((i) => ({ ...i, _id: i._id.toString() }));
  res.json({ success: true, data: serialized });
});

export const getIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, data: { ...incident, _id: incident._id.toString() } });
});

export const createIncident = asyncHandler(async (req, res) => {
  const { title, description, priority, reporter_name } = req.body;

  if (!title || !description || !priority || !reporter_name) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const incident = await incidentService.createIncident({ title, description, priority, reporter_name });
  const serialized = { ...incident, _id: incident._id.toString() };

  // Emit socket event to all clients
  const io = req.app.get('io');
  if (io) {
    io.emit('incident:created', serialized);
  }

  res.status(201).json({ success: true, data: serialized });
});

export const patchIncidentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'investigating', 'resolved'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const incident = await incidentService.updateIncidentStatus(req.params.id, status);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  const serialized = { ...incident, _id: incident._id.toString() };

  const io = req.app.get('io');
  if (io) {
    io.emit('incident:status_changed', { incidentId: serialized._id, status });
  }

  res.json({ success: true, data: serialized });
});