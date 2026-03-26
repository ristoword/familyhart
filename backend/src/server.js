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

server.listen(config.port, () => {
  const env = config.env || 'development';
  console.log(`Family Hart API [${env}] http://localhost:${config.port}`);
  console.log('Socket.io: realtime attivo');
  console.log('Health: GET /health');
  console.log('Auth:  POST /api/auth/login, GET /api/auth/me');
});
