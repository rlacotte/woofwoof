import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function MapPage({ user, activeDog }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { t } = useTranslation();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  useEffect(() => {
    if (activeDog) {
      loadDogs();
    }
  }, [activeDog?.id]);

  useEffect(() => {
    if (mapReady && dogs.length > 0 && mapRef.current && !mapInstance.current) {
      initMap();
    }
  }, [mapReady, dogs]);

  async function loadDogs() {
    if (!activeDog) return;
    setLoading(true);
    try {
      const results = await api.discover(activeDog.id, { max_distance_km: 500 });
      setDogs(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function initMap() {
    const L = window.L;
    if (!L || !mapRef.current) return;

    const userLat = user.latitude || 48.8566;
    const userLng = user.longitude || 2.3522;

    const map = L.map(mapRef.current).setView([userLat, userLng], 11);
    mapInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      className: 'map-marker-user',
      html: '<div class="map-marker-dot map-marker-dot-user">📍</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<b>Vous</b><br/>${user.city || 'Ma position'}`);

    // Dog markers
    dogs.forEach(dog => {
      if (!dog.distance_km) return;
      // Approximate position based on distance (random angle from user)
      const angle = Math.random() * 2 * Math.PI;
      const distDeg = (dog.distance_km / 111);
      const lat = userLat + distDeg * Math.cos(angle);
      const lng = userLng + distDeg * Math.sin(angle) / Math.cos(userLat * Math.PI / 180);

      const dogIcon = L.divIcon({
        className: 'map-marker-dog',
        html: `<div class="map-marker-dot map-marker-dot-dog">${dog.photo_url_1 ? `<img src="${dog.photo_url_1}" />` : '🐕'}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([lat, lng], { icon: dogIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align:center; min-width:120px;">
            ${dog.photo_url_1 ? `<img src="${dog.photo_url_1}" style="width:80px; height:80px; border-radius:12px; object-fit:cover; margin-bottom:6px;" />` : ''}
            <div style="font-weight:700; font-size:14px;">${dog.name} ${dog.sex === 'male' ? '♂' : '♀'}</div>
            <div style="font-size:12px; color:#888;">${dog.breed}</div>
            <div style="font-size:11px; color:#aaa; margin-top:4px;">📍 ${dog.distance_km} km</div>
            ${dog.has_pedigree ? '<div style="font-size:10px; color:#ffd200; font-weight:700; margin-top:4px;">LOF ✓</div>' : ''}
          </div>
        `);
    });

    // Fit bounds if we have dogs
    if (dogs.length > 0) {
      const bounds = L.latLngBounds([[userLat, userLng]]);
      dogs.forEach(dog => {
        if (dog.distance_km) {
          const angle = Math.random() * 2 * Math.PI;
          const distDeg = dog.distance_km / 111;
          bounds.extend([
            userLat + distDeg * Math.cos(angle),
            userLng + distDeg * Math.sin(angle) / Math.cos(userLat * Math.PI / 180)
          ]);
        }
      });
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }

  return (
    <div className="map-page">
      <div className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>{t('map.back')}</button>
        <h1>{t('map.title')}</h1>
        <span className="matches-count">{dogs.length} {t('map.dogs')}</span>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-logo" style={{ fontSize: 48 }}>🗺️</div>
          <p>{t('map.loading')}</p>
        </div>
      ) : (
        <div ref={mapRef} className="map-container" />
      )}
    </div>
  );
}
