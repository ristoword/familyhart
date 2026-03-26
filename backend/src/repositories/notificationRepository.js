/**
 * Repository notifiche
 */
import { db } from '../database/db.js';
import * as pushService from '../services/pushService.js';

export function getNotificationsByFamilyId(familyId, options = {}) {
  let sql = `
    SELECT id, family_id AS familyId, type, title, message, icon, read, member_id AS memberId, created_at AS createdAt
    FROM notifications
    WHERE family_id = ?
  `;
  const params = [familyId];
  if (options.unreadOnly) {
    sql += ' AND read = 0';
  }
  sql += ' ORDER BY created_at DESC';
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  const rows = db.prepare(sql).all(...params);
  return rows.map((r) => ({
    ...r,
    time: formatTime(r.createdAt),
    timestamp: r.createdAt * 1000,
  }));
}

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export function insertNotification(data) {
  const id = `n${Date.now()}`;
  db.prepare(`
    INSERT INTO notifications (id, family_id, type, title, message, icon, read, member_id)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, data.familyId, data.type || 'info', data.title, data.message || '', data.icon || '📢', data.memberId || null);
  // fire-and-forget push mirror della notifica interna
  pushService.sendToFamily(data.familyId, {
    type: data.type || 'info',
    title: data.title || 'Family Hart',
    body: data.message || '',
    icon: data.icon || '📢',
  }).catch(() => {});
  return id;
}

export function markAsRead(notificationId, familyId) {
  return db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND family_id = ?').run(notificationId, familyId);
}
