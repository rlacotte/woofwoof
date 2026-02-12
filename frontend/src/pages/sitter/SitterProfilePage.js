import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function SitterProfilePage() {
  const navigate = useNavigate();
  const { sitterId } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    service_type: 'garde',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState(null);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setSelectedDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sitterId) return;
    setLoading(true);
    api.request(`/sitters/${sitterId}`)
      .then((data) => {
        setSitter(data);
        setLoading(false);
      })
      .catch(() => {
        setSitter(null);
        setLoading(false);
      });
  }, [sitterId]);

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDogId) {
      alert('Veuillez selectionner un chien');
      return;
    }
    setSubmitting(true);
    try {
      await api.request('/sitters/book', {
        method: 'POST',
        body: JSON.stringify({
          sitter_id: sitterId,
          dog_id: selectedDogId,
          ...bookingData,
        }),
      });
      setShowBookingForm(false);
      setBookingData({
        service_type: 'garde',
        start_date: '',
        end_date: '',
        notes: '',
      });
      alert('Reservation envoyee avec succes !');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => {
    const r = rating || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="sitter-profile-stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
        <span className="sitter-profile-rating-num">({r.toFixed(1)})</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="sitter-page">
        <SubAppHeader
          title="Profil"
          icon="🏠"
          gradient="linear-gradient(135deg, #f093fb, #f5576c)"
          onBack={() => navigate('/sitter')}
        />
        <div className="sitter-loading">Chargement...</div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="sitter-page">
        <SubAppHeader
          title="Profil"
          icon="🏠"
          gradient="linear-gradient(135deg, #f093fb, #f5576c)"
          onBack={() => navigate('/sitter')}
        />
        <div className="sitter-empty">
          <p>Pet-sitter introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sitter-page">
      <SubAppHeader
        title={sitter.name || 'Profil'}
        icon="🏠"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/sitter')}
      />

      <div className="sitter-profile-header">
        {sitter.photo ? (
          <img
            src={sitter.photo}
            alt={sitter.name}
            className="sitter-profile-photo"
          />
        ) : (
          <div className="sitter-profile-avatar">
            {(sitter.name || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="sitter-profile-name">{sitter.name}</h2>
        {sitter.rating !== undefined && sitter.rating !== null && (
          renderStars(sitter.rating)
        )}
      </div>

      <div className="sitter-profile-details">
        {sitter.bio && (
          <div className="sitter-profile-section">
            <h3 className="sitter-profile-section-title">A propos</h3>
            <p className="sitter-profile-bio">{sitter.bio}</p>
          </div>
        )}

        {sitter.experience && (
          <div className="sitter-profile-section">
            <h3 className="sitter-profile-section-title">Experience</h3>
            <p className="sitter-profile-experience">{sitter.experience}</p>
          </div>
        )}

        <div className="sitter-profile-info-grid">
          {sitter.rate_per_hour !== undefined && sitter.rate_per_hour !== null && (
            <div className="sitter-profile-info-item">
              <span className="sitter-profile-info-label">Tarif</span>
              <span className="sitter-profile-info-value">
                {sitter.rate_per_hour} EUR/h
              </span>
            </div>
          )}
          <div className="sitter-profile-info-item">
            <span className="sitter-profile-info-label">Jardin</span>
            <span className="sitter-profile-info-value">
              {sitter.has_garden ? '🌿 Oui' : 'Non'}
            </span>
          </div>
        </div>

        {sitter.services && Array.isArray(sitter.services) && sitter.services.length > 0 && (
          <div className="sitter-profile-section">
            <h3 className="sitter-profile-section-title">Services proposes</h3>
            <div className="sitter-profile-services">
              {sitter.services.map((service, idx) => (
                <span key={idx} className="sitter-profile-service-badge">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {sitter.reviews && Array.isArray(sitter.reviews) && sitter.reviews.length > 0 && (
          <div className="sitter-profile-section">
            <h3 className="sitter-profile-section-title">
              Avis ({sitter.reviews.length})
            </h3>
            <div className="sitter-reviews-list">
              {sitter.reviews.map((review, idx) => (
                <div key={idx} className="sitter-review-card">
                  <div className="sitter-review-header">
                    <span className="sitter-review-author">
                      {review.author || 'Anonyme'}
                    </span>
                    <span className="sitter-review-stars">
                      {'★'.repeat(Math.floor(review.rating || 0))}
                      {'☆'.repeat(5 - Math.floor(review.rating || 0))}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="sitter-review-comment">{review.comment}</p>
                  )}
                  {review.date && (
                    <span className="sitter-review-date">
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sitter-profile-cta">
        <button
          className="sitter-book-btn"
          onClick={() => setShowBookingForm(!showBookingForm)}
        >
          {showBookingForm ? 'Annuler' : 'Reserver'}
        </button>
      </div>

      {showBookingForm && (
        <form className="sitter-booking-form" onSubmit={handleBookingSubmit}>
          <h4 className="sitter-booking-title">Demande de reservation</h4>

          {dogs.length > 1 && (
            <div className="sitter-form-group">
              <label className="sitter-form-label">Chien</label>
              <select
                className="sitter-form-select"
                value={selectedDogId || ''}
                onChange={(e) => setSelectedDogId(e.target.value)}
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sitter-form-group">
            <label className="sitter-form-label">Type de service</label>
            <select
              className="sitter-form-select"
              name="service_type"
              value={bookingData.service_type}
              onChange={handleBookingChange}
            >
              <option value="garde">Garde</option>
              <option value="promenade">Promenade</option>
              <option value="visite">Visite</option>
              <option value="pension">Pension</option>
              <option value="toilettage">Toilettage</option>
            </select>
          </div>

          <div className="sitter-form-group">
            <label className="sitter-form-label">Date de debut</label>
            <input
              className="sitter-form-input"
              type="datetime-local"
              name="start_date"
              value={bookingData.start_date}
              onChange={handleBookingChange}
              required
            />
          </div>

          <div className="sitter-form-group">
            <label className="sitter-form-label">Date de fin</label>
            <input
              className="sitter-form-input"
              type="datetime-local"
              name="end_date"
              value={bookingData.end_date}
              onChange={handleBookingChange}
              required
            />
          </div>

          <div className="sitter-form-group">
            <label className="sitter-form-label">Notes</label>
            <textarea
              className="sitter-form-textarea"
              name="notes"
              value={bookingData.notes}
              onChange={handleBookingChange}
              placeholder="Instructions particulieres, allergies, habitudes..."
              rows={3}
            />
          </div>

          <button
            className="sitter-form-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      )}
    </div>
  );
}
