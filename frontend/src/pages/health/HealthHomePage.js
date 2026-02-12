import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function HealthHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [records, setRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeDogId) return;
    setLoading(true);
    Promise.all([
      api.request(`/health/records/${activeDogId}`).catch(() => []),
      api.request(`/health/vaccinations/${activeDogId}`).catch(() => []),
      api.request(`/health/appointments/${activeDogId}`).catch(() => []),
    ]).then(([rec, vac, app]) => {
      setRecords(rec);
      setVaccinations(vac);
      setAppointments(app);
      setLoading(false);
    });
  }, [activeDogId]);

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

          <div className="health-sections">
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
              <div className="health-section-icon">🩺</div>
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
