import { Router } from 'express';
import { getUpdates, createUpdate } from './update.controller.js';

// mergeParams: true lets us read :id from the parent incidents router
const router = Router({ mergeParams: true });

router.get('/', getUpdates);
router.post('/', createUpdate);

export default router;