/**
 * Route chat
 */
import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const chatWriteLimiter = createRateLimit({ windowMs: 60_000, max: 90 });

router.use(requireAuth);

router.get('/', chatController.getConversations);
router.get('/:id/messages', chatController.getMessages);
router.post('/:id/messages', chatWriteLimiter, chatController.sendMessage);

export default router;
