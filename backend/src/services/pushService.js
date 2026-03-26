/**
 * Web Push service
 */
import webpush from 'web-push';
import { config } from '../config/index.js';
import * as pushRepo from '../repositories/pushSubscriptionRepository.js';

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  if (!config.push.publicKey || !config.push.privateKey) return false;
  webpush.setVapidDetails(config.push.subject, config.push.publicKey, config.push.privateKey);
  configured = true;
  return true;
}

export function getPublicKey() {
  return config.push.publicKey || '';
}

export function subscribe(familyId, userId, subscription, userAgent) {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return false;
  pushRepo.upsertSubscription({ familyId, userId, endpoint, p256dh, auth, userAgent });
  return true;
}

export function unsubscribe(familyId, endpoint) {
  if (!endpoint) return false;
  pushRepo.removeSubscription({ familyId, endpoint });
  return true;
}

export async function sendToFamily(familyId, payload) {
  if (!ensureConfigured()) return { ok: false, reason: 'push_not_configured' };
  const subs = pushRepo.getFamilySubscriptions(familyId);
  await Promise.all(
    subs.map(async (s) => {
      const sub = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      };
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch {
        // subscription invalid/expired -> best effort cleanup
        pushRepo.removeSubscription({ familyId, endpoint: s.endpoint });
      }
    })
  );
  return { ok: true };
}

