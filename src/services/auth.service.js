/**
 * Auth Service - Autenticazione utenti
 * Collega: Login, Profilo, protezione route
 *
 * Attualmente: login gestito in store/AppContext con credenziali da data/constants
 * TODO: Integrare con backend - sostituire login() in AppContext con chiamata a authService.login()
 *       che farà POST /api/auth/login e restituirà user + token
 * - login(email, password)
 * - signUp(email, password, name)
 * - logout()
 * - getCurrentUser()
 * - resetPassword()
 * - loginWithApple / loginWithGoogle
 */

import { currentUser } from '../data';

/**
 * Login con email e password
 * @returns {Promise<{user: object, token: string}>} - Utente e token di sessione
 */
// eslint-disable-next-line no-unused-vars
export async function login(email, password) {
  // TODO: POST /api/auth/login
  // Per ora ritorna mock
  return { user: currentUser, token: 'mock-token' };
}

/**
 * Registrazione nuova famiglia
 * @returns {Promise<{user: object}>}
 */
// eslint-disable-next-line no-unused-vars
export async function createFamily(userData) {
  // TODO: POST /api/families
  return { user: currentUser };
}

/**
 * Logout e pulizia sessione
 */
export async function logout() {
  // TODO: invalidare token, clear storage
}

/**
 * Utente attualmente autenticato
 * @returns {object|null}
 */
export function getCurrentUser() {
  // TODO: da token/session storage o context
  return currentUser;
}

/**
 * Verifica se l'utente è autenticato
 */
export function isAuthenticated() {
  return !!getCurrentUser();
}
