/**
 * Controller appuntamenti famiglia
 */
import * as service from '../services/appointmentService.js';

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

export async function getAppointments(req, res, next) {
  try {
    const list = service.getAppointments(req.user.familyId, {
      fromDate: req.query.from,
      toDate: req.query.to,
      limit: req.query.limit ? Number(req.query.limit) : 200,
    });
    res.json({ success: true, appointments: list.map(toFrontend) });
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const apt = service.createAppointment(req.body || {}, req.user.familyId, req.user.id);
    res.status(201).json({ success: true, appointment: toFrontend(apt) });
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const apt = service.updateAppointment(req.params.id, req.user.familyId, req.body || {});
    res.json({ success: true, appointment: toFrontend(apt) });
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    service.deleteAppointment(req.params.id, req.user.familyId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
