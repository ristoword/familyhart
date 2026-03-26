/**
 * Chat API - Backend reale
 */
import { api } from './client.js';

/**
 * Conversazioni (oggetto { family: [...], "2": [...], ... })
 * GET /api/conversations
 */
export async function getConversations() {
  const data = await api('/api/conversations');
  return { conversations: data.conversations || {} };
}

/**
 * Messaggi conversazione
 * GET /api/conversations/:id/messages
 */
export async function getMessages(conversationId) {
  const data = await api(`/api/conversations/${conversationId}/messages`);
  return { messages: data.messages || [] };
}

/**
 * Invia messaggio
 * POST /api/conversations/:id/messages
 */
export async function sendMessage(conversationId, text) {
  return api(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
