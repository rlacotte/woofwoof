import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const MEDICATION_FREQUENCIES = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'twice_daily', label: '2x par jour' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'as_needed', label: 'Au besoin' },
];

export default function MedicationsPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    start_date: '',
    end_date: '',
    notes: '',
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

  const fetchMedications = (dogId) => {
    if (!dogId) return;
    setLoading(true);
    // Mock data for now - will be replaced with real API
    setTimeout(() => {
      setMedications([
        {
          id: 1,
          name: 'Antibiotique',
          dosage: '250mg',
          frequency: 'twice_daily',
          start_date: '2026-02-01',
          end_date: '2026-02-15',
          notes: 'À donner avec de la nourriture',
          active: true,
        },
        {
          id: 2,
          name: 'Anti-inflammatoire',
          dosage: '50mg',
          frequency: 'daily',
          start_date: '2026-01-20',
          end_date: '2026-02-05',
          notes: '',
          active: false,
        },
      ]);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchMedications(activeDogId);
  }, [activeDogId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Mock submission - will be replaced with real API
    setTimeout(() => {
      setFormData({
        name: '',
        dosage: '',
        frequency: 'daily',
        start_date: '',
        end_date: '',
        notes: '',
      });
      setShowForm(false);
      fetchMedications(activeDogId);
      setSubmitting(false);
    }, 500);
  };

  const getFrequencyLabel = (freq) => {
    const found = MEDICATION_FREQUENCIES.find((f) => f.value === freq);
    return found ? found.label : freq;
  };

  const isActive = (med) => {
    const now = new Date();
    const end = med.end_date ? new Date(med.end_date) : null;
    return !end || end >= now;
  };

  const activeMeds = medications.filter(isActive);
  const pastMeds = medications.filter((m) => !isActive(m));

  return (
    <div className="health-page">
      <SubAppHeader
        title="Médicaments"
        icon="💊"
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
          {showForm ? 'Annuler' : '+ Ajouter un médicament'}
        </button>
      </div>

      {showForm && (
        <form className="health-form" onSubmit={handleSubmit}>
          <div className="health-form-group">
            <label className="health-form-label">Nom du médicament</label>
            <input
              className="health-form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Antibiotique"
              required
            />
          </div>
          <div className="health-form-row">
            <div className="health-form-group">
              <label className="health-form-label">Dosage</label>
              <input
                className="health-form-input"
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="250mg"
                required
              />
            </div>
            <div className="health-form-group">
              <label className="health-form-label">Fréquence</label>
              <select
                className="health-form-select"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                {MEDICATION_FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="health-form-row">
            <div className="health-form-group">
              <label className="health-form-label">Date de début</label>
              <input
                className="health-form-input"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="health-form-group">
              <label className="health-form-label">Date de fin</label>
              <input
                className="health-form-input"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Notes</label>
            <textarea
              className="health-form-textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instructions particulières..."
              rows={2}
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
      ) : (
        <>
          {activeMeds.length > 0 && (
            <div className="medication-section">
              <h3 className="medication-section-title">
                Traitements en cours ({activeMeds.length})
              </h3>
              <div className="health-list">
                {activeMeds.map((med) => (
                  <div key={med.id} className="health-card medication-card medication-active">
                    <div className="medication-header">
                      <h4 className="medication-name">{med.name}</h4>
                      <span className="medication-active-badge">Actif</span>
                    </div>
                    <div className="medication-details">
                      <div className="medication-detail-row">
                        <span className="medication-label">Dosage:</span>
                        <span className="medication-value">{med.dosage}</span>
                      </div>
                      <div className="medication-detail-row">
                        <span className="medication-label">Fréquence:</span>
                        <span className="medication-value">
                          {getFrequencyLabel(med.frequency)}
                        </span>
                      </div>
                      <div className="medication-detail-row">
                        <span className="medication-label">Début:</span>
                        <span className="medication-value">
                          {new Date(med.start_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {med.end_date && (
                        <div className="medication-detail-row">
                          <span className="medication-label">Fin:</span>
                          <span className="medication-value">
                            {new Date(med.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {med.notes && (
                        <div className="medication-notes">{med.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastMeds.length > 0 && (
            <div className="medication-section">
              <h3 className="medication-section-title">
                Historique ({pastMeds.length})
              </h3>
              <div className="health-list">
                {pastMeds.map((med) => (
                  <div key={med.id} className="health-card medication-card medication-past">
                    <div className="medication-header">
                      <h4 className="medication-name">{med.name}</h4>
                      <span className="medication-past-badge">Terminé</span>
                    </div>
                    <div className="medication-details">
                      <div className="medication-detail-row">
                        <span className="medication-label">Dosage:</span>
                        <span className="medication-value">{med.dosage}</span>
                      </div>
                      <div className="medication-detail-row">
                        <span className="medication-label">Période:</span>
                        <span className="medication-value">
                          {new Date(med.start_date).toLocaleDateString('fr-FR')} -{' '}
                          {new Date(med.end_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMeds.length === 0 && pastMeds.length === 0 && (
            <div className="health-empty">
              <span className="health-empty-icon">💊</span>
              <p>Aucun médicament enregistré</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
