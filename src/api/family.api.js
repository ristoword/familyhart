/**
 * Family API - Backend reale
 */
import { api } from './client.js';

/**
 * Membri famiglia
 * GET /api/family/members
 */
export async function getMembers() {
  const data = await api('/api/family/members');
  return { members: data.members || [] };
}

/**
 * Aggiungi membro
 * POST /api/family/members
 */
export async function addMember(data) {
  return api('/api/family/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Aggiorna membro
 * PATCH /api/family/members/:id
 */
export async function updateMember(memberId, data) {
  return api(`/api/family/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Rimuovi membro
 * DELETE /api/family/members/:id
 */
export async function removeMember(memberId) {
  return api(`/api/family/members/${memberId}`, { method: 'DELETE' });
}
