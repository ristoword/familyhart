/**
 * Route locations/geofence events
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as locationController from '../controllers/locationController.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const locationWriteLimiter = createRateLimit({ windowMs: 60_000, max: 240 });

router.use(requireAuth);

router.get('/locations', locationController.getLocations);
router.get('/locations/:memberId/latest', locationController.getLatestMemberLocation);
router.post('/locations', locationWriteLimiter, locationController.createLocation);

router.get('/geofence-events', locationController.getGeofenceEvents);
router.post('/geofence-events', locationWriteLimiter, locationController.createGeofenceEvent);

export default router;
