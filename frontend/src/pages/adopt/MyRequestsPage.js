import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.get('/api/adopt/my-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(245, 166, 35, 0.15)', color: '#f5a623', label: 'En attente' };
      case 'approved':
        return { bg: 'rgba(46, 213, 115, 0.2)', color: '#2ed573', label: 'Approuvée' };
      case 'rejected':
        return { bg: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', label: 'Refusée' };
      default:
        return { bg: 'rgba(245, 166, 35, 0.15)', color: '#f5a623', label: 'En attente' };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="adopt-requests-page">
      <SubAppHeader
        title="Mes Demandes"
        icon="💝"
        gradient="linear-gradient(135deg, #eb3349, #f45c43)"
        onBack={() => navigate('/adopt')}
      />

      <div className="adopt-requests-content">
        {loading ? (
          <div className="adopt-requests-loading">
            <div className="adopt-requests-loading-spinner">🐕</div>
            <p>Chargement...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="adopt-requests-empty">
            <div className="adopt-requests-empty-icon">💝</div>
            <h3 className="adopt-requests-empty-title">Aucune demande</h3>
            <p className="adopt-requests-empty-text">
              Vous n'avez pas encore fait de demande d'adoption
            </p>
            <button
              className="adopt-requests-browse-btn"
              onClick={() => navigate('/adopt')}
            >
              Parcourir les annonces
            </button>
          </div>
        ) : (
          <div className="adopt-requests-list">
            {requests.map((request) => {
              const statusStyle = getStatusStyle(request.status);
              return (
                <div
                  key={request.id}
                  className="adopt-request-card"
                  onClick={() => navigate(`/adopt/listing/${request.listing_id}`)}
                >
                  <div className="adopt-request-header">
                    {request.animal_photo ? (
                      <img
                        src={request.animal_photo}
                        alt={request.animal_name}
                        className="adopt-request-photo"
                      />
                    ) : (
                      <div className="adopt-request-photo-placeholder">🐕</div>
                    )}
                    <div className="adopt-request-info">
                      <h3 className="adopt-request-name">{request.animal_name}</h3>
                      <p className="adopt-request-breed">{request.animal_breed}</p>
                      {request.shelter_name && (
                        <p className="adopt-request-shelter">
                          🏠 {request.shelter_name}
                          {request.shelter_city && ` • ${request.shelter_city}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="adopt-request-status"
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {statusStyle.label}
                  </div>

                  {request.message && (
                    <div className="adopt-request-message">
                      <div className="adopt-request-message-label">Votre message :</div>
                      <p className="adopt-request-message-text">{request.message}</p>
                    </div>
                  )}

                  <div className="adopt-request-date">
                    Demandé le {formatDate(request.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
