/**
 * Express app Family Hart
 */
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { config } from './config/index.js';
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

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'family-hart-api', uptimeSec: Math.floor(process.uptime()) });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'family-hart-api', uptimeSec: Math.floor(process.uptime()) });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
