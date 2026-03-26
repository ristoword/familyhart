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

const host = process.env.HOST || '0.0.0.0';
server.listen(config.port, host, () => {
  const env = config.env || 'development';
  console.log(`Family Hart API [${env}] http://${host}:${config.port}`);
  console.log('Socket.io: realtime attivo');
  console.log('Health: GET /health');
  console.log('Auth:  POST /api/auth/login, GET /api/auth/me');
});
