/**
 * Middleware autenticazione JWT e scope beta
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as userRepo from '../repositories/userRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Verifica token JWT e allinea req.user al database (famiglia, membro, beta)
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token mancante'));
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const user = userRepo.findById(payload.id);
    if (!user || user.family_id !== payload.familyId) {
      throw new UnauthorizedError('Utente non valido');
    }
    const members = familyRepo.getMembersByFamilyId(user.family_id);
    const member = members.find((m) => m.userId === user.id) || members.find((m) => m.id === user.id);
    req.user = {
      id: user.id,
      email: user.email,
      familyId: user.family_id,
      memberId: member?.id || user.id,
      betaAccessStatus: user.beta_access_status || 'beta_tester',
    };
    next();
  } catch {
    next(new UnauthorizedError('Token non valido o scaduto'));
  }
}

/**
 * Se BETA_ACCESS_REQUIRED=true, blocca account non abilitati (JWT allineato a DB)
 */
export function requireBetaAccess(req, res, next) {
  if (!config.beta.required) return next();
  const st = req.user.betaAccessStatus;
  if (st === 'beta_admin' || st === 'beta_tester') return next();
  const email = req.user.email.trim().toLowerCase();
  if (st === 'standard_non_abilitato' && config.beta.emailAllowlist.includes(email)) {
    userRepo.updateBetaStatus(req.user.id, 'beta_tester');
    req.user.betaAccessStatus = 'beta_tester';
    return next();
  }
  if (st === 'standard_non_abilitato') {
    return next(new ForbiddenError('Account non abilitato alla beta privata', 'BETA_ACCESS_DENIED'));
  }
  return next();
}

export function requireBetaAdmin(req, res, next) {
  if (!config.beta.required) return next();
  if (req.user.betaAccessStatus !== 'beta_admin') {
    return next(new ForbiddenError('Operazione riservata agli amministratori beta'));
  }
  next();
}
