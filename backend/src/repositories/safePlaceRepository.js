/**
 * Repository luoghi sicuri
 */
import { db } from '../database/db.js';

export function getPlacesByFamilyId(familyId) {
  const places = db.prepare(`
    SELECT id, family_id AS familyId, name, address, lat, lng, radius,
           notify_entry AS notifyEntry, notify_exit AS notifyExit
    FROM safe_places
    WHERE family_id = ?
    ORDER BY name
  `).all(familyId);

  for (const p of places) {
    const members = db.prepare(`
      SELECT member_id FROM safe_place_members WHERE place_id = ?
    `).all(p.id);
    p.memberIds = members.map((m) => m.member_id);
  }
  return places;
}

export function getPlaceById(placeId, familyId) {
  const place = db.prepare(`
    SELECT * FROM safe_places WHERE id = ? AND family_id = ?
  `).get(placeId, familyId);
  if (!place) return null;
  const members = db.prepare('SELECT member_id FROM safe_place_members WHERE place_id = ?').all(placeId);
  place.memberIds = members.map((m) => m.member_id);
  return place;
}

export function insertPlace(data) {
  const id = `sp${Date.now()}`;
  db.prepare(`
    INSERT INTO safe_places (id, family_id, name, address, lat, lng, radius, notify_entry, notify_exit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.familyId, data.name, data.address || '', data.lat, data.lng,
    data.radius ?? 100, data.notifyEntry !== false ? 1 : 0, data.notifyExit !== false ? 1 : 0
  );
  if (data.memberIds?.length) {
    const ins = db.prepare('INSERT OR IGNORE INTO safe_place_members (place_id, member_id) VALUES (?, ?)');
    for (const mid of data.memberIds) ins.run(id, mid);
  }
  return id;
}

export function updatePlace(placeId, familyId, updates) {
  const allowed = ['name', 'address', 'lat', 'lng', 'radius', 'notify_entry', 'notify_exit'];
  const set = [];
  const values = [];
  for (const [k, v] of Object.entries(updates)) {
    const col = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    if (allowed.includes(col) && v !== undefined) {
      set.push(`${col} = ?`);
      values.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
  }
  if (updates.memberIds !== undefined) {
    db.prepare('DELETE FROM safe_place_members WHERE place_id = ?').run(placeId);
    if (Array.isArray(updates.memberIds) && updates.memberIds.length) {
      const ins = db.prepare('INSERT INTO safe_place_members (place_id, member_id) VALUES (?, ?)');
      for (const mid of updates.memberIds) ins.run(placeId, mid);
    }
  }
  if (set.length > 0) {
    values.push(placeId, familyId);
    db.prepare(`UPDATE safe_places SET ${set.join(', ')} WHERE id = ? AND family_id = ?`).run(...values);
  }
}

export function deletePlace(placeId, familyId) {
  return db.prepare('DELETE FROM safe_places WHERE id = ? AND family_id = ?').run(placeId, familyId);
}
