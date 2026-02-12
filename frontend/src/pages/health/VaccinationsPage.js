import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function VaccinationsPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    next_due: '',
    vet_name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  const fetchVaccinations = (dogId) => {
    if (!dogId) return;
    setLoading(true);
    api.request(`/health/vaccinations/${dogId}`)
      .then((data) => {
        setVaccinations(data);
        setLoading(false);
      })
      .catch(() => {
        setVaccinations([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVaccinations(activeDogId);
  }, [activeDogId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request('/health/vaccinations', {
        method: 'POST',
        body: JSON.stringify({ ...formData, dog_id: activeDogId }),
      });
      setFormData({ name: '', date: '', next_due: '', vet_name: '' });
      setShowForm(false);
      fetchVaccinations(activeDogId);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const now = new Date();

  const getStatusColor = (nextDue) => {
    if (!nextDue) return '#a0a0a0';
    return new Date(nextDue) < now ? '#ff4757' : '#2ed573';
  };

  const getStatusLabel = (nextDue) => {
    if (!nextDue) return 'Non renseigne';
    return new Date(nextDue) < now ? 'En retard' : 'A jour';
  };

  return (
    <div className="health-page">
      <SubAppHeader
        title="Vaccinations"
        icon="💉"
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

      <div className="health-actions">
        <button
          className="health-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annuler' : '+ Ajouter un vaccin'}
        </button>
      </div>

      {showForm && (
        <form className="health-form" onSubmit={handleSubmit}>
          <div className="health-form-group">
            <label className="health-form-label">Nom du vaccin</label>
            <input
              className="health-form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Rage, CHPPIL..."
              required
            />
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Date de vaccination</label>
            <input
              className="health-form-input"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Prochain rappel</label>
            <input
              className="health-form-input"
              type="date"
              name="next_due"
              value={formData.next_due}
              onChange={handleChange}
            />
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Nom du v&eacute;t&eacute;rinaire</label>
            <input
              className="health-form-input"
              type="text"
              name="vet_name"
              value={formData.vet_name}
              onChange={handleChange}
              placeholder="Dr. Dupont"
            />
          </div>
          <button
            className="health-form-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="health-loading">Chargement...</div>
      ) : vaccinations.length === 0 ? (
        <div className="health-empty">
          <span className="health-empty-icon">💉</span>
          <p>Aucune vaccination enregistr&eacute;e</p>
        </div>
      ) : (
        <div className="health-list">
          {vaccinations.map((vac, idx) => (
            <div key={vac.id || idx} className="health-card vaccination-card">
              <div className="vaccination-header">
                <h3 className="vaccination-name">{vac.name}</h3>
                <span
                  className="vaccination-status-badge"
                  style={{
                    background: getStatusColor(vac.next_due),
                    color: '#fff',
                  }}
                >
                  {getStatusLabel(vac.next_due)}
                </span>
              </div>
              <div className="vaccination-details">
                <div className="vaccination-detail">
                  <span className="vaccination-detail-label">Date</span>
                  <span className="vaccination-detail-value">
                    {new Date(vac.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {vac.next_due && (
                  <div className="vaccination-detail">
                    <span className="vaccination-detail-label">Prochain rappel</span>
                    <span
                      className="vaccination-detail-value"
                      style={{ color: getStatusColor(vac.next_due) }}
                    >
                      {new Date(vac.next_due).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {vac.vet_name && (
                  <div className="vaccination-detail">
                    <span className="vaccination-detail-label">V&eacute;t&eacute;rinaire</span>
                    <span className="vaccination-detail-value">{vac.vet_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
