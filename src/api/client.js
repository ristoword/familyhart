/**
 * Client API - chiamate backend con fallback
 * Con proxy Vite (dev): '' = same origin, /api -> localhost:3001
 * Build: usare VITE_API_URL se backend su altro host
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getToken() {
  try {
    const s = localStorage.getItem('familyhart_session');
    const data = s ? JSON.parse(s) : null;
    return data?.token || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    const s = localStorage.getItem('familyhart_session');
    const data = s ? JSON.parse(s) : {};
    data.token = token;
    localStorage.setItem('familyhart_session', JSON.stringify(data));
  } catch {
    //
  }
}

export function clearToken() {
  try {
    const s = localStorage.getItem('familyhart_session');
    const data = s ? JSON.parse(s) : {};
    delete data.token;
    localStorage.setItem('familyhart_session', JSON.stringify(data));
  } catch {
    //
  }
}

/**
 * Fetch con auth e gestione errori
 */
export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || res.statusText || 'Errore richiesta');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      err.offline = true;
    }
    throw err;
  }
}

export function isBackendAvailable() {
  const url = API_BASE ? `${API_BASE}/health` : '/api/health';
  return fetch(url).then((r) => r.ok).catch(() => false);
}
