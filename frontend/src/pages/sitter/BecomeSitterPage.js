import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const SERVICES = [
  { value: 'garde', label: 'Garde à domicile', icon: '🏠', desc: 'Garde votre animal chez vous' },
  { value: 'promenade', label: 'Promenade', icon: '🦮', desc: 'Sorties et balades' },
  { value: 'visite', label: 'Visite à domicile', icon: '🚪', desc: 'Visite quotidienne' },
  { value: 'pension', label: 'Pension', icon: '🛏️', desc: 'Hébergement chez le sitter' },
  { value: 'toilettage', label: 'Toilettage', icon: '✂️', desc: 'Soins et toilettage' },
];

export default function BecomeSitterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    experience_years: 0,
    rate_per_hour: '',
    rate_per_day: '',
    max_dogs: 3,
    has_garden: false,
    services: [],
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  async function checkExistingProfile() {
    setLoading(true);
    try {
      const response = await api.get('/api/sitters/profile/me');
      if (response && response.id) {
        setHasProfile(true);
        setProfileData({
          bio: response.bio || '',
          experience_years: response.experience_years || 0,
          rate_per_hour: response.rate_per_hour || '',
          rate_per_day: response.rate_per_day || '',
          max_dogs: response.max_dogs || 3,
          has_garden: response.has_garden || false,
          services: response.services ? response.services.split(',') : [],
        });
      }
    } catch (error) {
      setHasProfile(false);
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value,
    });
  }

  function handleServiceToggle(serviceValue) {
    const services = profileData.services.includes(serviceValue)
      ? profileData.services.filter((s) => s !== serviceValue)
      : [...profileData.services, serviceValue];
    setProfileData({ ...profileData, services });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      bio: profileData.bio,
      experience_years: parseInt(profileData.experience_years) || 0,
      rate_per_hour: parseFloat(profileData.rate_per_hour) || null,
      rate_per_day: parseFloat(profileData.rate_per_day) || null,
      max_dogs: parseInt(profileData.max_dogs) || 3,
      has_garden: profileData.has_garden,
      services: profileData.services.join(','),
    };

    try {
      if (hasProfile) {
        await api.put('/api/sitters/profile', payload);
        alert('✅ Profil mis à jour avec succès !');
      } else {
        await api.post('/api/sitters/profile', payload);
        alert('🎉 Félicitations ! Vous êtes maintenant pet-sitter !');
        setHasProfile(true);
      }
    } catch (error) {
      alert('❌ Erreur : ' + (error.detail || error.message || 'Erreur inconnue'));
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="sitter-page">
        <SubAppHeader
          title="Devenir Pet-Sitter"
          icon="🐾"
          gradient="linear-gradient(135deg, #f093fb, #f5576c)"
          onBack={() => navigate('/sitter')}
        />
        <div className="sitter-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="sitter-page">
      <SubAppHeader
        title={hasProfile ? 'Mon Profil Pet-Sitter' : 'Devenir Pet-Sitter'}
        icon="🐾"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/sitter')}
      />

      <div className="become-sitter-hero">
        <div className="become-sitter-hero-icon">🌟</div>
        <h2 className="become-sitter-hero-title">
          {hasProfile ? 'Gérez votre profil' : 'Rejoignez notre communauté'}
        </h2>
        <p className="become-sitter-hero-desc">
          {hasProfile
            ? 'Mettez à jour vos informations et services'
            : 'Gagnez de l\'argent en gardant des animaux de compagnie'}
        </p>
      </div>

      <form className="become-sitter-form" onSubmit={handleSubmit}>
        {/* Bio */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">📝 Présentez-vous</h3>
          <textarea
            className="become-sitter-textarea"
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            placeholder="Parlez de votre expérience, de votre passion pour les animaux, de votre environnement..."
            rows={5}
            required
          />
        </div>

        {/* Experience */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">⭐ Expérience</h3>
          <div className="become-sitter-input-group">
            <label className="become-sitter-label">Années d'expérience</label>
            <input
              type="number"
              className="become-sitter-input"
              name="experience_years"
              value={profileData.experience_years}
              onChange={handleChange}
              min="0"
              max="50"
              required
            />
          </div>
        </div>

        {/* Services */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">🛠️ Services proposés</h3>
          <p className="become-sitter-section-desc">Sélectionnez au moins un service</p>
          <div className="become-sitter-services-grid">
            {SERVICES.map((service) => (
              <div
                key={service.value}
                className={`become-sitter-service-card ${
                  profileData.services.includes(service.value)
                    ? 'become-sitter-service-selected'
                    : ''
                }`}
                onClick={() => handleServiceToggle(service.value)}
              >
                <div className="become-sitter-service-icon">{service.icon}</div>
                <div className="become-sitter-service-label">{service.label}</div>
                <div className="become-sitter-service-desc">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rates */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">💰 Tarifs</h3>
          <div className="become-sitter-rates-grid">
            <div className="become-sitter-input-group">
              <label className="become-sitter-label">Tarif horaire (€)</label>
              <input
                type="number"
                className="become-sitter-input"
                name="rate_per_hour"
                value={profileData.rate_per_hour}
                onChange={handleChange}
                step="0.5"
                min="0"
                placeholder="15"
              />
            </div>
            <div className="become-sitter-input-group">
              <label className="become-sitter-label">Tarif journalier (€)</label>
              <input
                type="number"
                className="become-sitter-input"
                name="rate_per_day"
                value={profileData.rate_per_day}
                onChange={handleChange}
                step="0.5"
                min="0"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">🐕 Capacité d'accueil</h3>
          <div className="become-sitter-input-group">
            <label className="become-sitter-label">
              Nombre maximum de chiens simultanés
            </label>
            <input
              type="number"
              className="become-sitter-input"
              name="max_dogs"
              value={profileData.max_dogs}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
        </div>

        {/* Garden */}
        <div className="become-sitter-section">
          <h3 className="become-sitter-section-title">🌿 Environnement</h3>
          <label className="become-sitter-checkbox-label">
            <input
              type="checkbox"
              className="become-sitter-checkbox"
              name="has_garden"
              checked={profileData.has_garden}
              onChange={handleChange}
            />
            <span>J'ai un jardin ou un espace extérieur</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="become-sitter-submit-btn"
          disabled={submitting || profileData.services.length === 0}
        >
          {submitting
            ? 'Enregistrement...'
            : hasProfile
            ? '✓ Mettre à jour mon profil'
            : '🎉 Créer mon profil pet-sitter'}
        </button>
      </form>

      {hasProfile && (
        <div className="become-sitter-stats">
          <h3 className="become-sitter-stats-title">📊 Vos statistiques</h3>
          <div className="become-sitter-stats-grid">
            <div className="become-sitter-stat-card">
              <div className="become-sitter-stat-value">0</div>
              <div className="become-sitter-stat-label">Réservations totales</div>
            </div>
            <div className="become-sitter-stat-card">
              <div className="become-sitter-stat-value">0</div>
              <div className="become-sitter-stat-label">Avis reçus</div>
            </div>
            <div className="become-sitter-stat-card">
              <div className="become-sitter-stat-value">0 €</div>
              <div className="become-sitter-stat-label">Revenus totaux</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
