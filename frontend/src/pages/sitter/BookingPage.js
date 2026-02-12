import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const STATUS_STYLES = {
  pending: { bg: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', label: 'En attente' },
  confirmed: { bg: 'rgba(46, 213, 115, 0.2)', color: '#2ed573', label: 'Confirmee' },
  completed: { bg: 'rgba(72, 198, 239, 0.2)', color: '#48c6ef', label: 'Terminee' },
  cancelled: { bg: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', label: 'Annulee' },
};

export default function BookingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mine');
  const [myBookings, setMyBookings] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMyBookings = () => {
    setLoadingMine(true);
    api.request('/sitters/bookings/mine')
      .then((data) => {
        setMyBookings(Array.isArray(data) ? data : []);
        setLoadingMine(false);
      })
      .catch(() => {
        setMyBookings([]);
        setLoadingMine(false);
      });
  };

  const fetchReceivedRequests = () => {
    setLoadingRequests(true);
    api.request('/sitters/bookings/requests')
      .then((data) => {
        setReceivedRequests(Array.isArray(data) ? data : []);
        setLoadingRequests(false);
      })
      .catch(() => {
        setReceivedRequests([]);
        setLoadingRequests(false);
      });
  };

  useEffect(() => {
    fetchMyBookings();
    fetchReceivedRequests();
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      await api.request(`/sitters/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchReceivedRequests();
      fetchMyBookings();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setUpdatingId(null);
  };

  const getStatus = (status) => {
    return STATUS_STYLES[status] || STATUS_STYLES.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (start, end) => {
    const s = formatDate(start);
    const e = formatDate(end);
    if (s === e) return s;
    return `${s} - ${e}`;
  };

  const renderBookingCard = (booking, isRequest) => {
    const statusStyle = getStatus(booking.status);
    return (
      <div key={booking.id} className="sitter-booking-card">
        <div className="sitter-booking-header">
          <div className="sitter-booking-title-row">
            <span className="sitter-booking-dog-name">
              🐕 {booking.dog_name || 'Chien'}
            </span>
            <span
              className="sitter-booking-status-badge"
              style={{
                background: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {statusStyle.label}
            </span>
          </div>
        </div>

        <div className="sitter-booking-body">
          <div className="sitter-booking-detail">
            <span className="sitter-booking-label">Service</span>
            <span className="sitter-booking-value">
              {booking.service_type || '-'}
            </span>
          </div>
          <div className="sitter-booking-detail">
            <span className="sitter-booking-label">Dates</span>
            <span className="sitter-booking-value">
              {formatDateRange(booking.start_date, booking.end_date)}
            </span>
          </div>
          <div className="sitter-booking-detail">
            <span className="sitter-booking-label">
              {isRequest ? 'Proprietaire' : 'Pet-sitter'}
            </span>
            <span className="sitter-booking-value">
              {isRequest
                ? booking.owner_name || '-'
                : booking.sitter_name || '-'}
            </span>
          </div>
          {booking.notes && (
            <div className="sitter-booking-notes">
              <span className="sitter-booking-label">Notes</span>
              <p className="sitter-booking-notes-text">{booking.notes}</p>
            </div>
          )}
        </div>

        {isRequest && booking.status === 'pending' && (
          <div className="sitter-booking-actions">
            <button
              className="sitter-booking-confirm-btn"
              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              disabled={updatingId === booking.id}
            >
              {updatingId === booking.id ? '...' : 'Confirmer'}
            </button>
            <button
              className="sitter-booking-cancel-btn"
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              disabled={updatingId === booking.id}
            >
              {updatingId === booking.id ? '...' : 'Refuser'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentBookings = activeTab === 'mine' ? myBookings : receivedRequests;
  const currentLoading = activeTab === 'mine' ? loadingMine : loadingRequests;

  return (
    <div className="sitter-page">
      <SubAppHeader
        title="Reservations"
        icon="📋"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/sitter')}
      />

      <div className="sitter-tabs">
        <button
          className={`sitter-tab ${activeTab === 'mine' ? 'sitter-tab-active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          Mes reservations
        </button>
        <button
          className={`sitter-tab ${activeTab === 'requests' ? 'sitter-tab-active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Demandes recues
        </button>
      </div>

      {currentLoading ? (
        <div className="sitter-loading">Chargement...</div>
      ) : currentBookings.length === 0 ? (
        <div className="sitter-empty">
          <span className="sitter-empty-icon">📋</span>
          <p>
            {activeTab === 'mine'
              ? 'Aucune reservation'
              : 'Aucune demande recue'}
          </p>
        </div>
      ) : (
        <div className="sitter-bookings-list">
          {currentBookings.map((booking) =>
            renderBookingCard(booking, activeTab === 'requests')
          )}
        </div>
      )}
    </div>
  );
}
