/**
 * Express app Family Hart
 */
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { db } from './database/db.js';
import { createRateLimit } from './middleware/rateLimit.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sanitizeBody } from './middleware/inputGuard.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(requestLogger);
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin non consentita'));
  },
  credentials: true,
}));
app.use(express.json({ limit: config.security.jsonLimit }));
app.use(sanitizeBody);
app.use(createRateLimit({ windowMs: config.security.apiRateWindowMs, max: config.security.apiRateMax }));

// Browser su URL backend: reindirizza al frontend (l'app React è su un altro servizio / dominio)
app.get('/', (req, res) => {
  const appUrl = config.clientUrl || '';
  if (appUrl.startsWith('http')) {
    return res.redirect(302, appUrl);
  }
  res.type('html').send(`<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Family Hart API</title></head><body style="font-family:system-ui,sans-serif;max-width:36rem;margin:2rem auto;padding:0 1rem;">
<h1>Family Hart API</h1>
<p>Questo è il server API. L’interfaccia web va aperta sull’URL del frontend (es. Vite su Railway).</p>
<p><a href="/health">GET /health</a> · <a href="/api/health">GET /api/health</a></p>
</body></html>`);
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'family-hart-api', uptimeSec: Math.floor(process.uptime()) });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'family-hart-api', uptimeSec: Math.floor(process.uptime()) });
});

if (config.env === 'development') {
  app.get('/debug/users', (req, res) => {
    const rows = db.prepare(
      'SELECT id, email, name, role_type, family_id, beta_access_status, created_at FROM users ORDER BY created_at',
    ).all();
    res.json(rows);
  });
}

app.use('/api', routes);

app.use(errorHandler);

export default app;
