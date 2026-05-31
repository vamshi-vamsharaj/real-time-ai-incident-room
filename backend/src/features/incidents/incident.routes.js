import { Router } from 'express';
import {
  getIncidents,
  getIncident,
  createIncident,
  patchIncidentStatus,
} from './incident.controller.js';

const router = Router();

router.get('/', getIncidents);
router.post('/', createIncident);
router.get('/:id', getIncident);
router.patch('/:id/status', patchIncidentStatus);

export default router;