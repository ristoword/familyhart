/**
 * Controller chat
 */
import * as convRepo from '../repositories/conversationRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import * as pushService from '../services/pushService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export async function getConversations(req, res, next) {
  try {
    const familyId = req.user.familyId;
    const convs = convRepo.getConversationsByFamilyId(familyId);
    const members = familyRepo.getMembersByFamilyId(familyId);
    const result = { family: [] };
    const familyConv = convs.find((c) => c.id === 'family' || c.type === 'family');
    if (familyConv) {
      const msgs = convRepo.getMessagesByConversationId('family', familyId);
      result.family = msgs;
    }
    members.forEach((m) => {
      result[m.id] = convRepo.getMessagesByConversationId(m.id, familyId);
    });
    res.json({ success: true, conversations: result });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const familyId = req.user.familyId;
    const messages = convRepo.getMessagesByConversationId(conversationId, familyId);
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const { text } = req.body || {};
    if (!text?.trim()) throw new ValidationError('Testo messaggio richiesto');
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const members = familyRepo.getMembersByFamilyId(familyId);
    const member = members.find((m) => m.userId === userId) || members.find((m) => m.id === userId);
    const memberId = member?.id || userId;
    if (conversationId === 'family') {
      convRepo.getOrCreateFamilyConversation(familyId);
    } else {
      convRepo.getOrCreateConversation(conversationId, familyId);
    }
    const msg = convRepo.insertMessage(conversationId, memberId, text.trim(), familyId);
    if (msg) {
      msg.isOwn = true;
      pushService.sendToFamily(familyId, {
        type: 'chat',
        title: `Nuovo messaggio da ${member?.name || 'Membro'}`,
        body: text.trim().slice(0, 120),
      }).catch(() => {});
      res.status(201).json({ success: true, message: msg });
    } else {
      throw new NotFoundError('Conversazione non trovata');
    }
  } catch (err) {
    next(err);
  }
}
