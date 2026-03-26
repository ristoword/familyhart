/**
 * Push service lato frontend
 */
import * as pushApi from '../api/push.api.js';

function base64UrlToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function ensurePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const existing = await registration.pushManager.getSubscription();
    if (existing) return { ok: true, existing: true };

    const keyRes = await pushApi.getPushPublicKey();
    if (!keyRes.ok || !keyRes.publicKey) return { ok: false, reason: 'missing_key' };

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(keyRes.publicKey),
    });
    const saveRes = await pushApi.subscribePush(sub);
    return { ok: saveRes.ok, existing: false };
  } catch {
    return { ok: false, reason: 'register_failed' };
  }
}

