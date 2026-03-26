/**
 * Servizio eventi famiglia
 */
import * as repo from '../repositories/familyEventRepository.js';
import * as notifRepo from '../repositories/notificationRepository.js';
import * as realtime from '../realtime/emitter.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

function toFrontend(evt) {
  return {
    id: evt.id,
    familyId: evt.familyId,
    title: evt.title,
    description: evt.description || '',
    eventDate: evt.eventDate,
    startTime: evt.startTime || '',
    endTime: evt.endTime || '',
    location: evt.location || '',
    eventType: evt.eventType || 'other',
    createdBy: evt.createdBy,
    participants: evt.participants || [],
    isAllDay: !!evt.isAllDay,
    reminderEnabled: !!evt.reminderEnabled,
    createdAt: evt.createdAt ? evt.createdAt * 1000 : null,
    updatedAt: evt.updatedAt ? evt.updatedAt * 1000 : null,
  };
}

export function getEvents(familyId, options = {}) {
  return repo.getAllByFamilyId(familyId, options);
}

export function getEventById(id, familyId) {
  const evt = repo.getById(id, familyId);
  if (!evt) throw new NotFoundError('Evento non trovato');
  return evt;
}

export function createEvent(data, familyId, createdBy) {
  if (!data.title?.trim()) throw new ValidationError('Titolo richiesto');
  if (!data.eventDate) throw new ValidationError('Data evento richiesta');
  const id = repo.insert({
    familyId,
    title: data.title.trim(),
    description: (data.description || '').trim(),
    eventDate: String(data.eventDate).slice(0, 10),
    startTime: (data.startTime || '').trim(),
    endTime: (data.endTime || '').trim(),
    location: (data.location || '').trim(),
    eventType: data.eventType || 'other',
    createdBy: createdBy || null,
    participants: Array.isArray(data.participants) ? data.participants : [],
    isAllDay: !!data.isAllDay,
    reminderEnabled: data.reminderEnabled !== false,
  });
  const evt = repo.getById(id, familyId);
  notifRepo.insertNotification({
    familyId,
    type: 'agenda',
    title: `Nuovo evento: ${evt.title}`,
    message: evt.eventDate + (evt.isAllDay ? ' (tutto il giorno)' : evt.startTime ? ` alle ${evt.startTime}` : ''),
    icon: '🎉',
  });
  realtime.emitNewNotification(familyId, { type: 'agenda', title: `Nuovo evento: ${evt.title}`, read: false });
  realtime.emitEventCreated(familyId, toFrontend(evt));
  return evt;
}

export function updateEvent(id, familyId, updates) {
  const evt = repo.getById(id, familyId);
  if (!evt) throw new NotFoundError('Evento non trovato');
  const payload = {};
  if (updates.title !== undefined) payload.title = String(updates.title).trim();
  if (updates.description !== undefined) payload.description = String(updates.description).trim();
  if (updates.eventDate !== undefined) payload.eventDate = String(updates.eventDate).slice(0, 10);
  if (updates.startTime !== undefined) payload.startTime = String(updates.startTime);
  if (updates.endTime !== undefined) payload.endTime = String(updates.endTime);
  if (updates.location !== undefined) payload.location = String(updates.location);
  if (updates.eventType !== undefined) payload.eventType = updates.eventType;
  if (updates.participants !== undefined) payload.participants = Array.isArray(updates.participants) ? updates.participants : [];
  if (updates.isAllDay !== undefined) payload.isAllDay = !!updates.isAllDay;
  if (updates.reminderEnabled !== undefined) payload.reminderEnabled = !!updates.reminderEnabled;
  repo.update(id, familyId, payload);
  notifRepo.insertNotification({
    familyId,
    type: 'agenda',
    title: `Evento aggiornato: ${payload.title || evt.title}`,
    message: (payload.eventDate || evt.eventDate) + (payload.isAllDay ?? evt.isAllDay ? ' (tutto il giorno)' : ''),
    icon: '🎉',
  });
  return repo.getById(id, familyId);
}

export function deleteEvent(id, familyId) {
  const evt = repo.getById(id, familyId);
  if (!evt) throw new NotFoundError('Evento non trovato');
  repo.remove(id, familyId);
  realtime.emitEventDeleted(familyId, id);
  return true;
}
