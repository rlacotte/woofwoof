import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function WalkHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [stats, setStats] = useState({ total_walks: 0, total_km: 0, avg_duration: 0 });
  const [recentWalks, setRecentWalks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!activeDogId) return;
    setLoading(true);
    Promise.all([
      api.request(`/walks/${activeDogId}/stats`).catch(() => ({
        total_walks: 0,
        total_km: 0,
        avg_duration: 0,
      })),
      api.request(`/walks/${activeDogId}?limit=5`).catch(() => []),
    ]).then(([statsData, walksData]) => {
      setStats(statsData);
      setRecentWalks(Array.isArray(walksData) ? walksData : []);
      setLoading(false);
    });
  }, [activeDogId]);

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0) return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
    return `${m} min`;
  };

  return (
    <div className="walk-page">
      <SubAppHeader
        title="WoofWalk"
        icon="🦮"
        gradient="linear-gradient(135deg, #48c6ef, #6f86d6)"
      />

      {dogs.length > 1 && (
        <div className="walk-dog-selector">
          <select
            className="walk-dog-select"
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
        <div className="walk-loading">Chargement...</div>
      ) : (
        <>
          <div className="walk-stats-dashboard">
            <div className="walk-stat-card">
              <span className="walk-stat-value">{stats.total_walks}</span>
              <span className="walk-stat-label">Promenades</span>
            </div>
            <div className="walk-stat-card">
              <span className="walk-stat-value">
                {typeof stats.total_km === 'number' ? stats.total_km.toFixed(1) : '0'}
              </span>
              <span className="walk-stat-label">km total</span>
            </div>
            <div className="walk-stat-card">
              <span className="walk-stat-value">
                {formatDuration(stats.avg_duration)}
              </span>
              <span className="walk-stat-label">Moy. dur&eacute;e</span>
            </div>
          </div>

          <div className="walk-quick-actions">
            <button
              className="walk-action-btn walk-action-primary"
              onClick={() => navigate('/walk/track')}
            >
              <span className="walk-action-icon">▶</span>
              Nouvelle promenade
            </button>
            <button
              className="walk-action-btn walk-action-secondary"
              onClick={() => navigate('/walk/spots')}
            >
              <span className="walk-action-icon">📍</span>
              Spots
            </button>
          </div>

          <div className="walk-recent-section">
            <h3 className="walk-section-title">Promenades r&eacute;centes</h3>
            {recentWalks.length === 0 ? (
              <div className="walk-empty">
                <p>Aucune promenade enregistr&eacute;e</p>
              </div>
            ) : (
              <div className="walk-list">
                {recentWalks.map((walk, idx) => (
                  <div
                    key={walk.id || idx}
                    className="walk-card"
                    onClick={() => navigate(`/walk/history/${walk.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="walk-card-left">
                      <span className="walk-card-date">
                        {new Date(walk.date || walk.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {walk.notes && (
                        <span className="walk-card-notes">{walk.notes}</span>
                      )}
                    </div>
                    <div className="walk-card-right">
                      <span className="walk-card-distance">
                        {walk.distance_km ? `${walk.distance_km} km` : '-'}
                      </span>
                      <span className="walk-card-duration">
                        {formatDuration(walk.duration_minutes)}
                      </span>
                      <span style={{ marginLeft: '10px' }}>🗺️</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
