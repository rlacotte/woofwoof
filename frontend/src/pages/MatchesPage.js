import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export default function MatchesPage({ user, dogs }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const myDogIds = dogs.map((d) => d.id);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getOtherDog(match) {
    if (myDogIds.includes(match.dog_1.id)) return match.dog_2;
    return match.dog_1;
  }

  return (
    <div className="matches-page">
      <div className="page-header">
        <h1>{t('matches.title')}</h1>
        {matches.length > 0 && (
          <span className="matches-count">{matches.length}</span>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-logo" style={{ fontSize: 48 }}>🐾</div>
          <p>{t('detail.loading')}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💝</div>
          <h2>{t('matches.empty')}</h2>
          <p>{t('matches.emptySub')}</p>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((match) => {
            const otherDog = getOtherDog(match);
            return (
              <div
                key={match.id}
                className="match-card"
                onClick={() => navigate(`/chat/${match.id}`)}
              >
                <div className="match-card-avatar-wrap">
                  {otherDog.photo_url_1 ? (
                    <img
                      className="match-card-avatar"
                      src={otherDog.photo_url_1}
                      alt={otherDog.name}
                    />
                  ) : (
                    <div className="match-card-avatar-placeholder">🐕</div>
                  )}
                  <span className="match-card-online" />
                </div>
                <div className="match-card-info">
                  <h3>{otherDog.name} <span className="match-card-sex">{otherDog.sex === 'male' ? '♂' : '♀'}</span></h3>
                  <p>{otherDog.breed} · {otherDog.age_years} an{otherDog.age_years > 1 ? 's' : ''}</p>
                </div>
                <div className="match-card-right">
                  <span className="match-card-time">{timeAgo(match.created_at)}</span>
                  <span className="match-card-arrow">›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
