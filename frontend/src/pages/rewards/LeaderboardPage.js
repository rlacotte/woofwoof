import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Sophie M.', dog_name: 'Max', points: 15420, level: 'platinum', avatar: '👑' },
  { rank: 2, name: 'Pierre D.', dog_name: 'Luna', points: 12890, level: 'gold', avatar: '🥈' },
  { rank: 3, name: 'Marie L.', dog_name: 'Rex', points: 11340, level: 'gold', avatar: '🥉' },
  { rank: 4, name: 'Lucas R.', dog_name: 'Bella', points: 9870, level: 'gold', avatar: '👤' },
  { rank: 5, name: 'Emma B.', dog_name: 'Rocky', points: 8540, level: 'gold', avatar: '👤' },
  { rank: 6, name: 'Thomas V.', dog_name: 'Charlie', points: 7230, level: 'gold', avatar: '👤' },
  { rank: 7, name: 'Julie K.', dog_name: 'Daisy', points: 6890, level: 'gold', avatar: '👤' },
  { rank: 8, name: 'Marc P.', dog_name: 'Buddy', points: 6120, level: 'gold', avatar: '👤' },
  { rank: 9, name: 'Claire F.', dog_name: 'Milo', points: 5670, level: 'gold', avatar: '👤' },
  { rank: 10, name: 'Antoine S.', dog_name: 'Coco', points: 5340, level: 'gold', avatar: '👤' },
];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global'); // global | weekly | friends
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD_DATA);
  const [currentUser, setCurrentUser] = useState({
    rank: 156,
    name: 'Vous',
    dog_name: 'Votre chien',
    points: 2450,
    level: 'silver',
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'platinum':
        return '#e5e4e2';
      case 'gold':
        return '#ffd700';
      case 'silver':
        return '#c0c0c0';
      case 'bronze':
        return '#cd7f32';
      default:
        return '#a0a0a0';
    }
  };

  return (
    <div className="rewards-page">
      <SubAppHeader
        title="Classement"
        icon="📊"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/rewards')}
      />

      <div className="leaderboard-tabs">
        <button
          className={`leaderboard-tab ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Global
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          📅 Semaine
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👥 Amis
        </button>
      </div>

      <div className="leaderboard-user-card">
        <div className="leaderboard-user-rank">#{currentUser.rank}</div>
        <div className="leaderboard-user-info">
          <div className="leaderboard-user-name">{currentUser.name}</div>
          <div className="leaderboard-user-dog">🐾 {currentUser.dog_name}</div>
        </div>
        <div className="leaderboard-user-points">
          <span className="leaderboard-points-value">{currentUser.points.toLocaleString()}</span>
          <span className="leaderboard-points-label">pts</span>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`leaderboard-item ${user.rank <= 3 ? 'top-three' : ''}`}
          >
            <div className="leaderboard-rank">
              {user.rank <= 3 ? (
                <span className="leaderboard-medal">{getRankIcon(user.rank)}</span>
              ) : (
                <span className="leaderboard-rank-number">#{user.rank}</span>
              )}
            </div>

            <div className="leaderboard-avatar">{user.avatar}</div>

            <div className="leaderboard-info">
              <div className="leaderboard-name">{user.name}</div>
              {user.dog_name && (
                <div className="leaderboard-dog">🐾 {user.dog_name}</div>
              )}
            </div>

            <div className="leaderboard-points">
              <span
                className="leaderboard-level-dot"
                style={{ background: getLevelColor(user.level) }}
              />
              <span className="leaderboard-points-value">
                {user.points.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="leaderboard-footer">
        <p className="leaderboard-footer-text">
          Le classement est mis à jour toutes les heures
        </p>
      </div>
    </div>
  );
}
