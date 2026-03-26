/**
 * Controller luoghi sicuri
 */
import * as placeRepo from '../repositories/safePlaceRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

function placeToFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address || '',
    lat: row.lat,
    lng: row.lng,
    radius: row.radius ?? 100,
    memberIds: row.memberIds || [],
    notifyEntry: !!(row.notifyEntry ?? row.notify_entry ?? 1),
    notifyExit: !!(row.notifyExit ?? row.notify_exit ?? 1),
  };
}

export async function getPlaces(req, res, next) {
  try {
    const familyId = req.user.familyId;
    const rows = placeRepo.getPlacesByFamilyId(familyId);
    res.json({ success: true, places: rows.map(placeToFrontend) });
  } catch (err) {
    next(err);
  }
}

export async function addPlace(req, res, next) {
  try {
    const { name, address, lat, lng, radius, memberIds, notifyEntry, notifyExit } = req.body || {};
    if (!name?.trim()) throw new ValidationError('Nome richiesto');
    if (lat == null || lng == null) throw new ValidationError('Lat e lng richiesti');
    const familyId = req.user.familyId;
    const id = placeRepo.insertPlace({
      familyId,
      name: name.trim(),
      address: (address || '').trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius ?? 100,
      memberIds: Array.isArray(memberIds) ? memberIds : [],
      notifyEntry,
      notifyExit,
    });
    const place = placeRepo.getPlaceById(id, familyId);
    res.status(201).json({ success: true, place: placeToFrontend(place) });
  } catch (err) {
    next(err);
  }
}

export async function updatePlace(req, res, next) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const existing = placeRepo.getPlaceById(id, familyId);
    if (!existing) throw new NotFoundError('Luogo non trovato');
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.lat !== undefined) updates.lat = req.body.lat;
    if (req.body.lng !== undefined) updates.lng = req.body.lng;
    if (req.body.radius !== undefined) updates.radius = req.body.radius;
    if (req.body.memberIds !== undefined) updates.memberIds = req.body.memberIds;
    if (req.body.notifyEntry !== undefined) updates.notify_entry = req.body.notifyEntry ? 1 : 0;
    if (req.body.notifyExit !== undefined) updates.notify_exit = req.body.notifyExit ? 1 : 0;
    if (Object.keys(updates).length) {
      placeRepo.updatePlace(id, familyId, updates);
    }
    const place = placeRepo.getPlaceById(id, familyId);
    res.json({ success: true, place: placeToFrontend(place) });
  } catch (err) {
    next(err);
  }
}

export async function deletePlace(req, res, next) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const existing = placeRepo.getPlaceById(id, familyId);
    if (!existing) throw new NotFoundError('Luogo non trovato');
    placeRepo.deletePlace(id, familyId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
