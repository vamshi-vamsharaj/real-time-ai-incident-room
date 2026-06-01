import { Router } from 'express';
import { requestSummary, getResults } from './ai.controller.js';

const router = Router();

// POST /api/ai/summarize/:incidentId  — trigger AI generation (202 async)
router.post('/summarize/:incidentId', requestSummary);

// GET  /api/ai/results/:incidentId    — fetch history (newest first)
router.get('/results/:incidentId', getResults);

export default router;