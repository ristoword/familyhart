/**
 * Servizio appuntamenti famiglia
 */
import * as repo from '../repositories/appointmentRepository.js';
import * as notifRepo from '../repositories/notificationRepository.js';
import * as realtime from '../realtime/emitter.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

function toFrontend(apt) {
  return {
    id: apt.id,
    familyId: apt.familyId,
    title: apt.title,
    description: apt.description || '',
    date: apt.date,
    startTime: apt.startTime || '',
    endTime: apt.endTime || '',
    location: apt.location || '',
    createdBy: apt.createdBy,
    assignedMembers: apt.assignedMembers || [],
    category: apt.category || 'other',
    reminderEnabled: !!apt.reminderEnabled,
    createdAt: apt.createdAt ? apt.createdAt * 1000 : null,
    updatedAt: apt.updatedAt ? apt.updatedAt * 1000 : null,
  };
}

export function getAppointments(familyId, options = {}) {
  return repo.getAllByFamilyId(familyId, options);
}

export function getAppointmentById(id, familyId) {
  const apt = repo.getById(id, familyId);
  if (!apt) throw new NotFoundError('Appuntamento non trovato');
  return apt;
}

export function createAppointment(data, familyId, createdBy) {
  if (!data.title?.trim()) throw new ValidationError('Titolo richiesto');
  if (!data.date) throw new ValidationError('Data richiesta');
  const id = repo.insert({
    familyId,
    title: data.title.trim(),
    description: (data.description || '').trim(),
    date: String(data.date).slice(0, 10),
    startTime: (data.startTime || '').trim(),
    endTime: (data.endTime || '').trim(),
    location: (data.location || '').trim(),
    createdBy: createdBy || null,
    assignedMembers: Array.isArray(data.assignedMembers) ? data.assignedMembers : [],
    category: data.category || 'other',
    reminderEnabled: data.reminderEnabled !== false,
  });
  const apt = repo.getById(id, familyId);
  const notifId = notifRepo.insertNotification({
    familyId,
    type: 'agenda',
    title: `Nuovo appuntamento: ${apt.title}`,
    message: apt.date + (apt.startTime ? ` alle ${apt.startTime}` : ''),
    icon: '📅',
  });
  const notif = { id: notifId, type: 'agenda', title: `Nuovo appuntamento: ${apt.title}`, message: apt.date + (apt.startTime ? ` alle ${apt.startTime}` : ''), icon: '📅', read: false };
  realtime.emitNewNotification(familyId, notif);
  realtime.emitAppointmentCreated(familyId, toFrontend(apt));
  return apt;
}

export function updateAppointment(id, familyId, updates) {
  const apt = repo.getById(id, familyId);
  if (!apt) throw new NotFoundError('Appuntamento non trovato');
  const payload = {};
  if (updates.title !== undefined) payload.title = String(updates.title).trim();
  if (updates.description !== undefined) payload.description = String(updates.description).trim();
  if (updates.date !== undefined) payload.date = String(updates.date).slice(0, 10);
  if (updates.startTime !== undefined) payload.startTime = String(updates.startTime);
  if (updates.endTime !== undefined) payload.endTime = String(updates.endTime);
  if (updates.location !== undefined) payload.location = String(updates.location);
  if (updates.assignedMembers !== undefined) payload.assignedMembers = Array.isArray(updates.assignedMembers) ? updates.assignedMembers : [];
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.reminderEnabled !== undefined) payload.reminderEnabled = !!updates.reminderEnabled;
  repo.update(id, familyId, payload);
  const updated = repo.getById(id, familyId);
  notifRepo.insertNotification({
    familyId,
    type: 'agenda',
    title: `Appuntamento aggiornato: ${payload.title || apt.title}`,
    message: (payload.date || apt.date) + (payload.startTime || apt.startTime ? ` alle ${payload.startTime || apt.startTime}` : ''),
    icon: '📅',
  });
  realtime.emitNewNotification(familyId, { type: 'agenda', title: `Appuntamento aggiornato: ${payload.title || apt.title}`, read: false });
  realtime.emitAppointmentUpdated(familyId, toFrontend(updated));
  return updated;
}

export function deleteAppointment(id, familyId) {
  const apt = repo.getById(id, familyId);
  if (!apt) throw new NotFoundError('Appuntamento non trovato');
  repo.remove(id, familyId);
  realtime.emitAppointmentDeleted(familyId, id);
  return true;
}
