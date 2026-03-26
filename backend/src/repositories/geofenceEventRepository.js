/**
 * Repository eventi geofence
 */
import { db } from '../database/db.js';

export function insertGeofenceEvent(data) {
  const id = `gfe${Date.now()}`;
  db.prepare(`
    INSERT INTO geofence_events (id, member_id, safe_place_id, event_type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    data.memberId,
    data.safePlaceId,
    data.eventType,
    data.createdAt ?? Math.floor(Date.now() / 1000)
  );
  return id;
}

export function getEventsByFamilyId(familyId, limit = 100) {
  return db.prepare(`
    SELECT g.id, g.member_id AS memberId, g.safe_place_id AS safePlaceId, g.event_type AS eventType, g.created_at AS createdAt
    FROM geofence_events g
    JOIN family_members m ON m.id = g.member_id AND m.family_id = ?
    ORDER BY g.created_at DESC
    LIMIT ?
  `).all(familyId, limit);
}
