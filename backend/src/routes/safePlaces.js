/**
 * Route luoghi sicuri
 */
import { Router } from 'express';
import * as safePlaceController from '../controllers/safePlaceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', safePlaceController.getPlaces);
router.post('/', safePlaceController.addPlace);
router.patch('/:id', safePlaceController.updatePlace);
router.delete('/:id', safePlaceController.deletePlace);

export default router;
