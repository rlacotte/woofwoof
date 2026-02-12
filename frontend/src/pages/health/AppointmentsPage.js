import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Bilan de sante' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Chirurgie' },
  { value: 'grooming', label: 'Toilettage' },
];

const STATUS_STYLES = {
  scheduled: { bg: 'rgba(72, 198, 239, 0.2)', color: '#48c6ef', label: 'Planifie' },
  completed: { bg: 'rgba(46, 213, 115, 0.2)', color: '#2ed573', label: 'Termine' },
  cancelled: { bg: 'rgba(160, 160, 160, 0.2)', color: '#a0a0a0', label: 'Annule' },
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vet_name: '',
    date: '',
    appointment_type: 'checkup',
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

  const fetchAppointments = (dogId) => {
    if (!dogId) return;
    setLoading(true);
    api.request(`/health/appointments/${dogId}`)
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => {
        setAppointments([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments(activeDogId);
  }, [activeDogId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request('/health/appointments', {
        method: 'POST',
        body: JSON.stringify({ ...formData, dog_id: activeDogId }),
      });
      setFormData({ vet_name: '', date: '', appointment_type: 'checkup', notes: '' });
      setShowForm(false);
      fetchAppointments(activeDogId);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const getTypeLabel = (type) => {
    const found = APPOINTMENT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getStatus = (status) => {
    return STATUS_STYLES[status] || STATUS_STYLES.scheduled;
  };

  return (
    <div className="health-page">
      <SubAppHeader
        title="Rendez-vous"
        icon="🩺"
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
          {showForm ? 'Annuler' : '+ Nouveau rendez-vous'}
        </button>
      </div>

      {showForm && (
        <form className="health-form" onSubmit={handleSubmit}>
          <div className="health-form-group">
            <label className="health-form-label">V&eacute;t&eacute;rinaire</label>
            <input
              className="health-form-input"
              type="text"
              name="vet_name"
              value={formData.vet_name}
              onChange={handleChange}
              placeholder="Dr. Dupont"
              required
            />
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Date et heure</label>
            <input
              className="health-form-input"
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Type de rendez-vous</label>
            <select
              className="health-form-select"
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleChange}
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="health-form-group">
            <label className="health-form-label">Notes</label>
            <textarea
              className="health-form-textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes supplementaires..."
              rows={3}
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
      ) : appointments.length === 0 ? (
        <div className="health-empty">
          <span className="health-empty-icon">🩺</span>
          <p>Aucun rendez-vous enregistr&eacute;</p>
        </div>
      ) : (
        <div className="health-list">
          {appointments.map((appt, idx) => {
            const statusStyle = getStatus(appt.status);
            return (
              <div key={appt.id || idx} className="health-card appointment-card">
                <div className="appointment-header">
                  <div className="appointment-date-block">
                    <span className="appointment-date">
                      {new Date(appt.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="appointment-time">
                      {new Date(appt.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span
                    className="appointment-status-badge"
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>
                <div className="appointment-body">
                  <div className="appointment-type-badge">
                    {getTypeLabel(appt.appointment_type)}
                  </div>
                  {appt.vet_name && (
                    <p className="appointment-vet">
                      <span className="appointment-label">Vet:</span> {appt.vet_name}
                    </p>
                  )}
                  {appt.notes && (
                    <p className="appointment-notes">{appt.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
