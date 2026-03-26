/**
 * Configurazione backend Family Hart
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
if (process.env.NODE_ENV === 'staging') {
  dotenv.config({ path: path.join(__dirname, '../../.env.staging'), override: true });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env.production'), override: true });
}

const parseList = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  corsOrigins: parseList(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  jwt: {
    secret: process.env.JWT_SECRET || 'familyhart-dev-secret-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    path: process.env.DATABASE_PATH || './data/familyhart.db',
  },
  security: {
    jsonLimit: process.env.JSON_LIMIT || '256kb',
    authRateWindowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS || '60000', 10),
    authRateMax: parseInt(process.env.AUTH_RATE_MAX || '15', 10),
    loginRateWindowMs: parseInt(process.env.LOGIN_RATE_WINDOW_MS || '900000', 10),
    loginRateMax: parseInt(process.env.LOGIN_RATE_MAX || '12', 10),
    activateRateWindowMs: parseInt(process.env.ACTIVATE_RATE_WINDOW_MS || '3600000', 10),
    activateRateMax: parseInt(process.env.ACTIVATE_RATE_MAX || '20', 10),
    apiRateWindowMs: parseInt(process.env.API_RATE_WINDOW_MS || '60000', 10),
    apiRateMax: parseInt(process.env.API_RATE_MAX || '300', 10),
    pushSubscribeRateWindowMs: parseInt(process.env.PUSH_SUBSCRIBE_RATE_WINDOW_MS || '60000', 10),
    pushSubscribeRateMax: parseInt(process.env.PUSH_SUBSCRIBE_RATE_MAX || '25', 10),
    chatWriteRateWindowMs: parseInt(process.env.CHAT_WRITE_RATE_WINDOW_MS || '60000', 10),
    chatWriteRateMax: parseInt(process.env.CHAT_WRITE_RATE_MAX || '80', 10),
    sosHttpRateWindowMs: parseInt(process.env.SOS_HTTP_RATE_WINDOW_MS || '60000', 10),
    sosHttpRateMax: parseInt(process.env.SOS_HTTP_RATE_MAX || '15', 10),
  },
  beta: {
    required: process.env.BETA_ACCESS_REQUIRED === 'true',
    emailAllowlist: parseList(process.env.BETA_EMAIL_ALLOWLIST || '').map((e) => e.toLowerCase()),
  },
  push: {
    publicKey: process.env.PUSH_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.PUSH_VAPID_PRIVATE_KEY || '',
    subject: process.env.PUSH_VAPID_SUBJECT || 'mailto:dev@familyhart.local',
  },
};
