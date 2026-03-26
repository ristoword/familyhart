/**
 * Notifications API - Backend reale
 */
import { api } from './client.js';

/**
 * Notifiche/avvisi
 * GET /api/notifications
 */
export async function getNotifications(unreadOnly = false) {
  const q = unreadOnly ? '?unread=true' : '';
  const data = await api(`/api/notifications${q}`);
  return { notifications: data.notifications || [], alerts: data.notifications || [] };
}

/**
 * Segna come letto
 * PATCH /api/notifications/:id/read
 */
export async function markAsRead(notificationId) {
  return api(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}
