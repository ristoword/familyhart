/**
 * Controller notifiche
 */
import * as notifRepo from '../repositories/notificationRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

function notifToFrontend(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message || '',
    time: row.time,
    timestamp: row.timestamp,
    read: !!row.read,
    icon: row.icon || '📢',
  };
}

export async function getNotifications(req, res, next) {
  try {
    const familyId = req.user.familyId;
    const unreadOnly = req.query.unread === 'true';
    const rows = notifRepo.getNotificationsByFamilyId(familyId, { unreadOnly });
    res.json({ success: true, notifications: rows.map(notifToFrontend) });
  } catch (err) {
    next(err);
  }
}

export async function createNotification(req, res, next) {
  try {
    const { type, title, message, icon } = req.body || {};
    if (!title?.trim()) throw new ValidationError('Titolo richiesto');
    const familyId = req.user.familyId;
    const id = notifRepo.insertNotification({
      familyId,
      type: type || 'info',
      title: title.trim(),
      message: (message || '').trim(),
      icon: icon || '📢',
    });
    const now = Math.floor(Date.now() / 1000);
    const notification = notifToFrontend({ id, type: type || 'info', title: title.trim(), message: (message || '').trim(), icon: icon || '📢', read: 0, createdAt: now });
    notification.time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    notification.timestamp = Date.now();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const result = notifRepo.markAsRead(id, familyId);
    if (result.changes === 0) throw new NotFoundError('Notifica non trovata');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
