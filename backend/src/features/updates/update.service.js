import Update from './update.model.js';
import Incident from '../incidents/incident.model.js';

/**
 * Return all updates for an incident, oldest first (timeline order).
 */
export const getUpdatesByIncidentId = async (incidentId) => {
  return await Update.find({ incident_id: incidentId })
    .sort({ created_at: 1 })
    .lean();
};

/**
 * Create a new update and denormalize the message onto the parent incident.
 * Returns the saved update object.
 */
export const createUpdate = async ({ incident_id, message, author_name }) => {
  // Verify incident exists before inserting
  const incident = await Incident.findById(incident_id).lean();
  if (!incident) {
    const err = new Error('Incident not found');
    err.status = 404;
    throw err;
  }

  const update = new Update({ incident_id, message, author_name });
  await update.save();

  // Denormalize latest_update onto the incident document so the dashboard
  // can show last activity without a join query.
  await Incident.findByIdAndUpdate(incident_id, {
    latest_update: message,
    updated_at: new Date(),
  });

  return update.toObject();
};