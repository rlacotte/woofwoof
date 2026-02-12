import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function ChatPage({ user }) {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();
  const pollRef = useRef(null);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    try {
      const data = await api.getMessages(parseInt(matchId));
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput('');

    try {
      const msg = await api.sendMessage(parseInt(matchId), text);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error(err);
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  let lastDate = '';

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/matches')}>
          ←
        </button>
        <div className="chat-header-info">
          <strong>Conversation</strong>
          <span className="chat-header-status">En ligne</span>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="empty-state" style={{ height: 'auto' }}>
            <div className="loading-logo" style={{ fontSize: 36 }}>🐾</div>
            <p>{t('detail.loading')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state" style={{ height: 'auto', padding: '40px 24px' }}>
            <div className="empty-state-icon">👋</div>
            <h2>{t('chat.empty')}</h2>
            <p>Commencez la conversation pour organiser une rencontre entre vos chiens.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const msgDate = formatDate(msg.created_at);
            let showDate = false;
            if (msgDate !== lastDate) {
              lastDate = msgDate;
              showDate = true;
            }
            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="chat-date-separator">
                    <span>{msgDate}</span>
                  </div>
                )}
                <div
                  className={`chat-bubble ${msg.sender_id === user.id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}
                >
                  {msg.content}
                  <div className="chat-bubble-time">
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          autoFocus
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}
