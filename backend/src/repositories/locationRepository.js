/**
 * Repository posizioni membri
 */
import { db } from '../database/db.js';

export function insertLocation(data) {
  const id = `loc${Date.now()}`;
  db.prepare(`
    INSERT INTO member_locations (
      id, member_id, latitude, longitude, accuracy, source, recorded_at, battery_level, is_moving
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.memberId,
    data.latitude,
    data.longitude,
    data.accuracy ?? null,
    data.source || 'device',
    data.recordedAt ?? Math.floor(Date.now() / 1000),
    data.batteryLevel ?? null,
    data.isMoving == null ? null : data.isMoving ? 1 : 0
  );
  return id;
}

export function getLatestByMemberId(memberId, familyId) {
  return db.prepare(`
    SELECT l.id, l.member_id AS memberId, l.latitude, l.longitude, l.accuracy, l.source,
           l.recorded_at AS recordedAt, l.battery_level AS batteryLevel, l.is_moving AS isMoving
    FROM member_locations l
    JOIN family_members m ON m.id = l.member_id AND m.family_id = ?
    WHERE l.member_id = ?
    ORDER BY l.recorded_at DESC
    LIMIT 1
  `).get(familyId, memberId);
}

export function getLatestForFamily(familyId) {
  return db.prepare(`
    SELECT l.id, l.member_id AS memberId, l.latitude, l.longitude, l.accuracy, l.source,
           l.recorded_at AS recordedAt, l.battery_level AS batteryLevel, l.is_moving AS isMoving
    FROM member_locations l
    JOIN (
      SELECT l2.member_id, MAX(l2.recorded_at) AS max_recorded
      FROM member_locations l2
      JOIN family_members fm2 ON fm2.id = l2.member_id AND fm2.family_id = ?
      GROUP BY l2.member_id
    ) latest ON latest.member_id = l.member_id AND latest.max_recorded = l.recorded_at
    ORDER BY l.recorded_at DESC
  `).all(familyId);
}
