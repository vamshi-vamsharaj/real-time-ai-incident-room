import Incident from './incident.model.js';

// Valid forward transitions only — no going backwards
const TRANSITIONS = {
  open: ['investigating'],
  investigating: ['resolved'],
  resolved: [],
};

export const getAllIncidents = async () => {
  return await Incident.find().sort({ updated_at: -1 }).lean();
};

export const getIncidentById = async (id) => {
  const incident = await Incident.findById(id).lean();
  if (!incident) return null;
  return incident;
};

export const createIncident = async ({ title, description, priority, reporter_name }) => {
  const incident = new Incident({ title, description, priority, reporter_name });
  await incident.save();
  return incident.toObject();
};

/**
 * Validates the transition is legal before persisting.
 * Returns { error } if invalid, { incident } if success.
 */
export const updateIncidentStatus = async (id, newStatus) => {
  const current = await Incident.findById(id).lean();
  if (!current) return { error: 'not_found' };

  const allowed = TRANSITIONS[current.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      error: 'invalid_transition',
      from: current.status,
      to: newStatus,
      allowed,
    };
  }

  const updated = await Incident.findByIdAndUpdate(
    id,
    { status: newStatus },
    { new: true, runValidators: true }
  ).lean();

  return { incident: updated, previousStatus: current.status };
};