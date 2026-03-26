/**
 * Chat - Chat famiglia e privata
 * Legge da stato centrale, persistenza localStorage
 * TODO: WebSocket per messaggi real-time da backend
 */

import { useState, useRef, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import { QUICK_MESSAGES, CALL_TYPE } from '../data/constants';
import './Chat.css';

export default function Chat() {
  const {
    family,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
    sendMessage,
    user,
    startCall,
  } = useApp();

  const handleCall = (type) => {
    if (activeConversationId === 'family') {
      startCall({ type, targetId: 'family', targetName: 'Famiglia', isGroup: true }, family.members || []);
    } else {
      const member = family.members?.find((m) => m.id === activeConversationId);
      if (member) startCall({ type, targetId: member.id, targetName: `${member.name} ${member.surname || ''}`.trim() });
    }
  };
  const [inputValue, setInputValue] = useState('');
  const [showQuick, setShowQuick] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeConversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    sendMessage(activeConversationId, text);
  };

  const handleQuickMessage = (text) => {
    sendMessage(activeConversationId, text);
    setShowQuick(false);
  };

  const getMemberAvatar = (memberId) => {
    const member = family.members.find((m) => m.id === memberId);
    return member?.avatar || '👤';
  };

  const sortedMessages = [...(activeMessages || [])].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const conversationLabel =
    activeConversationId === 'family'
      ? 'Famiglia'
      : family.members.find((m) => m.id === activeConversationId)?.name || 'Chat';

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-title">
          <h1>{conversationLabel}</h1>
          <select
            className="chat-conversation-select"
            value={activeConversationId}
            onChange={(e) => setActiveConversationId(e.target.value)}
          >
            <option value="family">Famiglia</option>
            {family.members
              .filter((m) => m.id !== user?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
        <div className="chat-header-actions">
          <button type="button" className="icon-btn" title="Chiamata audio" onClick={() => handleCall(CALL_TYPE.AUDIO)}>
            📞
          </button>
          <button type="button" className="icon-btn" title="Videochiamata" onClick={() => handleCall(CALL_TYPE.VIDEO)}>
            📹
          </button>
        </div>
      </header>

      <div className="chat-messages">
        {sortedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.isOwn ? 'own' : 'other'}`}
          >
            {!msg.isOwn && (
              <span className="msg-avatar">{getMemberAvatar(msg.memberId)}</span>
            )}
            <div className="msg-bubble">
              {!msg.isOwn && <span className="msg-sender">{msg.memberName}</span>}
              <p>{msg.text}</p>
              <span className="msg-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-quick-bar">
        <button
          type="button"
          className={`quick-toggle ${showQuick ? 'active' : ''}`}
          onClick={() => setShowQuick(!showQuick)}
          title="Messaggi rapidi"
        >
          ⚡
        </button>
        {showQuick && (
          <div className="quick-messages">
            {QUICK_MESSAGES.map((qm) => (
              <button
                key={qm.id}
                type="button"
                className="quick-msg-btn"
                onClick={() => handleQuickMessage(qm.text)}
              >
                {qm.icon} {qm.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <button type="button" className="icon-btn" title="Messaggio vocale">
          🎤
        </button>
        <input
          type="text"
          placeholder="Scrivi un messaggio..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
          ➤
        </button>
      </form>

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
