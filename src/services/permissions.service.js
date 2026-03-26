/**
 * Permissions Service - Controllo permessi per ruoli
 *
 * Stato attuale: permessi derivati da roleType del membro.
 * La UI usa canUser(user, permission) per mostrare/nascondere pulsanti admin.
 *
 * TODO Backend:
 * - Permessi custom per membro (override ruolo)
 * - API per aggiornare permessi
 */

import { PERMISSION, MEMBER_ROLE } from '../data/constants';
import { getPermissionsForRole } from '../data/familyInitial';

/**
 * Verifica se l'utente ha un permesso
 * @param {object} user - { roleType, permissions? }
 * @param {string} permission - chiave da PERMISSION
 * @returns {boolean}
 */
export function canUser(user, permission) {
  if (!user) return false;
  const perms = user.permissions || getPermissionsForRole(user.roleType);
  return perms.includes(permission);
}

/**
 * Restituisce permessi per un ruolo
 * @param {string} roleType
 * @returns {string[]}
 */
export function getRolePermissions(roleType) {
  return getPermissionsForRole(roleType);
}

/**
 * Verifica se l'utente è admin
 */
export function isAdmin(user) {
  return user?.roleType === MEMBER_ROLE.ADMIN;
}

/**
 * Verifica se l'utente può gestire membri (admin o partner con permesso)
 */
export function canManageMembers(user) {
  return canUser(user, PERMISSION.MANAGE_MEMBERS) || canUser(user, PERMISSION.INVITE_MEMBERS);
}
