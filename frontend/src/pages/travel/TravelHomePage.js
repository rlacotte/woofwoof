import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const CATEGORIES = [
  { key: 'hotel', label: 'Hotel', icon: '🏨' },
  { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { key: 'cafe', label: 'Cafe', icon: '☕' },
  { key: 'beach', label: 'Plage', icon: '🏖️' },
  { key: 'camping', label: 'Camping', icon: '⛺' },
  { key: 'transport', label: 'Transport', icon: '🚆' },
];

export default function TravelHomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.request('/travel/places?limit=4').catch(() => []),
      api.request('/travel/checklists').catch(() => []),
    ]).then(([p, c]) => {
      setPlaces(p);
      setChecklists(c);
      setLoading(false);
    });
  }, []);

  const activeChecklists = checklists.filter(
    (c) => {
      const total = c.items ? c.items.length : 0;
      const checked = c.items ? c.items.filter((i) => i.checked).length : 0;
      return total > 0 && checked < total;
    }
  );

  const filteredPlaces = search
    ? places.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.city && p.city.toLowerCase().includes(search.toLowerCase()))
      )
    : places;

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < full ? '#f5af19' : 'rgba(255,255,255,0.2)' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="travel-page">
      <SubAppHeader
        title="WoofTravel"
        icon="✈️"
        gradient="linear-gradient(135deg, #00c9ff, #92fe9d)"
      />

      <div style={{ padding: '16px' }}>
        {/* Search Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Rechercher un lieu pet-friendly..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f0f0f5',
              fontSize: '14px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Chips */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '24px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => navigate(`/travel/places?type=${cat.key}`)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#f0f0f5',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : (
          <>
            {/* Lieux pet-friendly */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: 0 }}>
                  Lieux pet-friendly
                </h2>
                <button
                  onClick={() => navigate('/travel/places')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00c9ff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Voir tout →
                </button>
              </div>

              {filteredPlaces.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(240,240,245,0.6)',
                }}>
                  Aucun lieu trouve
                </div>
              ) : (
                filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/travel/places')}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '15px' }}>
                          {place.name}
                        </div>
                        <div style={{
                          color: 'rgba(240,240,245,0.6)',
                          fontSize: '13px',
                          marginTop: '2px',
                        }}>
                          {place.city}
                        </div>
                      </div>
                      <span style={{
                        background: 'rgba(0,201,255,0.15)',
                        color: '#00c9ff',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        textTransform: 'capitalize',
                      }}>
                        {place.place_type || place.type}
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '14px' }}>
                      {renderStars(place.rating)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mes checklists */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: 0 }}>
                  Mes checklists
                </h2>
                <button
                  onClick={() => navigate('/travel/checklists')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00c9ff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Voir tout →
                </button>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/travel/checklists')}
              >
                <div>
                  <div style={{ color: '#f0f0f5', fontSize: '28px', fontWeight: 700 }}>
                    {activeChecklists.length}
                  </div>
                  <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
                    checklist{activeChecklists.length !== 1 ? 's' : ''} active{activeChecklists.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ fontSize: '36px' }}>📋</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
