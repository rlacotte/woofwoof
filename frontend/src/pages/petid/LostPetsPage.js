import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function LostPetsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showSightingForm, setShowSightingForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({
    dog_id: '',
    last_seen_address: '',
    description: '',
    contact_phone: '',
  });
  const [sightingForm, setSightingForm] = useState({
    description: '',
    photo_url: '',
  });

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
        setReportForm((prev) => ({ ...prev, dog_id: data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchAlerts = () => {
    setLoading(true);
    api.request('/id/lost')
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => {
        setAlerts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleExpandAlert = async (alertId) => {
    if (expandedId === alertId) {
      setExpandedId(null);
      setExpandedDetails(null);
      return;
    }
    setExpandedId(alertId);
    try {
      const details = await api.request(`/id/lost/${alertId}`);
      setExpandedDetails(details);
    } catch {
      setExpandedDetails(null);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportForm.last_seen_address) return;
    setSubmitting(true);
    try {
      await api.request('/id/lost', {
        method: 'POST',
        body: JSON.stringify({
          ...reportForm,
          dog_id: reportForm.dog_id || activeDogId,
        }),
      });
      setReportForm({
        dog_id: activeDogId || '',
        last_seen_address: '',
        description: '',
        contact_phone: '',
      });
      setShowReportForm(false);
      fetchAlerts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSighting = async (e, alertId) => {
    e.preventDefault();
    if (!sightingForm.description) return;
    setSubmitting(true);
    try {
      await api.request('/id/sightings', {
        method: 'POST',
        body: JSON.stringify({
          lost_alert_id: alertId,
          ...sightingForm,
        }),
      });
      setSightingForm({ description: '', photo_url: '' });
      setShowSightingForm(null);
      // Refresh expanded details
      if (expandedId === alertId) {
        const details = await api.request(`/id/lost/${alertId}`).catch(() => null);
        setExpandedDetails(details);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#f0f0f5',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="lost-pets-page">
      <SubAppHeader
        title="WoofID"
        icon="📡"
        gradient="linear-gradient(135deg, #f12711, #f5af19)"
        onBack={() => navigate('/petid')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 16px 0' }}>
          Animaux perdus
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
            marginBottom: '16px',
          }}>
            Aucune alerte active
          </div>
        ) : (
          alerts.map((alert) => {
            const isExpanded = expandedId === alert.id;

            return (
              <div
                key={alert.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,71,87,0.2)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                }}
              >
                {/* Alert Card */}
                <div
                  onClick={() => handleExpandAlert(alert.id)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Photo */}
                  {alert.photo || alert.photo_url ? (
                    <img
                      src={alert.photo || alert.photo_url}
                      alt={alert.dog_name || 'Chien perdu'}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      background: 'rgba(255,71,87,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0,
                    }}>
                      🐕
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#f0f0f5',
                      fontWeight: 600,
                      fontSize: '15px',
                      marginBottom: '2px',
                    }}>
                      {alert.dog_name || 'Chien inconnu'}
                    </div>
                    {alert.breed && (
                      <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
                        {alert.breed}
                      </div>
                    )}
                    <div style={{
                      color: 'rgba(240,240,245,0.5)',
                      fontSize: '12px',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      📍 {alert.last_seen_address || 'Lieu inconnu'}
                    </div>
                    {alert.date && (
                      <div style={{
                        color: 'rgba(240,240,245,0.4)',
                        fontSize: '11px',
                        marginTop: '2px',
                      }}>
                        {new Date(alert.date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  <span style={{
                    color: 'rgba(240,240,245,0.4)',
                    fontSize: '18px',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                  }}>
                    ›
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && expandedDetails && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px',
                  }}>
                    {expandedDetails.description && (
                      <div style={{
                        color: 'rgba(240,240,245,0.7)',
                        fontSize: '13px',
                        marginBottom: '12px',
                        lineHeight: '1.5',
                      }}>
                        {expandedDetails.description}
                      </div>
                    )}

                    {expandedDetails.contact_phone && (
                      <div style={{
                        color: '#f0f0f5',
                        fontSize: '14px',
                        marginBottom: '16px',
                      }}>
                        📞 Contact : {expandedDetails.contact_phone}
                      </div>
                    )}

                    {/* Sightings */}
                    {expandedDetails.sightings && expandedDetails.sightings.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          color: 'rgba(240,240,245,0.6)',
                          fontSize: '12px',
                          fontWeight: 600,
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Observations ({expandedDetails.sightings.length})
                        </div>
                        {expandedDetails.sightings.map((sighting, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              marginBottom: '6px',
                              fontSize: '13px',
                              color: 'rgba(240,240,245,0.7)',
                            }}
                          >
                            {sighting.description}
                            {sighting.date && (
                              <div style={{
                                color: 'rgba(240,240,245,0.4)',
                                fontSize: '11px',
                                marginTop: '4px',
                              }}>
                                {new Date(sighting.date).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sighting Button */}
                    {showSightingForm !== alert.id ? (
                      <button
                        onClick={() => setShowSightingForm(alert.id)}
                        style={{
                          width: '100%',
                          background: 'rgba(245,175,25,0.15)',
                          border: '1px solid rgba(245,175,25,0.3)',
                          borderRadius: '10px',
                          padding: '10px',
                          color: '#f5af19',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        👁️ Signaler une observation
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleSighting(e, alert.id)} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}>
                        <textarea
                          placeholder="Decrivez votre observation *"
                          value={sightingForm.description}
                          onChange={(e) => setSightingForm({ ...sightingForm, description: e.target.value })}
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          required
                        />
                        <input
                          type="url"
                          placeholder="URL de la photo (optionnel)"
                          value={sightingForm.photo_url}
                          onChange={(e) => setSightingForm({ ...sightingForm, photo_url: e.target.value })}
                          style={inputStyle}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setShowSightingForm(null)}
                            style={{
                              flex: 1,
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '10px',
                              padding: '10px',
                              color: '#f0f0f5',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #f12711, #f5af19)',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: submitting ? 'wait' : 'pointer',
                              fontSize: '13px',
                              opacity: submitting ? 0.6 : 1,
                            }}
                          >
                            {submitting ? 'Envoi...' : 'Envoyer'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Report Lost Dog */}
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          style={{
            width: '100%',
            background: showReportForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #f12711, #f5af19)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {showReportForm ? '✕ Annuler' : '🚨 Signaler mon animal perdu'}
        </button>

        {showReportForm && (
          <form onSubmit={handleReport} style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '20px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {dogs.length > 1 && (
              <select
                value={reportForm.dog_id}
                onChange={(e) => setReportForm({ ...reportForm, dog_id: e.target.value })}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Derniere adresse vue *"
              value={reportForm.last_seen_address}
              onChange={(e) => setReportForm({ ...reportForm, last_seen_address: e.target.value })}
              style={inputStyle}
              required
            />
            <textarea
              placeholder="Description (signes distinctifs, comportement...)"
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <input
              type="tel"
              placeholder="Telephone de contact"
              value={reportForm.contact_phone}
              onChange={(e) => setReportForm({ ...reportForm, contact_phone: e.target.value })}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #f12711, #f5af19)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Envoi...' : 'Publier l\'alerte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
