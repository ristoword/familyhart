/**
 * Controller eventi famiglia
 */
import * as service from '../services/familyEventService.js';

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

export async function getEvents(req, res, next) {
  try {
    const list = service.getEvents(req.user.familyId, {
      fromDate: req.query.from,
      toDate: req.query.to,
      limit: req.query.limit ? Number(req.query.limit) : 200,
    });
    res.json({ success: true, events: list.map(toFrontend) });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const evt = service.createEvent(req.body || {}, req.user.familyId, req.user.id);
    res.status(201).json({ success: true, event: toFrontend(evt) });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const evt = service.updateEvent(req.params.id, req.user.familyId, req.body || {});
    res.json({ success: true, event: toFrontend(evt) });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    service.deleteEvent(req.params.id, req.user.familyId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
