/**
 * Family Events API - backend reale con fallback
 */
import { api } from './client.js';

export async function getFamilyEvents(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.limit) params.set('limit', options.limit);
    const q = params.toString() ? `?${params}` : '';
    const res = await api(`/api/family-events${q}`);
    return { events: res.events || [], ok: true };
  } catch {
    return { events: [], ok: false };
  }
}

export async function createFamilyEvent(data) {
  try {
    const res = await api('/api/family-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { event: res.event, ok: true };
  } catch {
    return { event: null, ok: false };
  }
}

export async function updateFamilyEvent(id, data) {
  try {
    const res = await api(`/api/family-events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { event: res.event, ok: true };
  } catch {
    return { event: null, ok: false };
  }
}

export async function deleteFamilyEvent(id) {
  try {
    await api(`/api/family-events/${id}`, { method: 'DELETE' });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
