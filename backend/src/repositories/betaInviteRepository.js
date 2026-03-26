/**
 * Inviti beta privata
 */
import { randomBytes } from 'crypto';
import { db } from '../database/db.js';

const nowSec = () => Math.floor(Date.now() / 1000);

export function createInvite({ email, expiresAtSec, createdByUserId }) {
  const id = `binv${Date.now()}${randomBytes(4).toString('hex')}`;
  const code = randomBytes(14).toString('base64url').replace(/=/g, '');
  const emailNorm = (email || '').trim().toLowerCase();
  db.prepare(`
    INSERT INTO beta_invites (id, code, email, status, expires_at, created_by_user_id)
    VALUES (?, ?, ?, 'pending', ?, ?)
  `).run(id, code, emailNorm, expiresAtSec, createdByUserId || null);
  return { id, code, email: emailNorm, expiresAtSec };
}

export function findValidByCode(code) {
  if (!code || typeof code !== 'string') return null;
  return db.prepare(`
    SELECT * FROM beta_invites WHERE code = ? AND status = 'pending' AND expires_at > ?
  `).get(code.trim(), nowSec());
}

export function markUsed(inviteId, userId) {
  db.prepare(`
    UPDATE beta_invites SET status = 'used', used_by_user_id = ? WHERE id = ? AND status = 'pending'
  `).run(userId, inviteId);
}

export function listRecent(limit = 200) {
  return db.prepare(`
    SELECT id, code, email, status,
           expires_at AS expiresAt,
           used_by_user_id AS usedByUserId,
           created_at AS createdAt,
           created_by_user_id AS createdByUserId
    FROM beta_invites ORDER BY created_at DESC LIMIT ?
  `).all(limit);
}
