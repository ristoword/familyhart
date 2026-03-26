/**
 * Repository utenti
 */
import { db } from '../database/db.js';

export function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function updateBetaStatus(userId, status) {
  db.prepare('UPDATE users SET beta_access_status = ? WHERE id = ?').run(status, userId);
}

export function listByFamilyId(familyId) {
  return db.prepare(`
    SELECT id, email, name, avatar, role_type AS roleType, family_id AS familyId,
           beta_access_status AS betaAccessStatus, created_at AS createdAt
    FROM users
    WHERE family_id = ?
    ORDER BY created_at DESC
  `).all(familyId);
}

export function createUser(data) {
  const id = `u${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, avatar, role_type, family_id, beta_access_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.email,
    data.passwordHash,
    data.name,
    data.avatar || '👤',
    data.roleType || 'child',
    data.familyId,
    data.betaAccessStatus || 'beta_tester',
  );
  return id;
}

export function updateRoleType(userId, roleType) {
  db.prepare('UPDATE users SET role_type = ? WHERE id = ?').run(roleType, userId);
}
