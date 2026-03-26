/**
 * Sanitizzazione e limiti base input JSON
 */
import { ValidationError } from '../utils/errors.js';

function cleanString(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') obj[key] = cleanString(val);
    else if (Array.isArray(val)) obj[key] = val.map((x) => (typeof x === 'string' ? cleanString(x) : x));
    else if (val && typeof val === 'object') sanitizeObject(val);
  }
  return obj;
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') sanitizeObject(req.body);
  next();
}

export function requireBodyKeys(...keys) {
  return (req, res, next) => {
    const missing = keys.filter((k) => req.body?.[k] == null || req.body?.[k] === '');
    if (missing.length) return next(new ValidationError(`Campi richiesti: ${missing.join(', ')}`));
    return next();
  };
}

