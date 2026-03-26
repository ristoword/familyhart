/**
 * Repository push subscriptions
 */
import { db } from '../database/db.js';

export function upsertSubscription({ familyId, userId, endpoint, p256dh, auth, userAgent = '' }) {
  const id = `ps${Date.now()}${Math.floor(Math.random() * 1000)}`;
  db.prepare(`
    INSERT INTO push_subscriptions (id, family_id, user_id, endpoint, p256dh, auth, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(family_id, endpoint) DO UPDATE SET
      user_id = excluded.user_id,
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      user_agent = excluded.user_agent
  `).run(id, familyId, userId || null, endpoint, p256dh, auth, userAgent);
}

export function removeSubscription({ familyId, endpoint }) {
  return db.prepare('DELETE FROM push_subscriptions WHERE family_id = ? AND endpoint = ?').run(familyId, endpoint);
}

export function getFamilySubscriptions(familyId) {
  return db.prepare(`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE family_id = ?
  `).all(familyId);
}

