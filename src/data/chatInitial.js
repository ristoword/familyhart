/**
 * Dati iniziali chat - usati al primo avvio o quando non c'è persistenza
 */

import { chatMessages } from './mock/chat';

export function getInitialConversations() {
  const base = Date.now() - 3600000;
  const familyMessages = chatMessages.map((m, i) => ({
    ...m,
    timestamp: base + i * 120000,
    conversationId: 'family',
  }));

  return {
    family: familyMessages,
  };
}
