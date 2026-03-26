/**
 * Servizio location/geofence
 */
import * as locationRepo from '../repositories/locationRepository.js';
import * as geofenceRepo from '../repositories/geofenceEventRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import * as safePlaceRepo from '../repositories/safePlaceRepository.js';
import * as notifRepo from '../repositories/notificationRepository.js';
import * as realtime from '../realtime/emitter.js';
import { ValidationError } from '../utils/errors.js';

function ensureLocationInput(input) {
  if (input.memberId == null) throw new ValidationError('memberId richiesto');
  if (input.latitude == null || input.longitude == null) {
    throw new ValidationError('latitude e longitude richiesti');
  }
}

export function saveLocation(input, familyId) {
  ensureLocationInput(input);
  const member = familyRepo.getMemberById(String(input.memberId), familyId);
  if (!member) throw new ValidationError('memberId non valido per questa famiglia');
  const id = locationRepo.insertLocation({
    memberId: String(input.memberId),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    accuracy: input.accuracy == null ? null : Number(input.accuracy),
    source: input.source || 'device',
    recordedAt: input.recordedAt ? Math.floor(new Date(input.recordedAt).getTime() / 1000) : undefined,
    batteryLevel: input.batteryLevel == null ? null : Number(input.batteryLevel),
    isMoving: input.isMoving == null ? null : !!input.isMoving,
  });
  return locationRepo.getLatestByMemberId(String(input.memberId), familyId) || { id };
}

export function getLatestMemberLocation(memberId, familyId) {
  return locationRepo.getLatestByMemberId(String(memberId), familyId);
}

export function getFamilyLatestLocations(familyId) {
  return locationRepo.getLatestForFamily(familyId);
}

export function saveGeofenceEvent(input, familyId) {
  if (!input.memberId || !input.safePlaceId || !input.eventType) {
    throw new ValidationError('memberId, safePlaceId e eventType richiesti');
  }
  if (!['enter', 'exit'].includes(input.eventType)) {
    throw new ValidationError('eventType deve essere enter o exit');
  }
  const member = familyRepo.getMemberById(String(input.memberId), familyId);
  if (!member) throw new ValidationError('memberId non valido per questa famiglia');
  const place = safePlaceRepo.getPlaceById(String(input.safePlaceId), familyId);
  if (!place) throw new ValidationError('safePlaceId non valido per questa famiglia');
  const id = geofenceRepo.insertGeofenceEvent({
    memberId: String(input.memberId),
    safePlaceId: String(input.safePlaceId),
    eventType: input.eventType,
    createdAt: input.createdAt ? Math.floor(new Date(input.createdAt).getTime() / 1000) : undefined,
  });
  const memberName = member.name || 'Membro';
  const placeName = place.name || 'Luogo';
  const title = input.eventType === 'enter'
    ? `${memberName} è arrivat${/a$/.test(memberName) ? 'a' : 'o'} a ${placeName}`
    : `${memberName} ha lasciato ${placeName}`;
  notifRepo.insertNotification({
    familyId,
    type: 'position',
    title,
    message: placeName,
    icon: input.eventType === 'enter' ? '📍' : '🚶',
  });
  realtime.emitNewNotification(familyId, { type: 'position', title, message: placeName, icon: input.eventType === 'enter' ? '📍' : '🚶', read: false });
  return { id };
}

export function getGeofenceEvents(familyId, limit = 100) {
  return geofenceRepo.getEventsByFamilyId(familyId, limit);
}
