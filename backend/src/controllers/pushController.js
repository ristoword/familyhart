/**
 * Push controller
 */
import { ValidationError } from '../utils/errors.js';
import * as pushService from '../services/pushService.js';

export async function getPublicKey(req, res) {
  res.json({ success: true, publicKey: pushService.getPublicKey() });
}

export async function subscribe(req, res, next) {
  try {
    const { subscription } = req.body || {};
    const ok = pushService.subscribe(
      req.user.familyId,
      req.user.id,
      subscription,
      req.headers['user-agent'] || ''
    );
    if (!ok) throw new ValidationError('Subscription non valida');
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function unsubscribe(req, res, next) {
  try {
    const { endpoint } = req.body || {};
    const ok = pushService.unsubscribe(req.user.familyId, endpoint);
    if (!ok) throw new ValidationError('Endpoint richiesto');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function testPush(req, res, next) {
  try {
    const payload = {
      title: 'Test push Family Hart',
      body: 'Notifica push attiva correttamente',
      type: 'test',
      ts: Date.now(),
    };
    const result = await pushService.sendToFamily(req.user.familyId, payload);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

