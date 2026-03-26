/**
 * Route chiamate - storico
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as callLogRepo from '../repositories/callLogRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const callWriteLimiter = createRateLimit({ windowMs: 60_000, max: 60 });

router.use(requireAuth);

router.get('/', (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = callLogRepo.getByFamilyId(req.user.familyId, limit);
    res.json({ success: true, calls: logs });
  } catch (err) {
    next(err);
  }
});

router.post('/log', callWriteLimiter, (req, res, next) => {
  try {
    const { calleeIds, callType, outcome, durationSeconds } = req.body || {};
    const members = familyRepo.getMembersByFamilyId(req.user.familyId);
    const selfMember = members.find((m) => m.userId === req.user.id) || members.find((m) => m.id === req.user.id);
    const callerId = selfMember?.id || req.user.id;
    callLogRepo.insert({
      familyId: req.user.familyId,
      callerId,
      calleeIds: Array.isArray(calleeIds) ? calleeIds : [calleeIds].filter(Boolean),
      callType: callType || 'audio',
      outcome: outcome || 'completed',
      durationSeconds: durationSeconds || 0,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
