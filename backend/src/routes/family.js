/**
 * Route famiglia
 */
import { Router } from 'express';
import * as familyController from '../controllers/familyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/members', familyController.getMembers);
router.post('/members', familyController.addMember);
router.patch('/members/:id', familyController.updateMember);
router.delete('/members/:id', familyController.deleteMember);

export default router;
