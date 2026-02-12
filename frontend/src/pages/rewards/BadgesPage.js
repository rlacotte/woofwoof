import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const ALL_BADGES = [
  {
    id: 'first_walk',
    name: 'Première Balade',
    description: 'Enregistrez votre première promenade',
    icon: '🚶',
    earned: true,
    earned_at: '2026-01-15',
    category: 'Débuts',
    points: 50,
  },
  {
    id: 'social_butterfly',
    name: 'Papillon Social',
    description: 'Publiez 10 photos sur WoofSocial',
    icon: '📸',
    earned: true,
    earned_at: '2026-02-01',
    category: 'Social',
    points: 100,
  },
  {
    id: 'health_conscious',
    name: 'Santé d\'abord',
    description: 'Complétez votre carnet de santé',
    icon: '🏥',
    earned: true,
    earned_at: '2026-01-20',
    category: 'Santé',
    points: 75,
  },
  {
    id: 'trainer',
    name: 'Éducateur',
    description: 'Terminez 3 programmes d\'entraînement',
    icon: '🎓',
    earned: false,
    progress: 1,
    total: 3,
    category: 'Éducation',
    points: 150,
  },
  {
    id: 'marathon',
    name: 'Marathon Canin',
    description: 'Marchez 100km au total',
    icon: '🏃',
    earned: false,
    progress: 47,
    total: 100,
    category: 'Sport',
    points: 200,
  },
  {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Balade avant 7h du matin pendant 7 jours',
    icon: '🌅',
    earned: true,
    earned_at: '2026-01-25',
    category: 'Habitudes',
    points: 100,
  },
  {
    id: 'night_owl',
    name: 'Oiseau de nuit',
    description: 'Balade après 22h pendant 5 jours',
    icon: '🌙',
    earned: false,
    category: 'Habitudes',
    points: 75,
  },
  {
    id: 'week_streak',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs d\'activité',
    icon: '🔥',
    earned: true,
    earned_at: '2026-02-10',
    category: 'Engagement',
    points: 120,
  },
  {
    id: 'month_streak',
    name: 'Mois Parfait',
    description: '30 jours consécutifs d\'activité',
    icon: '💯',
    earned: false,
    progress: 12,
    total: 30,
    category: 'Engagement',
    points: 300,
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Visitez 20 nouveaux lieux de promenade',
    icon: '🗺️',
    earned: false,
    progress: 8,
    total: 20,
    category: 'Exploration',
    points: 150,
  },
  {
    id: 'matchmaker',
    name: 'Entremetteur',
    description: 'Obtenez 10 matchs sur WoofMatch',
    icon: '💕',
    earned: true,
    earned_at: '2026-01-30',
    category: 'Social',
    points: 100,
  },
  {
    id: 'influencer',
    name: 'Influenceur',
    description: 'Atteignez 100 abonnés',
    icon: '⭐',
    earned: false,
    progress: 45,
    total: 100,
    category: 'Social',
    points: 250,
  },
];

export default function BadgesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // all | earned | locked
  const [badges, setBadges] = useState(ALL_BADGES);

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);
  const totalPoints = earnedBadges.reduce((sum, b) => sum + b.points, 0);

  const getFilteredBadges = () => {
    if (activeTab === 'earned') return earnedBadges;
    if (activeTab === 'locked') return lockedBadges;
    return badges;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rewards-page">
      <SubAppHeader
        title="Mes Badges"
        icon="🏆"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/rewards')}
      />

      <div className="badges-summary">
        <div className="badges-summary-item">
          <div className="badges-summary-value">{earnedBadges.length}/{badges.length}</div>
          <div className="badges-summary-label">Badges débloqués</div>
        </div>
        <div className="badges-summary-item">
          <div className="badges-summary-value">{totalPoints}</div>
          <div className="badges-summary-label">Points gagnés</div>
        </div>
      </div>

      <div className="badges-tabs">
        <button
          className={`badges-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tous ({badges.length})
        </button>
        <button
          className={`badges-tab ${activeTab === 'earned' ? 'active' : ''}`}
          onClick={() => setActiveTab('earned')}
        >
          Débloqués ({earnedBadges.length})
        </button>
        <button
          className={`badges-tab ${activeTab === 'locked' ? 'active' : ''}`}
          onClick={() => setActiveTab('locked')}
        >
          Verrouillés ({lockedBadges.length})
        </button>
      </div>

      <div className="badges-grid">
        {getFilteredBadges().map((badge) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
          >
            <div className="badge-icon-container">
              <div className="badge-icon">{badge.icon}</div>
              {badge.earned && <div className="badge-checkmark">✓</div>}
            </div>

            <div className="badge-info">
              <div className="badge-name">{badge.name}</div>
              <div className="badge-description">{badge.description}</div>

              {badge.earned ? (
                <div className="badge-earned-info">
                  <span className="badge-points">+{badge.points} pts</span>
                  <span className="badge-date">{formatDate(badge.earned_at)}</span>
                </div>
              ) : (
                <>
                  {badge.progress !== undefined && (
                    <div className="badge-progress">
                      <div className="badge-progress-bar">
                        <div
                          className="badge-progress-fill"
                          style={{
                            width: `${(badge.progress / badge.total) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="badge-progress-text">
                        {badge.progress}/{badge.total}
                      </div>
                    </div>
                  )}
                  <div className="badge-locked-points">🔒 {badge.points} pts</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
