/**
 * Rate limiter in-memory (base)
 */
import { config } from '../config/index.js';

const buckets = new Map();

export function createRateLimit({ windowMs = 60_000, max = 120 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl || ''}:${req.path || ''}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({
        success: false,
        error: 'Troppe richieste, riprova tra poco',
        ...(config.env === 'development' ? { retryAfterMs: current.expiresAt - now } : {}),
      });
    }
    return next();
  };
}

