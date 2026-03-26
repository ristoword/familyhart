/**
 * Inviti beta (solo beta_admin)
 */
import bcrypt from 'bcryptjs';
import * as betaInviteRepo from '../repositories/betaInviteRepository.js';
import * as userRepo from '../repositories/userRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import { ValidationError } from '../utils/errors.js';

export async function listInvites(req, res, next) {
  try {
    const rows = betaInviteRepo.listRecent(200);
    const invites = rows.map((r) => ({
      id: r.id,
      email: r.email || '',
      status: r.status,
      expiresAt: r.expiresAt ? new Date(r.expiresAt * 1000).toISOString() : null,
      usedByUserId: r.usedByUserId || null,
      createdAt: r.createdAt ? new Date(r.createdAt * 1000).toISOString() : null,
      codeHint: r.status === 'pending' && r.code ? `…${String(r.code).slice(-4)}` : null,
    }));
    res.json({ success: true, invites });
  } catch (err) {
    next(err);
  }
}

export async function createInvite(req, res, next) {
  try {
    const expiresInDays = Math.min(Math.max(parseInt(req.body?.expiresInDays, 10) || 14, 1), 90);
    const email = (req.body?.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Email non valida');
    }
    const expiresAtSec = Math.floor(Date.now() / 1000) + expiresInDays * 86400;
    const inv = betaInviteRepo.createInvite({
      email,
      expiresAtSec,
      createdByUserId: req.user.id,
    });
    res.status(201).json({
      success: true,
      invite: {
        id: inv.id,
        code: inv.code,
        email: inv.email,
        expiresAt: new Date(expiresAtSec * 1000).toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = userRepo.listByFamilyId(req.user.familyId).map((u) => ({
      ...u,
      createdAt: u.createdAt ? new Date(u.createdAt * 1000).toISOString() : null,
    }));
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = (req.body?.password || '').trim();
    const name = (req.body?.name || '').trim();
    const roleType = req.body?.roleType || 'child';
    const betaAccessStatus = req.body?.active === false ? 'standard_non_abilitato' : 'beta_tester';
    if (!email || !password || !name) {
      throw new ValidationError('Email, password e nome sono richiesti');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Email non valida');
    }
    if (userRepo.findByEmail(email)) {
      throw new ValidationError('Utente già presente');
    }
    if (!['admin', 'partner', 'child', 'guest'].includes(roleType)) {
      throw new ValidationError('Ruolo non valido');
    }

    const userId = userRepo.createUser({
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      name,
      roleType,
      familyId: req.user.familyId,
      betaAccessStatus,
    });

    familyRepo.insertMember({
      familyId: req.user.familyId,
      userId,
      name,
      surname: '',
      role: roleType === 'admin' ? 'Amministratore famiglia' : 'Membro',
      roleType,
      email,
      avatar: '👤',
      accountStatus: 'active',
    });

    const user = userRepo.findById(userId);
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleType: user.role_type,
        betaAccessStatus: user.beta_access_status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserAccess(req, res, next) {
  try {
    const { id } = req.params;
    const user = userRepo.findById(id);
    if (!user || user.family_id !== req.user.familyId) {
      throw new ValidationError('Utente non trovato');
    }
    if (req.body?.roleType && ['admin', 'partner', 'child', 'guest'].includes(req.body.roleType)) {
      userRepo.updateRoleType(id, req.body.roleType);
    }
    if (typeof req.body?.active === 'boolean') {
      userRepo.updateBetaStatus(id, req.body.active ? 'beta_tester' : 'standard_non_abilitato');
    }
    const fresh = userRepo.findById(id);
    res.json({
      success: true,
      user: {
        id: fresh.id,
        email: fresh.email,
        name: fresh.name,
        roleType: fresh.role_type,
        betaAccessStatus: fresh.beta_access_status,
      },
    });
  } catch (err) {
    next(err);
  }
}
