/**
 * Push routes
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as pushController from '../controllers/pushController.js';

const router = Router();

router.get('/public-key', pushController.getPublicKey);
router.post('/subscribe', requireAuth, pushController.subscribe);
router.post('/unsubscribe', requireAuth, pushController.unsubscribe);
router.post('/test', requireAuth, pushController.testPush);

export default router;

