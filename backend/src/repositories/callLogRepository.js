/**
 * Repository call logs
 */
import { db } from '../database/db.js';

export function insert(data) {
  const id = `cl${Date.now()}`;
  db.prepare(`
    INSERT INTO call_logs (id, family_id, caller_id, callee_ids, call_type, outcome, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.familyId,
    data.callerId || null,
    JSON.stringify(data.calleeIds || []),
    data.callType || 'audio',
    data.outcome || 'completed',
    data.durationSeconds || 0
  );
  return id;
}

export function getByFamilyId(familyId, limit = 50) {
  const rows = db.prepare(`
    SELECT id, family_id AS familyId, caller_id AS callerId, callee_ids AS calleeIds,
           call_type AS callType, outcome, duration_seconds AS durationSeconds, created_at AS createdAt
    FROM call_logs
    WHERE family_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(familyId, limit);
  return rows.map((r) => ({
    ...r,
    calleeIds: (() => { try { return JSON.parse(r.calleeIds || '[]'); } catch { return []; } })(),
  }));
}
