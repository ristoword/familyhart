/**
 * Appointments API - backend reale con fallback
 */
import { api } from './client.js';

export async function getAppointments(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.limit) params.set('limit', options.limit);
    const q = params.toString() ? `?${params}` : '';
    const res = await api(`/api/appointments${q}`);
    return { appointments: res.appointments || [], ok: true };
  } catch {
    return { appointments: [], ok: false };
  }
}

export async function createAppointment(data) {
  try {
    const res = await api('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { appointment: res.appointment, ok: true };
  } catch {
    return { appointment: null, ok: false };
  }
}

export async function updateAppointment(id, data) {
  try {
    const res = await api(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { appointment: res.appointment, ok: true };
  } catch {
    return { appointment: null, ok: false };
  }
}

export async function deleteAppointment(id) {
  try {
    await api(`/api/appointments/${id}`, { method: 'DELETE' });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
