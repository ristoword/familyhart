/**
 * Repository appuntamenti famiglia
 */
import { db } from '../database/db.js';

export function getAllByFamilyId(familyId, options = {}) {
  let sql = `
    SELECT id, family_id AS familyId, title, description, date, start_time AS startTime, end_time AS endTime,
           location, created_by AS createdBy, assigned_members AS assignedMembers, category,
           reminder_enabled AS reminderEnabled, created_at AS createdAt, updated_at AS updatedAt
    FROM family_appointments
    WHERE family_id = ?
  `;
  const params = [familyId];
  if (options.fromDate) {
    sql += ' AND date >= ?';
    params.push(options.fromDate);
  }
  if (options.toDate) {
    sql += ' AND date <= ?';
    params.push(options.toDate);
  }
  sql += ' ORDER BY date ASC, start_time ASC';
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  const rows = db.prepare(sql).all(...params);
  return rows.map((r) => ({
    ...r,
    assignedMembers: parseJson(r.assignedMembers),
  }));
}

export function getById(id, familyId) {
  const row = db.prepare(`
    SELECT id, family_id AS familyId, title, description, date, start_time AS startTime, end_time AS endTime,
           location, created_by AS createdBy, assigned_members AS assignedMembers, category,
           reminder_enabled AS reminderEnabled, created_at AS createdAt, updated_at AS updatedAt
    FROM family_appointments
    WHERE id = ? AND family_id = ?
  `).get(id, familyId);
  if (!row) return null;
  return { ...row, assignedMembers: parseJson(row.assignedMembers) };
}

export function insert(data) {
  const id = `apt${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT INTO family_appointments (id, family_id, title, description, date, start_time, end_time, location, created_by, assigned_members, category, reminder_enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.familyId, data.title, data.description || '', data.date,
    data.startTime || '', data.endTime || '', data.location || '',
    data.createdBy || null, JSON.stringify(data.assignedMembers || []),
    data.category || 'other', data.reminderEnabled !== false ? 1 : 0, now, now
  );
  return id;
}

export function update(id, familyId, updates) {
  const row = getById(id, familyId);
  if (!row) return false;
  const allowed = ['title', 'description', 'date', 'startTime', 'endTime', 'location', 'assignedMembers', 'category', 'reminderEnabled'];
  const set = ['updated_at = ?'];
  const values = [Math.floor(Date.now() / 1000)];
  for (const [k, v] of Object.entries(updates)) {
    const col = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    if (col === 'start_time' || col === 'starttime') { set.push('start_time = ?'); values.push(v); continue; }
    if (col === 'end_time' || col === 'endtime') { set.push('end_time = ?'); values.push(v); continue; }
    if (col === 'reminder_enabled' || col === 'reminderenabled') { set.push('reminder_enabled = ?'); values.push(v ? 1 : 0); continue; }
    if (col === 'assigned_members' || col === 'assignedmembers') { set.push('assigned_members = ?'); values.push(JSON.stringify(Array.isArray(v) ? v : [])); continue; }
    if (['title', 'description', 'date', 'location', 'category'].includes(col) && v !== undefined) {
      set.push(`${col} = ?`);
      values.push(v);
    }
  }
  values.push(id, familyId);
  db.prepare(`UPDATE family_appointments SET ${set.join(', ')} WHERE id = ? AND family_id = ?`).run(...values);
  return true;
}

export function remove(id, familyId) {
  return db.prepare('DELETE FROM family_appointments WHERE id = ? AND family_id = ?').run(id, familyId);
}

function parseJson(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}
