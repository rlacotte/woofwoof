import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '4/3',
    background: 'rgba(255,255,255,0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '72px',
  },
  photoNav: {
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '6px',
  },
  photoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
  },
  photoDotActive: {
    background: '#fff',
  },
  content: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  name: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  detailItem: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '10px',
    padding: '10px 12px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  detailLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
  },
  compatBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  compatBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  compatGood: {
    background: 'rgba(86,171,47,0.15)',
    color: '#56ab2f',
  },
  compatBad: {
    background: 'rgba(255,77,109,0.15)',
    color: '#ff4d6d',
  },
  descriptionCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '14px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '8px',
    color: 'var(--text, #f0f0f5)',
  },
  descriptionText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  shelterCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '14px',
    cursor: 'pointer',
  },
  shelterName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  shelterCity: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  shelterArrow: {
    fontSize: '14px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    float: 'right',
    marginTop: '-20px',
  },
  adoptForm: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textarea: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #eb3349, #f45c43)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  successMsg: {
    background: 'rgba(86,171,47,0.15)',
    border: '1px solid rgba(86,171,47,0.3)',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    color: '#56ab2f',
    textAlign: 'center',
  },
  errorMsg: {
    background: 'rgba(255,77,109,0.15)',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#ff4d6d',
  },
};

export default function ListingPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/adopt/listings/${listingId}`);
      setListing(data);
    } catch (err) {
      console.error('Failed to load listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      setError('');
      await api.request('/adopt/request', {
        method: 'POST',
        body: { listing_id: listingId, message: message.trim() },
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      setError("Erreur lors de l'envoi. Veuillez reessayer.");
      console.error('Failed to submit request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Annonce"
          icon="💝"
          gradient="linear-gradient(135deg, #eb3349, #f45c43)"
          onBack={() => navigate('/adopt')}
        />
        <div style={styles.loading}>Chargement...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Annonce"
          icon="💝"
          gradient="linear-gradient(135deg, #eb3349, #f45c43)"
          onBack={() => navigate('/adopt')}
        />
        <div style={styles.loading}>Annonce introuvable</div>
      </div>
    );
  }

  const photos = listing.photos || (listing.photo_url ? [listing.photo_url] : []);

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Annonce"
        icon="💝"
        gradient="linear-gradient(135deg, #eb3349, #f45c43)"
        onBack={() => navigate('/adopt')}
      />

      <div style={styles.imageContainer}>
        {photos.length > 0 ? (
          <img src={photos[activePhoto]} alt={listing.name} style={styles.mainImage} />
        ) : (
          <div style={styles.imagePlaceholder}>🐕</div>
        )}
        {photos.length > 1 && (
          <div style={styles.photoNav}>
            {photos.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.photoDot,
                  ...(idx === activePhoto ? styles.photoDotActive : {}),
                }}
                onClick={() => setActivePhoto(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.name}>{listing.name}</div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Race</div>
            <div style={styles.detailValue}>{listing.breed || 'Inconnue'}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Age</div>
            <div style={styles.detailValue}>{listing.age ? `${listing.age} ans` : 'Inconnu'}</div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Sexe</div>
            <div style={styles.detailValue}>
              {listing.sex === 'male' ? 'Male' : listing.sex === 'female' ? 'Femelle' : 'Inconnu'}
            </div>
          </div>
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Poids</div>
            <div style={styles.detailValue}>
              {listing.weight ? `${listing.weight} kg` : 'Inconnu'}
            </div>
          </div>
        </div>

        {listing.temperament && (
          <div style={styles.detailItem}>
            <div style={styles.detailLabel}>Temperament</div>
            <div style={styles.detailValue}>{listing.temperament}</div>
          </div>
        )}

        <div style={styles.compatBadges}>
          <span
            style={{
              ...styles.compatBadge,
              ...(listing.good_with_kids ? styles.compatGood : styles.compatBad),
            }}
          >
            {listing.good_with_kids ? '✓' : '✗'} Enfants
          </span>
          <span
            style={{
              ...styles.compatBadge,
              ...(listing.good_with_cats ? styles.compatGood : styles.compatBad),
            }}
          >
            {listing.good_with_cats ? '✓' : '✗'} Chats
          </span>
          <span
            style={{
              ...styles.compatBadge,
              ...(listing.good_with_dogs ? styles.compatGood : styles.compatBad),
            }}
          >
            {listing.good_with_dogs ? '✓' : '✗'} Chiens
          </span>
        </div>

        {listing.description && (
          <div style={styles.descriptionCard}>
            <div style={styles.sectionTitle}>Description</div>
            <div style={styles.descriptionText}>{listing.description}</div>
          </div>
        )}

        {listing.shelter && (
          <div
            style={styles.shelterCard}
            onClick={() =>
              navigate(`/adopt/shelters${listing.shelter.id ? `?highlight=${listing.shelter.id}` : ''}`)
            }
          >
            <div style={styles.sectionTitle}>Refuge</div>
            <div style={styles.shelterName}>{listing.shelter.name}</div>
            <div style={styles.shelterCity}>{listing.shelter.city}</div>
            <div style={styles.shelterArrow}>→</div>
          </div>
        )}

        {submitted ? (
          <div style={styles.successMsg}>
            Votre demande d'adoption a ete envoyee avec succes ! Le refuge vous contactera prochainement.
          </div>
        ) : (
          <form style={styles.adoptForm} onSubmit={handleSubmitRequest}>
            <div style={styles.sectionTitle}>Demander l'adoption</div>
            {error && <div style={styles.errorMsg}>{error}</div>}
            <textarea
              style={styles.textarea}
              placeholder="Presentez-vous et expliquez pourquoi vous souhaitez adopter ce compagnon..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(!message.trim() || submitting ? styles.submitBtnDisabled : {}),
              }}
              disabled={!message.trim() || submitting}
            >
              {submitting ? 'Envoi...' : "Demander l'adoption"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
