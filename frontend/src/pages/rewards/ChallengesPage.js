import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';

const CHALLENGES = [
  {
    id: 1,
    name: 'Marathon de Février',
    description: 'Marchez 50km ce mois-ci',
    icon: '🏃',
    progress: 23,
    total: 50,
    unit: 'km',
    reward_points: 500,
    ends_at: '2026-02-28',
    active: true,
    difficulty: 'medium',
  },
  {
    id: 2,
    name: 'Social Star',
    description: 'Publiez 5 photos cette semaine',
    icon: '📸',
    progress: 3,
    total: 5,
    unit: 'photos',
    reward_points: 250,
    ends_at: '2026-02-16',
    active: true,
    difficulty: 'easy',
  },
  {
    id: 3,
    name: 'Éducateur Assidu',
    description: 'Complétez 10 étapes d\'entraînement',
    icon: '🎓',
    progress: 4,
    total: 10,
    unit: 'étapes',
    reward_points: 300,
    ends_at: '2026-02-20',
    active: true,
    difficulty: 'medium',
  },
  {
    id: 4,
    name: 'Super Santé',
    description: 'Ajoutez 3 entrées au carnet de santé',
    icon: '🏥',
    progress: 0,
    total: 3,
    unit: 'entrées',
    reward_points: 150,
    ends_at: '2026-02-25',
    active: false,
    difficulty: 'easy',
  },
  {
    id: 5,
    name: 'Explorateur',
    description: 'Visitez 5 nouveaux lieux de promenade',
    icon: '🗺️',
    progress: 0,
    total: 5,
    unit: 'lieux',
    reward_points: 400,
    ends_at: '2026-02-28',
    active: false,
    difficulty: 'hard',
  },
];

export default function ChallengesPage() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState(CHALLENGES);

  const activeChallenges = challenges.filter((c) => c.active);
  const availableChallenges = challenges.filter((c) => !c.active);

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { bg: 'rgba(86, 171, 47, 0.15)', color: '#56ab2f', label: 'Facile' };
      case 'medium':
        return { bg: 'rgba(245, 166, 35, 0.15)', color: '#f5a623', label: 'Moyen' };
      case 'hard':
        return { bg: 'rgba(255, 71, 87, 0.15)', color: '#ff4757', label: 'Difficile' };
      default:
        return { bg: 'rgba(160, 160, 160, 0.15)', color: '#a0a0a0', label: 'Normal' };
    }
  };

  const joinChallenge = (challengeId) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, active: true } : c))
    );
  };

  const abandonChallenge = (challengeId) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId ? { ...c, active: false, progress: 0 } : c
      )
    );
  };

  return (
    <div className="rewards-page">
      <SubAppHeader
        title="Défis"
        icon="⚡"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/rewards')}
      />

      <div className="challenges-content">
        {activeChallenges.length > 0 && (
          <div className="challenges-section">
            <h3 className="challenges-section-title">
              Défis en cours ({activeChallenges.length})
            </h3>
            <div className="challenges-list">
              {activeChallenges.map((challenge) => {
                const daysLeft = getDaysRemaining(challenge.ends_at);
                const progressPercent = (challenge.progress / challenge.total) * 100;
                const difficultyStyle = getDifficultyColor(challenge.difficulty);

                return (
                  <div key={challenge.id} className="challenge-card active">
                    <div className="challenge-header">
                      <div className="challenge-icon-bg">
                        <span className="challenge-icon">{challenge.icon}</span>
                      </div>
                      <div className="challenge-info">
                        <div className="challenge-name">{challenge.name}</div>
                        <div className="challenge-description">
                          {challenge.description}
                        </div>
                      </div>
                      <div
                        className="challenge-difficulty-badge"
                        style={{
                          background: difficultyStyle.bg,
                          color: difficultyStyle.color,
                        }}
                      >
                        {difficultyStyle.label}
                      </div>
                    </div>

                    <div className="challenge-progress-section">
                      <div className="challenge-progress-bar">
                        <div
                          className="challenge-progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="challenge-progress-text">
                        {challenge.progress}/{challenge.total} {challenge.unit}
                      </div>
                    </div>

                    <div className="challenge-footer">
                      <div className="challenge-reward">
                        🎁 +{challenge.reward_points} points
                      </div>
                      <div className="challenge-time-left">
                        ⏰ {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant
                        {daysLeft > 1 ? 's' : ''}
                      </div>
                    </div>

                    <button
                      className="challenge-abandon-btn"
                      onClick={() => abandonChallenge(challenge.id)}
                    >
                      Abandonner
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {availableChallenges.length > 0 && (
          <div className="challenges-section">
            <h3 className="challenges-section-title">
              Défis disponibles ({availableChallenges.length})
            </h3>
            <div className="challenges-list">
              {availableChallenges.map((challenge) => {
                const daysLeft = getDaysRemaining(challenge.ends_at);
                const difficultyStyle = getDifficultyColor(challenge.difficulty);

                return (
                  <div key={challenge.id} className="challenge-card">
                    <div className="challenge-header">
                      <div className="challenge-icon-bg">
                        <span className="challenge-icon">{challenge.icon}</span>
                      </div>
                      <div className="challenge-info">
                        <div className="challenge-name">{challenge.name}</div>
                        <div className="challenge-description">
                          {challenge.description}
                        </div>
                      </div>
                      <div
                        className="challenge-difficulty-badge"
                        style={{
                          background: difficultyStyle.bg,
                          color: difficultyStyle.color,
                        }}
                      >
                        {difficultyStyle.label}
                      </div>
                    </div>

                    <div className="challenge-details">
                      <div className="challenge-detail-item">
                        <span className="challenge-detail-label">Objectif:</span>
                        <span className="challenge-detail-value">
                          {challenge.total} {challenge.unit}
                        </span>
                      </div>
                      <div className="challenge-detail-item">
                        <span className="challenge-detail-label">Récompense:</span>
                        <span className="challenge-detail-value">
                          +{challenge.reward_points} pts
                        </span>
                      </div>
                      <div className="challenge-detail-item">
                        <span className="challenge-detail-label">Temps restant:</span>
                        <span className="challenge-detail-value">
                          {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      className="challenge-join-btn"
                      onClick={() => joinChallenge(challenge.id)}
                    >
                      Participer
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
