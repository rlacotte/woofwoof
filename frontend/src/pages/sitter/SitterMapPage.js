import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function SitterMapPage() {
  const navigate = useNavigate();
  const [sitters, setSitters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSitter, setSelectedSitter] = useState(null);

  useEffect(() => {
    loadSitters();
    getUserLocation();
  }, []);

  async function loadSitters() {
    try {
      const data = await api.get('/api/sitters');
      setSitters(Array.isArray(data) ? data : []);
    } catch (error) {
      setSitters([]);
    }
    setLoading(false);
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const sittersWithDistance = sitters.map((sitter) => {
    if (userLocation && sitter.user_latitude && sitter.user_longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        sitter.user_latitude,
        sitter.user_longitude
      );
      return { ...sitter, distance: distance.toFixed(1) };
    }
    return sitter;
  }).sort((a, b) => (a.distance || 999) - (b.distance || 999));

  const renderStars = (rating) => {
    const r = rating || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="sitter-map-stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
      </span>
    );
  };

  return (
    <div className="sitter-page">
      <SubAppHeader
        title="Carte des Pet-Sitters"
        icon="🗺️"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/sitter')}
      />

      <div className="sitter-map-container">
        <div className="sitter-map-placeholder">
          <div className="sitter-map-icon">🗺️</div>
          <p className="sitter-map-text">Carte interactive</p>
          {userLocation && (
            <div className="sitter-map-user-marker">
              📍 Votre position
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="sitter-loading">Chargement...</div>
      ) : (
        <div className="sitter-map-list">
          <h3 className="sitter-map-list-title">
            Pet-sitters à proximité ({sittersWithDistance.length})
          </h3>
          {sittersWithDistance.map((sitter) => (
            <div
              key={sitter.id}
              className={`sitter-map-card ${
                selectedSitter?.id === sitter.id ? 'sitter-map-card-selected' : ''
              }`}
              onClick={() => setSelectedSitter(sitter)}
            >
              <div className="sitter-map-card-header">
                <div className="sitter-map-card-avatar">
                  {sitter.user_name?.charAt(0) || '?'}
                </div>
                <div className="sitter-map-card-info">
                  <h4 className="sitter-map-card-name">{sitter.user_name}</h4>
                  {sitter.rating > 0 && renderStars(sitter.rating)}
                  {sitter.distance && (
                    <span className="sitter-map-distance">
                      📍 {sitter.distance} km
                    </span>
                  )}
                </div>
                <div className="sitter-map-card-rate">
                  {sitter.rate_per_hour ? `${sitter.rate_per_hour} €/h` : '-'}
                </div>
              </div>

              <div className="sitter-map-card-services">
                {sitter.services &&
                  sitter.services.split(',').map((service, idx) => (
                    <span key={idx} className="sitter-map-service-badge">
                      {service}
                    </span>
                  ))}
                {sitter.has_garden && (
                  <span className="sitter-map-garden-badge">🌿 Jardin</span>
                )}
              </div>

              <button
                className="sitter-map-view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sitter/${sitter.id}`);
                }}
              >
                Voir le profil →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
