import Incident from './incident.model.js';

// ─── Valid forward-only transitions ───────────────────────────────────────────
const TRANSITIONS = {
  open:          ['investigating'],
  investigating: ['resolved'],
  resolved:      [],
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getAllIncidents = async () =>
  Incident.find().sort({ updated_at: -1 }).lean();

export const getIncidentById = async (id) =>
  Incident.findById(id).lean();

export const createIncident = async ({ title, description, priority, reporter_name }) => {
  const incident = new Incident({ title, description, priority, reporter_name });
  await incident.save();
  return incident.toObject();
};

/**
 * Validates the transition is legal before persisting.
 * Returns { error } on failure, { incident, previousStatus } on success.
 */
export const updateIncidentStatus = async (id, newStatus) => {
  const current = await Incident.findById(id).lean();
  if (!current) return { error: 'not_found' };

  const allowed = TRANSITIONS[current.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      error:   'invalid_transition',
      from:    current.status,
      to:      newStatus,
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

/**
 * Hard-delete an incident.
 * The controller is responsible for cascading deletes of updates + ai_results,
 * and for emitting the socket event.
 */
export const deleteIncidentById = async (id) => {
  const incident = await Incident.findByIdAndDelete(id).lean();
  return incident ?? null;   // null means not found
};