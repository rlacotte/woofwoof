import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function MyAchievementsPage() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      setLoading(true);
      const progressData = await api.get('/api/train/my-progress');

      const completed = progressData.filter(p => p.status === 'completed');
      const inProgress = progressData.filter(p => p.status === 'in_progress');

      const totalSteps = completed.reduce((sum, p) => sum + (p.total_steps || 0), 0);
      const uniqueDifficulties = new Set(completed.map(p => p.difficulty));

      setStats({
        programsCompleted: completed.length,
        programsInProgress: inProgress.length,
        totalSteps: totalSteps,
        difficultiesUnlocked: uniqueDifficulties.size,
      });

      const earned = [];

      if (completed.length >= 1) {
        earned.push({
          id: 'first_program',
          title: 'Premier Programme',
          description: 'Terminer votre premier programme',
          icon: '🏆',
          date: completed[0].completed_at,
          rarity: 'bronze',
        });
      }

      if (completed.length >= 5) {
        earned.push({
          id: 'five_programs',
          title: 'Éducateur Dévoué',
          description: 'Terminer 5 programmes',
          icon: '🥉',
          date: completed[4].completed_at,
          rarity: 'bronze',
        });
      }

      if (completed.length >= 10) {
        earned.push({
          id: 'ten_programs',
          title: 'Maître Entraîneur',
          description: 'Terminer 10 programmes',
          icon: '🥈',
          date: completed[9].completed_at,
          rarity: 'silver',
        });
      }

      if (completed.some(p => p.difficulty === 'expert')) {
        earned.push({
          id: 'expert_complete',
          title: 'Expert Confirmé',
          description: 'Terminer un programme expert',
          icon: '🏅',
          date: completed.find(p => p.difficulty === 'expert').completed_at,
          rarity: 'gold',
        });
      }

      if (totalSteps >= 50) {
        earned.push({
          id: 'fifty_steps',
          title: 'Persévérant',
          description: 'Compléter 50 étapes',
          icon: '⭐',
          date: new Date().toISOString(),
          rarity: 'silver',
        });
      }

      if (uniqueDifficulties.size === 3) {
        earned.push({
          id: 'all_difficulties',
          title: 'Polyvalent',
          description: 'Terminer des programmes de chaque difficulté',
          icon: '🌟',
          date: new Date().toISOString(),
          rarity: 'gold',
        });
      }

      setAchievements(earned.sort((a, b) =>
        new Date(b.date || 0) - new Date(a.date || 0)
      ));
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'gold':
        return { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.4)', color: '#ffd700' };
      case 'silver':
        return { bg: 'rgba(192, 192, 192, 0.15)', border: 'rgba(192, 192, 192, 0.4)', color: '#c0c0c0' };
      case 'bronze':
        return { bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.4)', color: '#cd7f32' };
      default:
        return { bg: 'rgba(102, 126, 234, 0.15)', border: 'rgba(102, 126, 234, 0.4)', color: '#667eea' };
    }
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
    <div className="train-achievements-page">
      <SubAppHeader
        title="Mes Réussites"
        icon="🎓"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/train')}
      />

      <div className="train-achievements-content">
        {loading ? (
          <div className="train-achievements-loading">
            <div className="train-achievements-loading-spinner">🎓</div>
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            <div className="train-stats-grid">
              <div className="train-stat-card">
                <div className="train-stat-icon">🏆</div>
                <div className="train-stat-value">{stats.programsCompleted}</div>
                <div className="train-stat-label">Programmes terminés</div>
              </div>
              <div className="train-stat-card">
                <div className="train-stat-icon">📚</div>
                <div className="train-stat-value">{stats.programsInProgress}</div>
                <div className="train-stat-label">En cours</div>
              </div>
              <div className="train-stat-card">
                <div className="train-stat-icon">✅</div>
                <div className="train-stat-value">{stats.totalSteps}</div>
                <div className="train-stat-label">Étapes complétées</div>
              </div>
              <div className="train-stat-card">
                <div className="train-stat-icon">🎯</div>
                <div className="train-stat-value">{stats.difficultiesUnlocked}</div>
                <div className="train-stat-label">Difficultés débloquées</div>
              </div>
            </div>

            {achievements.length === 0 ? (
              <div className="train-achievements-empty">
                <div className="train-achievements-empty-icon">🏆</div>
                <h3 className="train-achievements-empty-title">Aucune réussite</h3>
                <p className="train-achievements-empty-text">
                  Terminez des programmes pour débloquer des réussites
                </p>
                <button
                  className="train-achievements-browse-btn"
                  onClick={() => navigate('/train')}
                >
                  Parcourir les programmes
                </button>
              </div>
            ) : (
              <div className="train-achievements-section">
                <h3 className="train-achievements-section-title">
                  Réussites débloquées ({achievements.length})
                </h3>
                <div className="train-achievements-list">
                  {achievements.map((achievement) => {
                    const rarityStyle = getRarityStyle(achievement.rarity);
                    return (
                      <div
                        key={achievement.id}
                        className="train-achievement-card"
                        style={{
                          background: rarityStyle.bg,
                          borderColor: rarityStyle.border,
                        }}
                      >
                        <div className="train-achievement-icon">{achievement.icon}</div>
                        <div className="train-achievement-info">
                          <h4 className="train-achievement-title">{achievement.title}</h4>
                          <p className="train-achievement-description">
                            {achievement.description}
                          </p>
                          {achievement.date && (
                            <div className="train-achievement-date">
                              Débloqué le {formatDate(achievement.date)}
                            </div>
                          )}
                        </div>
                        <div
                          className="train-achievement-rarity"
                          style={{ color: rarityStyle.color }}
                        >
                          {achievement.rarity === 'gold' && '★★★'}
                          {achievement.rarity === 'silver' && '★★'}
                          {achievement.rarity === 'bronze' && '★'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
