/**
 * Chat Service - Messaggistica famiglia
 *
 * Stato attuale: gestito da AppContext + localStorage.
 * Le pagine usano useApp() per sendMessage, conversations, activeMessages.
 *
 * TODO Backend Realtime:
 * - WebSocket: ws://api/messages → onmessage aggiorna conversations
 * - POST /api/chat/messages { conversationId, text } → broadcast a membri
 * - GET /api/chat/conversations/:id → cronologia paginata
 * - Firebase/Supabase: subscribe to messages collection
 */

import { loadChat, saveChat } from '../utils/storage';

/**
 * Carica conversazioni da storage (fallback per init)
 * @returns {Object} { family: [...], 'memberId': [...] }
 */
export function loadConversations() {
  return loadChat();
}

/**
 * Salva conversazioni (usato da AppContext)
 * @param {Object} conversations
 */
export function persistConversations(conversations) {
  saveChat(conversations);
}
