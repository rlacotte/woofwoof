import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const defaultApps = [
  { id: 'match', name: 'WoofMatch', icon: '💕', color: '#ff6b6b', gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', path: '/match', desc: 'Rencontres' },
  { id: 'health', name: 'WoofHealth', icon: '🏥', color: '#38ef7d', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', path: '/health', desc: 'Santé & Bien-être' },
  { id: 'walk', name: 'WoofWalk', icon: '🦮', color: '#48c6ef', gradient: 'linear-gradient(135deg, #48c6ef, #6f86d6)', path: '/walk', desc: 'Promenades & Activité' },
  { id: 'food', name: 'WoofFood', icon: '🍖', color: '#f7971e', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)', path: '/food', desc: 'Nutrition' },
  { id: 'sitter', name: 'WoofSitter', icon: '🏠', color: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', path: '/sitter', desc: 'Garde & Pet-sitting' },
  { id: 'social', name: 'WoofSocial', icon: '📸', color: '#667eea', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/social', desc: 'Réseau Social' },
  { id: 'shop', name: 'WoofShop', icon: '🛍️', color: '#4ecdc4', gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)', path: '/shop', desc: 'Boutique' },
  { id: 'train', name: 'WoofTrain', icon: '🎓', color: '#a8e063', gradient: 'linear-gradient(135deg, #56ab2f, #a8e063)', path: '/train', desc: 'Éducation & Dressage' },
  { id: 'adopt', name: 'WoofAdopt', icon: '💝', color: '#eb3349', gradient: 'linear-gradient(135deg, #eb3349, #f45c43)', path: '/adopt', desc: 'Adoption' },
  { id: 'travel', name: 'WoofTravel', icon: '✈️', color: '#00c9ff', gradient: 'linear-gradient(135deg, #00c9ff, #92fe9d)', path: '/travel', desc: 'Voyages' },
  { id: 'insure', name: 'WoofInsure', icon: '🛡️', color: '#c471f5', gradient: 'linear-gradient(135deg, #c471f5, #fa71cd)', path: '/insure', desc: 'Assurance' },
  { id: 'petid', name: 'WoofID', icon: '📡', color: '#f5af19', gradient: 'linear-gradient(135deg, #f12711, #f5af19)', path: '/petid', desc: 'Identification' },
  { id: 'breed', name: 'WoofBreed', icon: '🧬', color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', path: '/breed', desc: 'Élevage' },
  { id: 'alert', name: 'WoofAlert', icon: '⚠️', color: '#ff4b2b', gradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)', path: '/alert', desc: 'Alertes & Dangers' },
];

export default function HubPage({ user }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState(defaultApps);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadHubOrder();
  }, []);

  async function loadHubOrder() {
    if (!user) return;
    try {
      const response = await api.get('/api/me/hub-order');
      if (response.hub_order) {
        const orderedApps = response.hub_order
          .map(id => defaultApps.find(app => app.id === id))
          .filter(Boolean);

        const missingApps = defaultApps.filter(
          app => !response.hub_order.includes(app.id)
        );

        setApps([...orderedApps, ...missingApps]);
      }
    } catch (error) {
      console.error('Failed to load hub order:', error);
    }
  }

  async function saveHubOrder(newApps) {
    if (!user) return;
    try {
      await api.put('/api/me/hub-order', {
        hub_ids: newApps.map(app => app.id)
      });
    } catch (error) {
      console.error('Failed to save hub order:', error);
    }
  }

  function handleDragStart(index) {
    setDraggedIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newApps = [...apps];
    const draggedApp = newApps[draggedIndex];
    newApps.splice(draggedIndex, 1);
    newApps.splice(index, 0, draggedApp);

    setApps(newApps);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    saveHubOrder(apps);
  }

  return (
    <div className="hub-page">
      <div className="hub-header">
        <h1 className="hub-title">🐾 WoofWoof</h1>
        <p className="hub-subtitle">L'écosystème complet pour votre animal</p>
        {user && (
          <button
            className="hub-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✓ Terminé' : '⚙️ Réorganiser'}
          </button>
        )}
      </div>

      <div className="hub-grid">
        {apps.map((app, index) => (
          <div
            key={app.id}
            className={`hub-app-card ${isEditing ? 'hub-app-card-editing' : ''}`}
            draggable={isEditing}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => !isEditing && navigate(app.path)}
            style={{ cursor: isEditing ? 'grab' : 'pointer' }}
          >
            <div className="hub-app-icon" style={{ background: app.gradient }}>
              <span>{app.icon}</span>
            </div>
            <span className="hub-app-name">{app.name}</span>
            <span className="hub-app-desc">{app.desc}</span>
          </div>
        ))}
      </div>

      <div className="hub-quick-actions">
        <div className="hub-quick-title">Accès rapide</div>
        <div className="hub-quick-row">
          <div className="hub-quick-btn" onClick={() => navigate('/match')}>
            <span>💕</span> Matching
          </div>
          <div className="hub-quick-btn" onClick={() => navigate('/predictor')}>
            <span>🧪</span> Prédicteur
          </div>
          <div className="hub-quick-btn" onClick={() => navigate('/map')}>
            <span>🗺️</span> Carte
          </div>
          <div className="hub-quick-btn" onClick={() => navigate('/plans')}>
            <span>⭐</span> Plans
          </div>
        </div>
      </div>
    </div>
  );
}
