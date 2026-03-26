/**
 * Aggregazione route API
 */
import { Router } from 'express';
import authRoutes from './auth.js';
import familyRoutes from './family.js';
import safePlacesRoutes from './safePlaces.js';
import chatRoutes from './chat.js';
import notificationRoutes from './notifications.js';
import locationRoutes from './locations.js';
import appointmentRoutes from './appointments.js';
import familyEventRoutes from './familyEvents.js';
import callRoutes from './calls.js';
import pushRoutes from './push.js';
import betaRoutes from './beta.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/family', familyRoutes);
router.use('/safe-places', safePlacesRoutes);
router.use('/conversations', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/family-events', familyEventRoutes);
router.use('/calls', callRoutes);
router.use('/push', pushRoutes);
router.use('/beta', betaRoutes);
router.use('/', locationRoutes);

export default router;
