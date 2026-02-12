import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  content: {
    padding: '16px',
    paddingBottom: '24px',
  },
  filtersCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  filterInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
  },
  filterSelect: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  ageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ageLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    flexShrink: 0,
  },
  ageInput: {
    width: '60px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '8px',
    padding: '6px 8px',
    fontSize: '13px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
    textAlign: 'center',
  },
  ageSeparator: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sheltersLink: {
    background: 'none',
    border: '1px solid rgba(235,51,73,0.4)',
    borderRadius: '20px',
    color: '#f45c43',
    fontSize: '13px',
    fontWeight: '600',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  resultCount: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  listingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  listingCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  listingImage: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
    display: 'block',
    background: 'rgba(255,255,255,0.04)',
  },
  listingImagePlaceholder: {
    width: '100%',
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
  },
  listingInfo: {
    padding: '10px 12px',
  },
  listingName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  listingBreed: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginBottom: '4px',
  },
  listingMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginBottom: '6px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusAvailable: {
    background: 'rgba(86,171,47,0.15)',
    color: '#56ab2f',
  },
  statusPending: {
    background: 'rgba(245,166,35,0.15)',
    color: '#f5a623',
  },
  statusAdopted: {
    background: 'rgba(102,126,234,0.15)',
    color: '#667eea',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
    gridColumn: '1 / -1',
  },
};

export default function AdoptHomePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await api.request('/adopt/listings');
      setListings(data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = listings.filter((l) => {
    if (breed && !(l.breed || '').toLowerCase().includes(breed.toLowerCase())) {
      return false;
    }
    if (sex && l.sex !== sex) {
      return false;
    }
    if (ageMin && (l.age || 0) < parseInt(ageMin, 10)) {
      return false;
    }
    if (ageMax && (l.age || 0) > parseInt(ageMax, 10)) {
      return false;
    }
    return true;
  });

  const getStatusStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
      case 'disponible':
        return styles.statusAvailable;
      case 'pending':
      case 'en attente':
        return styles.statusPending;
      case 'adopted':
      case 'adopte':
        return styles.statusAdopted;
      default:
        return styles.statusAvailable;
    }
  };

  const getStatusLabel = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return 'Disponible';
      case 'pending':
        return 'En attente';
      case 'adopted':
        return 'Adopte';
      default:
        return status || 'Disponible';
    }
  };

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="WoofAdopt"
        icon="💝"
        gradient="linear-gradient(135deg, #eb3349, #f45c43)"
      />

      <div style={styles.content}>
        <div style={styles.filtersCard}>
          <div style={styles.filterRow}>
            <input
              style={styles.filterInput}
              placeholder="Race..."
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
            <select
              style={styles.filterSelect}
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="">Sexe</option>
              <option value="male">Male</option>
              <option value="female">Femelle</option>
            </select>
          </div>
          <div style={styles.ageRow}>
            <span style={styles.ageLabel}>Age :</span>
            <input
              style={styles.ageInput}
              type="number"
              placeholder="Min"
              min="0"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
            />
            <span style={styles.ageSeparator}>a</span>
            <input
              style={styles.ageInput}
              type="number"
              placeholder="Max"
              min="0"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
            />
            <span style={styles.ageLabel}>ans</span>
          </div>
        </div>

        <div style={styles.topBar}>
          <span style={styles.resultCount}>
            {filtered.length} resultat{filtered.length !== 1 ? 's' : ''}
          </span>
          <button
            style={styles.sheltersLink}
            onClick={() => navigate('/adopt/shelters')}
          >
            🏠 Refuges
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Chargement des annonces...</div>
        ) : (
          <div style={styles.listingsGrid}>
            {filtered.length === 0 ? (
              <div style={styles.empty}>Aucune annonce trouvee</div>
            ) : (
              filtered.map((listing) => (
                <div
                  key={listing.id}
                  style={styles.listingCard}
                  onClick={() => navigate(`/adopt/listing/${listing.id}`)}
                >
                  {listing.photo_url ? (
                    <img
                      src={listing.photo_url}
                      alt={listing.name}
                      style={styles.listingImage}
                    />
                  ) : (
                    <div style={styles.listingImagePlaceholder}>🐕</div>
                  )}
                  <div style={styles.listingInfo}>
                    <div style={styles.listingName}>{listing.name}</div>
                    <div style={styles.listingBreed}>{listing.breed}</div>
                    <div style={styles.listingMeta}>
                      <span>{listing.age ? `${listing.age} ans` : ''}</span>
                      <span>{listing.sex === 'male' ? 'Male' : listing.sex === 'female' ? 'Femelle' : ''}</span>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(listing.status),
                      }}
                    >
                      {getStatusLabel(listing.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
