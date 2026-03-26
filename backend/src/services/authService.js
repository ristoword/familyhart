/**
 * Servizio autenticazione
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as userRepo from '../repositories/userRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import * as betaInviteRepo from '../repositories/betaInviteRepository.js';
import { UnauthorizedError, ValidationError, ForbiddenError } from '../utils/errors.js';

const ROLE_PERMISSIONS = {
  admin: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat', 'edit_safe_places', 'invite_members', 'manage_family_settings', 'manage_members'],
  partner: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat', 'edit_safe_places', 'invite_members'],
  child: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat'],
  guest: ['receive_sos', 'send_sos', 'use_family_chat'],
};

function getPermissions(roleType) {
  return ROLE_PERMISSIONS[roleType] || [];
}

function isEmailAllowlisted(email) {
  const e = (email || '').trim().toLowerCase();
  return config.beta.emailAllowlist.includes(e);
}

function isBetaAllowed(user) {
  const st = user.beta_access_status || 'beta_tester';
  if (st === 'beta_admin' || st === 'beta_tester') return true;
  if (st === 'standard_non_abilitato') {
    if (isEmailAllowlisted(user.email)) {
      userRepo.updateBetaStatus(user.id, 'beta_tester');
      return true;
    }
    return false;
  }
  return true;
}

function redeemInviteForUser(user, code) {
  const inv = betaInviteRepo.findValidByCode(code);
  if (!inv) throw new ValidationError('Codice invito non valido o scaduto');
  const invEmail = (inv.email || '').trim().toLowerCase();
  if (invEmail && invEmail !== user.email.trim().toLowerCase()) {
    throw new ValidationError('Questo invito è associato a un altro indirizzo email');
  }
  betaInviteRepo.markUsed(inv.id, user.id);
  userRepo.updateBetaStatus(user.id, 'beta_tester');
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      familyId: user.family_id,
      betaAccessStatus: user.beta_access_status || 'beta_tester',
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
}

function userToResponse(user) {
  const members = familyRepo.getMembersByFamilyId(user.family_id);
  const member = members.find((m) => m.userId === user.id) || members.find((m) => m.id === user.id);
  return {
    id: user.id,
    memberId: member?.id || user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: roleLabel(user.role_type),
    roleType: user.role_type,
    familyId: user.family_id,
    permissions: getPermissions(user.role_type),
    betaAccessStatus: user.beta_access_status || 'beta_tester',
  };
}

function roleLabel(rt) {
  const labels = { admin: 'Amministratore famiglia', partner: 'Partner', child: 'Membro', guest: 'Ospite' };
  return labels[rt] || 'Membro';
}

export function login(email, password, inviteCode) {
  if (!email || !password) {
    throw new ValidationError('Email e password richieste');
  }
  let user = userRepo.findByEmail(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new UnauthorizedError('Email o password non corretti');
  }
  if (inviteCode?.trim()) {
    redeemInviteForUser(user, inviteCode.trim());
    user = userRepo.findById(user.id);
  }
  if (config.beta.required && !isBetaAllowed(user)) {
    throw new ForbiddenError(
      'Accesso riservato alla beta privata. Usa un codice invito valido.',
      'BETA_ACCESS_DENIED',
    );
  }
  return { user: userToResponse(user), token: signToken(user) };
}

export function activateBeta(email, password, inviteCode) {
  if (!inviteCode?.trim()) {
    throw new ValidationError('Codice invito richiesto');
  }
  const user = userRepo.findByEmail(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new UnauthorizedError('Email o password non corretti');
  }
  redeemInviteForUser(user, inviteCode.trim());
  const fresh = userRepo.findById(user.id);
  if (config.beta.required && !isBetaAllowed(fresh)) {
    throw new ForbiddenError('Accesso beta non ancora attivo', 'BETA_ACCESS_DENIED');
  }
  return { user: userToResponse(fresh), token: signToken(fresh) };
}

export function getMe(userId) {
  const user = userRepo.findById(userId);
  if (!user) throw new UnauthorizedError('Utente non trovato');
  return { user: userToResponse(user) };
}
