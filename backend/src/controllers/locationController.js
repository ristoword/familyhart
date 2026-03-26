/**
 * Controller location/geofence
 */
import * as locationService from '../services/locationService.js';
import { NotFoundError } from '../utils/errors.js';

function toFrontendLocation(row) {
  if (!row) return null;
  return {
    id: row.id,
    memberId: row.memberId,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy,
    source: row.source,
    recordedAt: row.recordedAt ? new Date(row.recordedAt * 1000).toISOString() : null,
    batteryLevel: row.batteryLevel,
    isMoving: row.isMoving == null ? null : !!row.isMoving,
  };
}

function toFrontendGeofenceEvent(row) {
  return {
    id: row.id,
    memberId: row.memberId,
    safePlaceId: row.safePlaceId,
    eventType: row.eventType,
    createdAt: row.createdAt ? new Date(row.createdAt * 1000).toISOString() : null,
  };
}

export async function getLocations(req, res, next) {
  try {
    const locations = locationService
      .getFamilyLatestLocations(req.user.familyId)
      .map(toFrontendLocation);
    res.json({ success: true, locations });
  } catch (err) {
    next(err);
  }
}

export async function getLatestMemberLocation(req, res, next) {
  try {
    const location = toFrontendLocation(
      locationService.getLatestMemberLocation(req.params.memberId, req.user.familyId)
    );
    if (!location) throw new NotFoundError('Posizione non trovata');
    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
}

export async function createLocation(req, res, next) {
  try {
    const location = toFrontendLocation(
      locationService.saveLocation(req.body || {}, req.user.familyId)
    );
    res.status(201).json({ success: true, location });
  } catch (err) {
    next(err);
  }
}

export async function getGeofenceEvents(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const events = locationService
      .getGeofenceEvents(req.user.familyId, limit)
      .map(toFrontendGeofenceEvent);
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
}

export async function createGeofenceEvent(req, res, next) {
  try {
    const result = locationService.saveGeofenceEvent(req.body || {}, req.user.familyId);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
