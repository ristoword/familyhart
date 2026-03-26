import { Router } from 'express';
import * as betaController from '../controllers/betaController.js';
import { requireAuth, requireBetaAccess, requireBetaAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireBetaAccess, requireBetaAdmin);

router.get('/invites', betaController.listInvites);
router.post('/invites', betaController.createInvite);
router.get('/users', betaController.listUsers);
router.post('/users', betaController.createUser);
router.patch('/users/:id', betaController.updateUserAccess);

export default router;
