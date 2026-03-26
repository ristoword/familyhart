/**
 * Repository famiglia e membri
 */
import { db } from '../database/db.js';

export function getMembersByFamilyId(familyId) {
  return db.prepare(`
    SELECT id, family_id AS familyId, user_id AS userId, name, surname, role, role_type AS roleType,
           email, phone, avatar, account_status AS accountStatus, location_sharing_enabled AS locationSharingEnabled,
           color
    FROM family_members
    WHERE family_id = ?
    ORDER BY role_type = 'admin' DESC, role_type = 'partner' DESC, name
  `).all(familyId);
}

export function getMemberById(memberId, familyId) {
  return db.prepare(`
    SELECT * FROM family_members WHERE id = ? AND family_id = ?
  `).get(memberId, familyId);
}

export function insertMember(data) {
  const id = String(Date.now());
  db.prepare(`
    INSERT INTO family_members (id, family_id, user_id, name, surname, role, role_type, email, phone, avatar, account_status, location_sharing_enabled, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.familyId, data.userId || null, data.name || 'Nuovo', data.surname || '', data.role || 'Membro',
    data.roleType || 'child', data.email || '', data.phone || '', data.avatar || '👤',
    data.accountStatus || 'active', 1, data.color || '#6B7280'
  );
  return id;
}

export function updateMember(memberId, familyId, updates) {
  const allowed = ['name', 'surname', 'role', 'role_type', 'email', 'phone', 'avatar', 'location_sharing_enabled', 'color'];
  const set = [];
  const values = [];
  for (const [k, v] of Object.entries(updates)) {
    const col = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    if (allowed.includes(col) && v !== undefined) {
      set.push(`${col} = ?`);
      values.push(v);
    }
  }
  if (set.length === 0) return;
  values.push(memberId, familyId);
  db.prepare(`UPDATE family_members SET ${set.join(', ')} WHERE id = ? AND family_id = ?`).run(...values);
}

export function deleteMember(memberId, familyId) {
  return db.prepare('DELETE FROM family_members WHERE id = ? AND family_id = ?').run(memberId, familyId);
}
