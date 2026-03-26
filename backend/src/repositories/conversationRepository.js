/**
 * Repository conversazioni e messaggi
 */
import { db } from '../database/db.js';

export function getConversationsByFamilyId(familyId) {
  return db.prepare(`
    SELECT id, type, created_at AS createdAt
    FROM conversations
    WHERE family_id = ?
    ORDER BY created_at DESC
  `).all(familyId);
}

export function getOrCreateFamilyConversation(familyId) {
  let conv = db.prepare('SELECT id FROM conversations WHERE family_id = ? AND type = ?').get(familyId, 'family');
  if (!conv) {
    db.prepare('INSERT INTO conversations (id, family_id, type) VALUES (?, ?, ?)').run('family', familyId, 'family');
    conv = { id: 'family' };
  }
  return conv.id;
}

export function getOrCreateConversation(conversationId, familyId) {
  let conv = db.prepare('SELECT id FROM conversations WHERE id = ? AND family_id = ?').get(conversationId, familyId);
  if (!conv) {
    db.prepare('INSERT INTO conversations (id, family_id, type) VALUES (?, ?, ?)').run(conversationId, familyId, 'private');
    conv = { id: conversationId };
  }
  return conv.id;
}

export function getMessagesByConversationId(conversationId, familyId) {
  const rows = db.prepare(`
    SELECT m.id, m.conversation_id AS conversationId, m.member_id AS memberId, m.text, m.created_at AS createdAt
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id AND c.family_id = ?
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `).all(familyId, conversationId);

  const memberNames = {};
  const memberIds = [...new Set(rows.map((r) => r.memberId))];
  if (memberIds.length) {
    const members = db.prepare('SELECT id, name FROM family_members WHERE id IN (' + memberIds.map(() => '?').join(',') + ')').all(...memberIds);
    members.forEach((m) => { memberNames[m.id] = m.name; });
  }

  return rows.map((r) => ({
    ...r,
    memberName: memberNames[r.memberId] || 'Utente',
    time: formatTime(r.createdAt),
    timestamp: r.createdAt * 1000,
    isOwn: false,
    conversationId: r.conversationId,
  }));
}

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export function insertMessage(conversationId, memberId, text, familyId) {
  const id = `m${Date.now()}`;
  db.prepare(`
    INSERT INTO messages (id, conversation_id, member_id, text)
    SELECT ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM conversations WHERE id = ? AND family_id = ?)
  `).run(id, conversationId, memberId, text, conversationId, familyId);
  const member = db.prepare('SELECT name FROM family_members WHERE id = ?').get(memberId);
  return {
    id,
    conversationId,
    memberId,
    memberName: member?.name || 'Utente',
    text,
    time: formatTime(Math.floor(Date.now() / 1000)),
    timestamp: Date.now(),
    isOwn: false,
  };
}
