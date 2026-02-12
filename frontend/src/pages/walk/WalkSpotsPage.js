import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const SPOT_TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'parc', label: 'Parc' },
  { value: 'foret', label: 'Foret' },
  { value: 'plage', label: 'Plage' },
  { value: 'sentier', label: 'Sentier' },
  { value: 'dog_park', label: 'Dog Park' },
];

export default function WalkSpotsPage() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    spot_type: 'parc',
    city: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSpots = () => {
    setLoading(true);
    api.request('/walk-spots')
      .then((data) => {
        setSpots(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSpots([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request('/walk-spots', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setFormData({ name: '', spot_type: 'parc', city: '', description: '' });
      setShowForm(false);
      fetchSpots();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const filteredSpots =
    activeFilter === 'all'
      ? spots
      : spots.filter((s) => s.spot_type === activeFilter);

  const renderStars = (rating) => {
    const r = rating || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="walk-spot-stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
        <span className="walk-spot-rating-num">({r.toFixed(1)})</span>
      </span>
    );
  };

  const getTypeBadgeClass = (type) => {
    const classes = {
      parc: 'walk-type-parc',
      foret: 'walk-type-foret',
      plage: 'walk-type-plage',
      sentier: 'walk-type-sentier',
      dog_park: 'walk-type-dogpark',
    };
    return classes[type] || '';
  };

  return (
    <div className="walk-page">
      <SubAppHeader
        title="Spots de promenade"
        icon="📍"
        gradient="linear-gradient(135deg, #48c6ef, #6f86d6)"
        onBack={() => navigate('/walk')}
      />

      <div className="walk-spots-filters">
        {SPOT_TYPES.map((type) => (
          <button
            key={type.value}
            className={`walk-filter-btn ${activeFilter === type.value ? 'walk-filter-active' : ''}`}
            onClick={() => setActiveFilter(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="walk-actions">
        <button
          className="walk-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annuler' : '+ Ajouter un spot'}
        </button>
      </div>

      {showForm && (
        <form className="walk-form walk-spot-form" onSubmit={handleSubmit}>
          <div className="walk-form-group">
            <label className="walk-form-label">Nom du spot</label>
            <input
              className="walk-form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Parc de la Tete d'Or"
              required
            />
          </div>
          <div className="walk-form-group">
            <label className="walk-form-label">Type</label>
            <select
              className="walk-form-select"
              name="spot_type"
              value={formData.spot_type}
              onChange={handleChange}
            >
              {SPOT_TYPES.filter((t) => t.value !== 'all').map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="walk-form-group">
            <label className="walk-form-label">Ville</label>
            <input
              className="walk-form-input"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: Lyon"
              required
            />
          </div>
          <div className="walk-form-group">
            <label className="walk-form-label">Description</label>
            <textarea
              className="walk-form-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Decrivez ce spot..."
              rows={3}
            />
          </div>
          <button
            className="walk-form-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'Ajouter le spot'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="walk-loading">Chargement...</div>
      ) : filteredSpots.length === 0 ? (
        <div className="walk-empty">
          <span className="walk-empty-icon">📍</span>
          <p>Aucun spot trouv&eacute;</p>
        </div>
      ) : (
        <div className="walk-spots-list">
          {filteredSpots.map((spot, idx) => (
            <div key={spot.id || idx} className="walk-spot-card">
              <div className="walk-spot-header">
                <h3 className="walk-spot-name">{spot.name}</h3>
                <span className={`walk-spot-type-badge ${getTypeBadgeClass(spot.spot_type)}`}>
                  {SPOT_TYPES.find((t) => t.value === spot.spot_type)?.label || spot.spot_type}
                </span>
              </div>
              <div className="walk-spot-info">
                {spot.city && (
                  <span className="walk-spot-city">
                    📍 {spot.city}
                  </span>
                )}
                {spot.rating !== undefined && spot.rating !== null && renderStars(spot.rating)}
              </div>
              {spot.description && (
                <p className="walk-spot-description">{spot.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
