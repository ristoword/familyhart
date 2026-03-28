/**
 * Family Hart Backend - Entry point
 * Express + Socket.io
 */
import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { initSocket } from './realtime/socket.js';

const server = http.createServer(app);
initSocket(server);

// Dev: solo loopback, log http://localhost:PORT. Produzione/staging: 0.0.0.0 (Railway, Docker).
const hasHostEnv = process.env.HOST !== undefined && String(process.env.HOST).trim() !== '';
const bindHost = hasHostEnv
  ? process.env.HOST.trim()
  : config.env === 'development'
    ? '127.0.0.1'
    : '0.0.0.0';

server.listen(config.port, bindHost, () => {
  const env = config.env || 'development';
  if (config.env === 'development') {
    console.log(`Family Hart API [${env}] http://localhost:${config.port}`);
  } else {
    console.log(`Family Hart API [${env}] in ascolto sulla porta ${config.port}`);
  }
  console.log('Socket.io: realtime attivo');
  console.log('Health: GET /health');
  console.log('Auth:  POST /api/auth/login, GET /api/auth/me');
});
