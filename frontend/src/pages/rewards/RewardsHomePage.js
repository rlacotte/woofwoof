import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const VIP_LEVELS = [
  { level: 'bronze', name: 'Bronze', min: 0, max: 999, color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #b87333)' },
  { level: 'silver', name: 'Argent', min: 1000, max: 4999, color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  { level: 'gold', name: 'Or', min: 5000, max: 14999, color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)' },
  { level: 'platinum', name: 'Platine', min: 15000, max: Infinity, color: '#e5e4e2', gradient: 'linear-gradient(135deg, #e5e4e2, #d4d4d4)' },
];

export default function RewardsHomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    points: 2450,
    level: 'silver',
    streak_days: 7,
    badges_count: 12,
    rank: 156,
    total_users: 5420,
  });

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real API
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    return VIP_LEVELS.find(
      (l) => userData.points >= l.min && userData.points <= l.max
    ) || VIP_LEVELS[0];
  };

  const getNextLevel = () => {
    const current = getCurrentLevel();
    const currentIndex = VIP_LEVELS.findIndex((l) => l.level === current.level);
    return VIP_LEVELS[currentIndex + 1] || null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel
    ? ((userData.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <div className="rewards-page">
      <SubAppHeader
        title="WoofRewards"
        icon="🎁"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
      />

      {loading ? (
        <div className="rewards-loading">
          <div className="rewards-loading-spinner">🎁</div>
          <p>Chargement...</p>
        </div>
      ) : (
        <div className="rewards-content">
          {/* VIP Level Card */}
          <div className="rewards-level-card" style={{ background: currentLevel.gradient }}>
            <div className="rewards-level-header">
              <div className="rewards-level-badge">
                <span className="rewards-level-icon">
                  {currentLevel.level === 'bronze' && '🥉'}
                  {currentLevel.level === 'silver' && '🥈'}
                  {currentLevel.level === 'gold' && '🥇'}
                  {currentLevel.level === 'platinum' && '💎'}
                </span>
                <span className="rewards-level-name">{currentLevel.name}</span>
              </div>
              <div className="rewards-points-display">
                <span className="rewards-points-value">{userData.points.toLocaleString()}</span>
                <span className="rewards-points-label">points</span>
              </div>
            </div>

            {nextLevel && (
              <div className="rewards-level-progress">
                <div className="rewards-progress-bar">
                  <div
                    className="rewards-progress-fill"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <div className="rewards-progress-text">
                  {nextLevel.min - userData.points} points pour {nextLevel.name}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rewards-stats-grid">
            <div className="rewards-stat-card" onClick={() => navigate('/rewards/badges')}>
              <div className="rewards-stat-icon">🏆</div>
              <div className="rewards-stat-value">{userData.badges_count}</div>
              <div className="rewards-stat-label">Badges</div>
            </div>

            <div className="rewards-stat-card">
              <div className="rewards-stat-icon">🔥</div>
              <div className="rewards-stat-value">{userData.streak_days}</div>
              <div className="rewards-stat-label">Jours consécutifs</div>
            </div>

            <div className="rewards-stat-card" onClick={() => navigate('/rewards/leaderboard')}>
              <div className="rewards-stat-icon">📊</div>
              <div className="rewards-stat-value">#{userData.rank}</div>
              <div className="rewards-stat-label">Classement</div>
            </div>

            <div className="rewards-stat-card" onClick={() => navigate('/rewards/challenges')}>
              <div className="rewards-stat-icon">⚡</div>
              <div className="rewards-stat-value">3</div>
              <div className="rewards-stat-label">Défis actifs</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rewards-actions-section">
            <h3 className="rewards-section-title">Gagner des points</h3>
            <div className="rewards-actions-list">
              <div className="rewards-action-card" onClick={() => navigate('/social/create')}>
                <div className="rewards-action-icon">📸</div>
                <div className="rewards-action-info">
                  <div className="rewards-action-title">Publier une photo</div>
                  <div className="rewards-action-desc">Partagez un moment avec votre chien</div>
                </div>
                <div className="rewards-action-points">+50</div>
              </div>

              <div className="rewards-action-card" onClick={() => navigate('/walk/track')}>
                <div className="rewards-action-icon">🚶</div>
                <div className="rewards-action-info">
                  <div className="rewards-action-title">Enregistrer une balade</div>
                  <div className="rewards-action-desc">Suivez votre promenade quotidienne</div>
                </div>
                <div className="rewards-action-points">+30</div>
              </div>

              <div className="rewards-action-card" onClick={() => navigate('/health/vaccinations')}>
                <div className="rewards-action-icon">💉</div>
                <div className="rewards-action-info">
                  <div className="rewards-action-title">Mettre à jour le carnet</div>
                  <div className="rewards-action-desc">Gardez le suivi santé à jour</div>
                </div>
                <div className="rewards-action-points">+20</div>
              </div>

              <div className="rewards-action-card" onClick={() => navigate('/train/progress')}>
                <div className="rewards-action-icon">🎓</div>
                <div className="rewards-action-info">
                  <div className="rewards-action-title">Compléter un entraînement</div>
                  <div className="rewards-action-desc">Progressez dans un programme</div>
                </div>
                <div className="rewards-action-points">+40</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="rewards-benefits-section">
            <h3 className="rewards-section-title">Avantages {currentLevel.name}</h3>
            <div className="rewards-benefits-list">
              <div className="rewards-benefit-item">
                <span className="rewards-benefit-icon">✅</span>
                <span className="rewards-benefit-text">
                  {currentLevel.level === 'bronze' && '5% de réduction chez nos partenaires'}
                  {currentLevel.level === 'silver' && '10% de réduction chez nos partenaires'}
                  {currentLevel.level === 'gold' && '15% de réduction chez nos partenaires'}
                  {currentLevel.level === 'platinum' && '20% de réduction chez nos partenaires'}
                </span>
              </div>
              {currentLevel.level !== 'bronze' && (
                <div className="rewards-benefit-item">
                  <span className="rewards-benefit-icon">✅</span>
                  <span className="rewards-benefit-text">Accès prioritaire aux nouveaux services</span>
                </div>
              )}
              {(currentLevel.level === 'gold' || currentLevel.level === 'platinum') && (
                <div className="rewards-benefit-item">
                  <span className="rewards-benefit-icon">✅</span>
                  <span className="rewards-benefit-text">Badge exclusif sur votre profil</span>
                </div>
              )}
              {currentLevel.level === 'platinum' && (
                <div className="rewards-benefit-item">
                  <span className="rewards-benefit-icon">✅</span>
                  <span className="rewards-benefit-text">Support client prioritaire 24/7</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="rewards-nav-grid">
            <div
              className="rewards-nav-card"
              onClick={() => navigate('/rewards/badges')}
            >
              <div className="rewards-nav-icon">🏆</div>
              <div className="rewards-nav-title">Mes Badges</div>
            </div>

            <div
              className="rewards-nav-card"
              onClick={() => navigate('/rewards/challenges')}
            >
              <div className="rewards-nav-icon">⚡</div>
              <div className="rewards-nav-title">Défis</div>
            </div>

            <div
              className="rewards-nav-card"
              onClick={() => navigate('/rewards/leaderboard')}
            >
              <div className="rewards-nav-icon">📊</div>
              <div className="rewards-nav-title">Classement</div>
            </div>

            <div
              className="rewards-nav-card"
              onClick={() => navigate('/rewards/shop')}
            >
              <div className="rewards-nav-icon">🛍️</div>
              <div className="rewards-nav-title">Boutique</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
