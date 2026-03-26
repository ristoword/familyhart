/**
 * Gestione errori centralizzata
 */
import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';

  if (config.env === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env === 'development' && err.stack && { stack: err.stack }),
  });
}
