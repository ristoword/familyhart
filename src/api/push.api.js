/**
 * Push API
 */
import { api } from './client.js';

export async function getPushPublicKey() {
  try {
    const res = await api('/api/push/public-key');
    return { ok: true, publicKey: res.publicKey || '' };
  } catch {
    return { ok: false, publicKey: '' };
  }
}

export async function subscribePush(subscription) {
  try {
    await api('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function unsubscribePush(endpoint) {
  try {
    await api('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function sendPushTest() {
  try {
    const res = await api('/api/push/test', { method: 'POST' });
    return { ok: true, result: res.result || null };
  } catch {
    return { ok: false, result: null };
  }
}

