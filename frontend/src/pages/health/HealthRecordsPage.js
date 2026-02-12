import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function HealthRecordsPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    record_type: 'consultation',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vet_name: '',
    document_url: '',
  });

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (activeDogId) {
      loadRecords();
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

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/health/records/${activeDogId}`);
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.description.trim()) return;

    try {
      await api.request('/health/records', {
        method: 'POST',
        body: {
          dog_id: activeDogId,
          ...newRecord,
        },
      });
      setShowAddModal(false);
      setNewRecord({
        record_type: 'consultation',
        date: new Date().toISOString().split('T')[0],
        description: '',
        vet_name: '',
        document_url: '',
      });
      loadRecords();
    } catch (err) {
      console.error('Failed to add record:', err);
      alert('Erreur lors de l\'ajout de l\'enregistrement');
    }
  };

  const getRecordIcon = (type) => {
    const icons = {
      consultation: '🩺',
      surgery: '🏥',
      test: '🔬',
      injury: '🤕',
      allergy: '🌸',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  const getRecordLabel = (type) => {
    const labels = {
      consultation: 'Consultation',
      surgery: 'Chirurgie',
      test: 'Examen',
      injury: 'Blessure',
      allergy: 'Allergie',
      other: 'Autre',
    };
    return labels[type] || 'Autre';
  };

  const groupedRecords = records.reduce((acc, record) => {
    const year = new Date(record.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedRecords).sort((a, b) => b - a);

  return (
    <div className="health-page">
      <SubAppHeader
        title="Carnet de Santé"
        icon="📋"
        gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        onBack={() => navigate('/health')}
      />

      <div className="health-dog-selector">
        {dogs.length > 0 && (
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
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <button
          className="walk-action-btn walk-action-primary"
          style={{ width: '100%', marginBottom: '20px' }}
          onClick={() => setShowAddModal(true)}
        >
          + Ajouter un Enregistrement
        </button>

        {loading ? (
          <div className="health-loading">Chargement...</div>
        ) : records.length === 0 ? (
          <div className="health-empty-state">
            <div className="health-empty-icon">📋</div>
            <p>Aucun enregistrement de santé</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Ajoutez votre premier enregistrement pour suivre la santé de votre chien
            </p>
          </div>
        ) : (
          <div className="health-records-timeline">
            {sortedYears.map((year) => (
              <div key={year} className="health-records-year">
                <div className="health-records-year-label">{year}</div>
                <div className="health-records-list">
                  {groupedRecords[year]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record) => (
                      <div key={record.id} className="health-record-card">
                        <div className="health-record-date">
                          {new Date(record.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                        <div className="health-record-content">
                          <div className="health-record-header">
                            <span className="health-record-icon">
                              {getRecordIcon(record.record_type)}
                            </span>
                            <span className="health-record-type">
                              {getRecordLabel(record.record_type)}
                            </span>
                          </div>
                          <div className="health-record-description">
                            {record.description}
                          </div>
                          {record.vet_name && (
                            <div className="health-record-vet">
                              🩺 {record.vet_name}
                            </div>
                          )}
                          {record.document_url && (
                            <a
                              href={record.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="health-record-document"
                            >
                              📎 Voir le document
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="health-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="health-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>
              Nouvel Enregistrement
            </h3>

            <div className="health-form-group">
              <label>Type</label>
              <select
                value={newRecord.record_type}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, record_type: e.target.value })
                }
                className="health-form-select"
              >
                <option value="consultation">Consultation</option>
                <option value="surgery">Chirurgie</option>
                <option value="test">Examen</option>
                <option value="injury">Blessure</option>
                <option value="allergy">Allergie</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="health-form-group">
              <label>Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, date: e.target.value })
                }
                className="health-form-input"
              />
            </div>

            <div className="health-form-group">
              <label>Description</label>
              <textarea
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
                className="health-form-textarea"
                placeholder="Décrivez l'événement de santé..."
                rows={4}
              />
            </div>

            <div className="health-form-group">
              <label>Vétérinaire (optionnel)</label>
              <input
                type="text"
                value={newRecord.vet_name}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, vet_name: e.target.value })
                }
                className="health-form-input"
                placeholder="Nom du vétérinaire"
              />
            </div>

            <div className="health-form-group">
              <label>Document URL (optionnel)</label>
              <input
                type="url"
                value={newRecord.document_url}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, document_url: e.target.value })
                }
                className="health-form-input"
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="walk-action-btn walk-action-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button
                className="walk-action-btn walk-action-primary"
                style={{ flex: 1 }}
                onClick={handleAddRecord}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
