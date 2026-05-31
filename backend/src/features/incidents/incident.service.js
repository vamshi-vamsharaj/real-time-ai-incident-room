import Incident from './incident.model.js';

export const getAllIncidents = async () => {
  return await Incident.find()
    .sort({ updated_at: -1 })
    .lean();
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

export const updateIncidentStatus = async (id, status) => {
  const incident = await Incident.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).lean();
  return incident;
};