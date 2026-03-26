/**
 * Controller famiglia
 */
import * as familyRepo from '../repositories/familyRepository.js';
import { getPermissionsForRole } from '../services/permissionService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

function memberToFrontend(row) {
  const roleType = row.role_type ?? row.roleType;
  const permissions = getPermissionsForRole(roleType);
  return {
    id: row.id,
    name: row.name,
    surname: row.surname || '',
    role: row.role || 'Membro',
    roleType,
    email: row.email || '',
    phone: row.phone || '',
    avatar: row.avatar || '👤',
    accountStatus: row.account_status ?? row.accountStatus ?? 'active',
    locationSharingEnabled: !!(row.location_sharing_enabled ?? row.locationSharingEnabled ?? 1),
    color: row.color || '#6B7280',
    permissions,
  };
}

export async function getMembers(req, res, next) {
  try {
    const familyId = req.user.familyId;
    const rows = familyRepo.getMembersByFamilyId(familyId);
    const members = rows.map(memberToFrontend);
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req, res, next) {
  try {
    const { name, surname, role, roleType, email, phone, avatar } = req.body || {};
    if (!name?.trim()) throw new ValidationError('Nome richiesto');
    const familyId = req.user.familyId;
    const id = familyRepo.insertMember({
      familyId,
      name: name.trim(),
      surname: (surname || '').trim(),
      role: (role || 'Membro').trim(),
      roleType: roleType || 'child',
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      avatar: avatar || '👤',
    });
    const member = familyRepo.getMemberById(id, familyId);
    res.status(201).json({ success: true, member: memberToFrontend({ ...member, accountStatus: 'active', locationSharingEnabled: 1 }) });
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const existing = familyRepo.getMemberById(id, familyId);
    if (!existing) throw new NotFoundError('Membro non trovato');
    const updates = {};
    const allowed = ['name', 'surname', 'role', 'roleType', 'email', 'phone', 'avatar', 'locationSharingEnabled'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    if (Object.keys(updates).length) {
      const sqlUpdates = { ...updates };
      if (updates.roleType) sqlUpdates.role_type = updates.roleType;
      if (updates.locationSharingEnabled !== undefined) sqlUpdates.location_sharing_enabled = updates.locationSharingEnabled ? 1 : 0;
      delete sqlUpdates.roleType;
      delete sqlUpdates.locationSharingEnabled;
      familyRepo.updateMember(id, familyId, sqlUpdates);
    }
    const member = familyRepo.getMemberById(id, familyId);
    res.json({ success: true, member: memberToFrontend(member) });
  } catch (err) {
    next(err);
  }
}

export async function deleteMember(req, res, next) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const existing = familyRepo.getMemberById(id, familyId);
    if (!existing) throw new NotFoundError('Membro non trovato');
    familyRepo.deleteMember(id, familyId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
