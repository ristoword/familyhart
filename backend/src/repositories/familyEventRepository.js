/**
 * Repository eventi famiglia
 */
import { db } from '../database/db.js';

export function getAllByFamilyId(familyId, options = {}) {
  let sql = `
    SELECT id, family_id AS familyId, title, description, event_date AS eventDate, start_time AS startTime, end_time AS endTime,
           location, event_type AS eventType, created_by AS createdBy, participants, is_all_day AS isAllDay,
           reminder_enabled AS reminderEnabled, created_at AS createdAt, updated_at AS updatedAt
    FROM family_events
    WHERE family_id = ?
  `;
  const params = [familyId];
  if (options.fromDate) {
    sql += ' AND event_date >= ?';
    params.push(options.fromDate);
  }
  if (options.toDate) {
    sql += ' AND event_date <= ?';
    params.push(options.toDate);
  }
  sql += ' ORDER BY event_date ASC, start_time ASC';
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  const rows = db.prepare(sql).all(...params);
  return rows.map((r) => ({
    ...r,
    participants: parseJson(r.participants),
    isAllDay: !!r.isAllDay,
  }));
}

export function getById(id, familyId) {
  const row = db.prepare(`
    SELECT id, family_id AS familyId, title, description, event_date AS eventDate, start_time AS startTime, end_time AS endTime,
           location, event_type AS eventType, created_by AS createdBy, participants, is_all_day AS isAllDay,
           reminder_enabled AS reminderEnabled, created_at AS createdAt, updated_at AS updatedAt
    FROM family_events
    WHERE id = ? AND family_id = ?
  `).get(id, familyId);
  if (!row) return null;
  return { ...row, participants: parseJson(row.participants), isAllDay: !!row.isAllDay };
}

export function insert(data) {
  const id = `evt${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT INTO family_events (id, family_id, title, description, event_date, start_time, end_time, location, event_type, created_by, participants, is_all_day, reminder_enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.familyId, data.title, data.description || '', data.eventDate,
    data.startTime || '', data.endTime || '', data.location || '',
    data.eventType || 'other', data.createdBy || null,
    JSON.stringify(data.participants || []), data.isAllDay ? 1 : 0,
    data.reminderEnabled !== false ? 1 : 0, now, now
  );
  return id;
}

export function update(id, familyId, updates) {
  const row = getById(id, familyId);
  if (!row) return false;
  const set = ['updated_at = ?'];
  const values = [Math.floor(Date.now() / 1000)];
  const map = {
    title: 'title', description: 'description', eventDate: 'event_date', startTime: 'start_time',
    endTime: 'end_time', location: 'location', eventType: 'event_type', participants: 'participants',
    isAllDay: 'is_all_day', reminderEnabled: 'reminder_enabled',
  };
  for (const [k, v] of Object.entries(updates)) {
    const col = map[k];
    if (!col || v === undefined) continue;
    set.push(`${col} = ?`);
    if (col === 'participants') values.push(JSON.stringify(Array.isArray(v) ? v : []));
    else if (col === 'is_all_day') values.push(v ? 1 : 0);
    else if (col === 'reminder_enabled') values.push(v ? 1 : 0);
    else values.push(v);
  }
  values.push(id, familyId);
  db.prepare(`UPDATE family_events SET ${set.join(', ')} WHERE id = ? AND family_id = ?`).run(...values);
  return true;
}

export function remove(id, familyId) {
  return db.prepare('DELETE FROM family_events WHERE id = ? AND family_id = ?').run(id, familyId);
}

function parseJson(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}
