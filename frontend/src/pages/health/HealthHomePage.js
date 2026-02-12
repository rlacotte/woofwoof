import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function HealthHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (activeDogId) {
      loadData();
    }
  }, [activeDogId]);

  const loadDogs = async () => {
    try {
      const dogsData = await api.request('/dogs');
      setDogs(dogsData || []);
      if (dogsData && dogsData.length > 0) {
        setActiveDogId(dogsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load dogs:', err);
    }
  };

  const loadData = async () => {
    if (!activeDogId) return;
    setLoading(true);
    try {
      const [rec, vac, app, vetData] = await Promise.all([
        api.request(`/health/records/${activeDogId}`).catch(() => []),
        api.request(`/health/vaccinations/${activeDogId}`).catch(() => []),
        api.request(`/health/appointments/${activeDogId}`).catch(() => []),
        api.request(`/dogs/${activeDogId}/vet`).catch(() => null),
      ]);
      setRecords(rec);
      setVaccinations(vac);
      setAppointments(app);
      setVet(vetData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const overdueVaccines = vaccinations.filter(
    (v) => v.next_due && new Date(v.next_due) < now
  ).length;

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'scheduled' && new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  return (
    <div className="health-page">
      <SubAppHeader
        title="WoofHealth"
        icon="🏥"
        gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        onBack={() => navigate('/')}
      />

      {dogs.length > 0 && (
        <div className="health-dog-selector">
          <select
            className="health-dog-select"
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(parseInt(e.target.value))}
          >
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="health-loading">Chargement...</div>
      ) : (
        <>
          <div className="health-stats-row">
            <div className="health-stat-card">
              <span className="health-stat-icon">📅</span>
              <div className="health-stat-info">
                <span className="health-stat-label">Prochain RDV</span>
                <span className="health-stat-value">
                  {nextAppointment
                    ? new Date(nextAppointment.date).toLocaleDateString('fr-FR')
                    : 'Aucun'}
                </span>
              </div>
            </div>
            <div className="health-stat-card">
              <span className="health-stat-icon">💉</span>
              <div className="health-stat-info">
                <span className="health-stat-label">Vaccins en retard</span>
                <span
                  className="health-stat-value"
                  style={{ color: overdueVaccines > 0 ? '#ff4757' : '#2ed573' }}
                >
                  {overdueVaccines}
                </span>
              </div>
            </div>
          </div>

          <div className="health-header-actions" style={{ padding: '0 16px', paddingBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="health-quick-link"
              onClick={() => navigate('/health/symptoms')}
            >
              🩺 Vérificateur de Symptômes
            </button>
            <button
              className="health-quick-link"
              onClick={() => navigate('/health/stats')}
            >
              📊 Statistiques
            </button>
            <button
              className="health-quick-link"
              onClick={() => navigate('/health/medications')}
            >
              💊 Médicaments
            </button>
            <button
              className="health-quick-link"
              onClick={() => navigate(`/health/vets?dogId=${activeDogId}`)}
            >
              🔎 Trouver un Vétérinaire
            </button>
          </div>

          <div className="health-sections">
            {/* My Vet Card */}
            <div className="health-section-card">
              <div className="health-section-icon">🩺</div>
              <div className="health-section-content">
                <h3 className="health-section-title">Mon Vétérinaire</h3>
                {vet ? (
                  <div>
                    <p className="health-section-desc" style={{ fontWeight: 600, color: 'var(--text)' }}>{vet.name}</p>
                    <p className="health-section-desc">{vet.city}</p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <a href={`tel:${vet.phone}`} className="walk-action-btn walk-action-secondary" style={{ padding: '4px 12px', fontSize: '12px', textDecoration: 'none' }}>Appeler</a>
                      <button onClick={() => navigate(`/health/vets?lat=${vet.latitude}&lng=${vet.longitude}`)} className="walk-action-btn walk-action-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Voir Carte</button>
                    </div>
                  </div>
                ) : (
                  <p className="health-section-desc">Aucun vétérinaire assigné</p>
                )}
              </div>
              {!vet && <span className="health-section-arrow" onClick={() => navigate(`/health/vets?dogId=${activeDogId}`)}>&rsaquo;</span>}
            </div>

            <div
              className="health-section-card"
              onClick={() => navigate(`/health/records`)}
            >
              <div className="health-section-icon">📋</div>
              <div className="health-section-content">
                <h3 className="health-section-title">Carnet de sant&eacute;</h3>
                <p className="health-section-desc">
                  {records.length} enregistrement{records.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="health-section-arrow">&rsaquo;</span>
            </div>

            <div
              className="health-section-card"
              onClick={() => navigate('/health/vaccinations')}
            >
              <div className="health-section-icon">💉</div>
              <div className="health-section-content">
                <h3 className="health-section-title">Vaccinations</h3>
                <p className="health-section-desc">
                  {vaccinations.length} vaccin{vaccinations.length !== 1 ? 's' : ''}
                  {overdueVaccines > 0 && (
                    <span className="health-overdue-badge">
                      {overdueVaccines} en retard
                    </span>
                  )}
                </p>
              </div>
              <span className="health-section-arrow">&rsaquo;</span>
            </div>

            <div
              className="health-section-card"
              onClick={() => navigate('/health/appointments')}
            >
              <div className="health-section-icon">⏱️</div>
              <div className="health-section-content">
                <h3 className="health-section-title">Rendez-vous</h3>
                <p className="health-section-desc">
                  {upcomingAppointments.length} rendez-vous planifi&eacute;
                  {upcomingAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="health-section-arrow">&rsaquo;</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

