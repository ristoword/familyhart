/**
 * Family Service - Gestione membri famiglia
 *
 * Stato attuale: membri e inviti gestiti da AppContext + localStorage.
 * Le pagine usano useApp() per members, addMember, updateMember, etc.
 *
 * TODO Backend:
 * - GET/POST/PATCH /api/families/:id/members
 * - POST /api/invites, PATCH /api/invites/:id/accept
 * - WebSocket per sincronizzazione famiglia
 */

import { loadMembers, saveMembers } from '../utils/storage';

/**
 * Carica membri da storage
 */
export function loadMembersFromStorage() {
  return loadMembers();
}

/**
 * Salva membri
 */
export function persistMembers(members) {
  saveMembers(members);
}
