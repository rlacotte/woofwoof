import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const SERVICE_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'garde', label: 'Garde' },
  { value: 'promenade', label: 'Promenade' },
  { value: 'visite', label: 'Visite' },
  { value: 'pension', label: 'Pension' },
  { value: 'toilettage', label: 'Toilettage' },
];

export default function SitterHomePage() {
  const navigate = useNavigate();
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.request('/sitters')
      .then((data) => {
        setSitters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSitters([]);
        setLoading(false);
      });
  }, []);

  const filteredSitters =
    activeService === 'all'
      ? sitters
      : sitters.filter(
          (s) =>
            s.services &&
            Array.isArray(s.services) &&
            s.services.includes(activeService)
        );

  const renderStars = (rating) => {
    const r = rating || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="sitter-stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
        <span className="sitter-rating-num">({r.toFixed(1)})</span>
      </span>
    );
  };

  return (
    <div className="sitter-page">
      <SubAppHeader
        title="WoofSitter"
        icon="🏠"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
      />

      <div className="sitter-top-actions">
        <button
          className="sitter-bookings-btn"
          onClick={() => navigate('/sitter/bookings')}
        >
          📋 Mes reservations
        </button>
        <button
          className="sitter-become-btn"
          onClick={() => navigate('/sitter/become')}
        >
          🐾 Devenir pet-sitter
        </button>
      </div>

      <div className="sitter-search-section">
        <h3 className="sitter-section-title">Trouver un pet-sitter</h3>

        <div className="sitter-service-filters">
          {SERVICE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`sitter-filter-btn ${
                activeService === filter.value ? 'sitter-filter-active' : ''
              }`}
              onClick={() => setActiveService(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="sitter-loading">Chargement...</div>
      ) : filteredSitters.length === 0 ? (
        <div className="sitter-empty">
          <span className="sitter-empty-icon">🏠</span>
          <p>Aucun pet-sitter trouv&eacute;</p>
        </div>
      ) : (
        <div className="sitter-list">
          {filteredSitters.map((sitter, idx) => (
            <div
              key={sitter.id || idx}
              className="sitter-card"
              onClick={() => navigate(`/sitter/${sitter.id}`)}
            >
              <div className="sitter-card-left">
                {sitter.photo ? (
                  <img
                    src={sitter.photo}
                    alt={sitter.name}
                    className="sitter-card-photo"
                  />
                ) : (
                  <div className="sitter-card-avatar">
                    {(sitter.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="sitter-card-center">
                <h4 className="sitter-card-name">{sitter.name}</h4>
                {sitter.rating !== undefined && sitter.rating !== null && (
                  renderStars(sitter.rating)
                )}
                <div className="sitter-card-services">
                  {sitter.services &&
                    Array.isArray(sitter.services) &&
                    sitter.services.map((service, sIdx) => (
                      <span key={sIdx} className="sitter-service-badge">
                        {service}
                      </span>
                    ))}
                  {sitter.has_garden && (
                    <span className="sitter-garden-badge">🌿 Jardin</span>
                  )}
                </div>
              </div>
              <div className="sitter-card-right">
                {sitter.rate_per_hour !== undefined && sitter.rate_per_hour !== null && (
                  <span className="sitter-card-rate">
                    {sitter.rate_per_hour} EUR/h
                  </span>
                )}
                <span className="sitter-card-arrow">&rsaquo;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
