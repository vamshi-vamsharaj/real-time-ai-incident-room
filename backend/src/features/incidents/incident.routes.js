import { Router } from 'express';
import {
  getIncidents,
  getIncident,
  createIncident,
  patchIncidentStatus,
  deleteIncident,          // ← NEW
} from './incident.controller.js';

const router = Router();

router.get('/',             getIncidents);
router.post('/',            createIncident);
router.get('/:id',          getIncident);
router.patch('/:id/status', patchIncidentStatus);
router.delete('/:id',       deleteIncident);  

export default router;