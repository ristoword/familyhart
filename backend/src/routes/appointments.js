/**
 * Route appuntamenti famiglia
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/appointmentController.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getAppointments);
router.post('/', ctrl.createAppointment);
router.patch('/:id', ctrl.updateAppointment);
router.delete('/:id', ctrl.deleteAppointment);

export default router;
