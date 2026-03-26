/**
 * Errori applicazione
 */

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accesso negato', code) {
    super(message, 403);
    this.name = 'ForbiddenError';
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Non trovato') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
