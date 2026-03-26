/**
 * Route autenticazione
 */
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const authLimiter = createRateLimit({
  windowMs: config.security.authRateWindowMs,
  max: config.security.authRateMax,
});
const activateLimiter = createRateLimit({
  windowMs: config.security.activateRateWindowMs,
  max: config.security.activateRateMax,
});

router.post('/login', authLimiter, authController.login);
router.post('/activate-beta', activateLimiter, authController.activateBeta);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
