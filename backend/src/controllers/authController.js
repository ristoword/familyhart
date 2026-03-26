/**
 * Controller autenticazione
 */
import * as authService from '../services/authService.js';

export async function login(req, res, next) {
  try {
    const { email, password, inviteCode } = req.body || {};
    const result = authService.login(email, password, inviteCode);
    // eslint-disable-next-line no-console
    console.log(`[auth] login ok user=${result.user?.id || 'n/a'} email=${email || ''}`);
    res.json({ success: true, ...result });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[auth] login failed email=${req.body?.email || ''} reason=${err.message}`);
    next(err);
  }
}

export async function activateBeta(req, res, next) {
  try {
    const { email, password, inviteCode } = req.body || {};
    const result = authService.activateBeta(email, password, inviteCode);
    // eslint-disable-next-line no-console
    console.log(`[auth] activate-beta ok user=${result.user?.id || 'n/a'} email=${email || ''}`);
    res.json({ success: true, ...result });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[auth] activate-beta failed email=${req.body?.email || ''} reason=${err.message}`);
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ success: true });
}

export async function me(req, res, next) {
  try {
    const result = authService.getMe(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
