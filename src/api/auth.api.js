/**
 * Auth API - Backend reale
 */
import { api, setToken, clearToken } from './client.js';

/**
 * Login
 * POST /api/auth/login
 */
export async function login(email, password) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

/**
 * Attivazione beta privata tramite codice invito
 * POST /api/auth/activate-beta
 */
export async function activateBeta(email, password, inviteCode) {
  const data = await api('/api/auth/activate-beta', {
    method: 'POST',
    body: JSON.stringify({ email, password, inviteCode }),
  });
  if (data.token) setToken(data.token);
  return data;
}

/**
 * Logout
 * POST /api/auth/logout
 */
export async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

/**
 * Utente corrente
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  return api('/api/auth/me');
}
