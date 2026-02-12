import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function HealthStatsPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    weight_history: [],
    vaccination_count: 0,
    appointment_count: 0,
    last_checkup: null,
  });

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeDogId) return;
    setLoading(true);

    // Mock data for demonstration
    setTimeout(() => {
      setStats({
        weight_history: [
          { date: '2025-11-01', weight: 8.2 },
          { date: '2025-12-01', weight: 8.5 },
          { date: '2026-01-01', weight: 8.7 },
          { date: '2026-02-01', weight: 8.9 },
        ],
        vaccination_count: 5,
        appointment_count: 12,
        last_checkup: '2026-01-15',
        total_records: 18,
        avg_vet_visits_per_month: 1.2,
      });
      setLoading(false);
    }, 300);
  }, [activeDogId]);

  const currentWeight = stats.weight_history.length > 0
    ? stats.weight_history[stats.weight_history.length - 1].weight
    : 0;

  const weightTrend = stats.weight_history.length >= 2
    ? stats.weight_history[stats.weight_history.length - 1].weight -
      stats.weight_history[stats.weight_history.length - 2].weight
    : 0;

  return (
    <div className="health-page">
      <SubAppHeader
        title="Statistiques de Santé"
        icon="📊"
        gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        onBack={() => navigate('/health')}
      />

      {dogs.length > 1 && (
        <div className="health-dog-selector">
          <select
            className="health-dog-select"
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(e.target.value)}
          >
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="health-loading">Chargement...</div>
      ) : (
        <div className="health-stats-container">
          <div className="health-stats-grid">
            <div className="health-stat-box">
              <div className="health-stat-box-icon">⚖️</div>
              <div className="health-stat-box-content">
                <div className="health-stat-box-value">{currentWeight} kg</div>
                <div className="health-stat-box-label">Poids actuel</div>
                {weightTrend !== 0 && (
                  <div
                    className="health-stat-box-trend"
                    style={{ color: weightTrend > 0 ? '#2ed573' : '#ff4757' }}
                  >
                    {weightTrend > 0 ? '+' : ''}
                    {weightTrend.toFixed(1)} kg
                  </div>
                )}
              </div>
            </div>

            <div className="health-stat-box">
              <div className="health-stat-box-icon">💉</div>
              <div className="health-stat-box-content">
                <div className="health-stat-box-value">{stats.vaccination_count}</div>
                <div className="health-stat-box-label">Vaccinations</div>
                <div className="health-stat-box-sublabel">À jour</div>
              </div>
            </div>

            <div className="health-stat-box">
              <div className="health-stat-box-icon">🩺</div>
              <div className="health-stat-box-content">
                <div className="health-stat-box-value">{stats.appointment_count}</div>
                <div className="health-stat-box-label">Rendez-vous</div>
                <div className="health-stat-box-sublabel">Total</div>
              </div>
            </div>

            <div className="health-stat-box">
              <div className="health-stat-box-icon">📋</div>
              <div className="health-stat-box-content">
                <div className="health-stat-box-value">{stats.total_records}</div>
                <div className="health-stat-box-label">Enregistrements</div>
                <div className="health-stat-box-sublabel">Au carnet</div>
              </div>
            </div>
          </div>

          {stats.last_checkup && (
            <div className="health-info-card">
              <div className="health-info-card-icon">🔍</div>
              <div className="health-info-card-content">
                <h3 className="health-info-card-title">Dernier bilan de santé</h3>
                <p className="health-info-card-date">
                  {new Date(stats.last_checkup).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="health-info-card-hint">
                  Prochain bilan recommandé dans{' '}
                  {Math.ceil(
                    (new Date(stats.last_checkup).getTime() +
                      365 * 24 * 60 * 60 * 1000 -
                      new Date().getTime()) /
                      (24 * 60 * 60 * 1000)
                  )}{' '}
                  jours
                </p>
              </div>
            </div>
          )}

          <div className="health-chart-card">
            <h3 className="health-chart-title">Évolution du poids</h3>
            <div className="health-chart-container">
              {stats.weight_history.map((entry, idx) => {
                const maxWeight = Math.max(...stats.weight_history.map((e) => e.weight));
                const minWeight = Math.min(...stats.weight_history.map((e) => e.weight));
                const range = maxWeight - minWeight || 1;
                const height = ((entry.weight - minWeight) / range) * 100;

                return (
                  <div key={idx} className="health-chart-bar-container">
                    <div className="health-chart-bar-wrapper">
                      <div
                        className="health-chart-bar"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      >
                        <span className="health-chart-bar-value">{entry.weight}kg</span>
                      </div>
                    </div>
                    <div className="health-chart-bar-label">
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        month: 'short',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="health-insights-card">
            <h3 className="health-insights-title">💡 Conseils Santé</h3>
            <ul className="health-insights-list">
              <li className="health-insight-item">
                <span className="health-insight-icon">✅</span>
                <span className="health-insight-text">
                  Le suivi de poids est régulier - continuez ainsi !
                </span>
              </li>
              <li className="health-insight-item">
                <span className="health-insight-icon">💉</span>
                <span className="health-insight-text">
                  Toutes les vaccinations sont à jour
                </span>
              </li>
              <li className="health-insight-item">
                <span className="health-insight-icon">📅</span>
                <span className="health-insight-text">
                  Moyenne de {stats.avg_vet_visits_per_month} visite vétérinaire par mois
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
