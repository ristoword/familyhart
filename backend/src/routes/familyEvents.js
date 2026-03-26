/**
 * Route eventi famiglia
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/familyEventController.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getEvents);
router.post('/', ctrl.createEvent);
router.patch('/:id', ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

export default router;
