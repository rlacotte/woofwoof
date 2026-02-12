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
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  shelterCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  shelterCardExpanded: {
    border: '1px solid rgba(235,51,73,0.3)',
  },
  shelterTop: {
    display: 'flex',
    gap: '12px',
    padding: '14px',
  },
  shelterPhoto: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  shelterPhotoPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  },
  shelterInfo: {
    flex: 1,
    minWidth: 0,
  },
  shelterName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  shelterCity: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  shelterDescription: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  shelterContact: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  expandedSection: {
    borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '14px',
  },
  expandedTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px',
    color: 'var(--text, #f0f0f5)',
  },
  expandedDescription: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  expandedContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '14px',
  },
  contactItem: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  listingsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: 'var(--text, #f0f0f5)',
  },
  shelterListings: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollbarWidth: 'none',
  },
  miniListingCard: {
    flexShrink: 0,
    width: '120px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  miniListingImage: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    display: 'block',
    background: 'rgba(255,255,255,0.04)',
  },
  miniListingPlaceholder: {
    width: '100%',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    background: 'rgba(255,255,255,0.04)',
  },
  miniListingInfo: {
    padding: '6px 8px',
  },
  miniListingName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  miniListingBreed: {
    fontSize: '10px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  noListings: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
};

export default function SheltersPage() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [shelterListings, setShelterListings] = useState({});

  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const data = await api.request('/adopt/shelters');
      setShelters(data || []);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (shelterId) => {
    if (expandedId === shelterId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(shelterId);
    if (!shelterListings[shelterId]) {
      try {
        const data = await api.request(`/adopt/shelters/${shelterId}`);
        setShelterListings((prev) => ({
          ...prev,
          [shelterId]: data?.listings || [],
        }));
      } catch (err) {
        console.error('Failed to load shelter detail:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Refuges"
          icon="💝"
          gradient="linear-gradient(135deg, #eb3349, #f45c43)"
          onBack={() => navigate('/adopt')}
        />
        <div style={styles.loading}>Chargement des refuges...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Refuges"
        icon="💝"
        gradient="linear-gradient(135deg, #eb3349, #f45c43)"
        onBack={() => navigate('/adopt')}
      />

      <div style={styles.content}>
        {shelters.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🏠</div>
            <div>Aucun refuge enregistre</div>
          </div>
        ) : (
          shelters.map((shelter) => {
            const isExpanded = expandedId === shelter.id;
            const listings = shelterListings[shelter.id] || [];

            return (
              <div
                key={shelter.id}
                style={{
                  ...styles.shelterCard,
                  ...(isExpanded ? styles.shelterCardExpanded : {}),
                }}
              >
                <div style={styles.shelterTop} onClick={() => toggleExpand(shelter.id)}>
                  {shelter.photo_url ? (
                    <img
                      src={shelter.photo_url}
                      alt={shelter.name}
                      style={styles.shelterPhoto}
                    />
                  ) : (
                    <div style={styles.shelterPhotoPlaceholder}>🏠</div>
                  )}
                  <div style={styles.shelterInfo}>
                    <div style={styles.shelterName}>{shelter.name}</div>
                    <div style={styles.shelterCity}>
                      📍 {shelter.city || 'Lieu inconnu'}
                    </div>
                    {shelter.description && (
                      <div style={styles.shelterDescription}>
                        {shelter.description}
                      </div>
                    )}
                    {shelter.contact && !isExpanded && (
                      <div style={styles.shelterContact}>
                        <span>{shelter.contact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.expandedSection}>
                    {shelter.description && (
                      <div style={styles.expandedDescription}>
                        {shelter.description}
                      </div>
                    )}

                    <div style={styles.expandedContact}>
                      {shelter.contact && (
                        <div style={styles.contactItem}>
                          📞 {shelter.contact}
                        </div>
                      )}
                      {shelter.email && (
                        <div style={styles.contactItem}>
                          ✉️ {shelter.email}
                        </div>
                      )}
                      {shelter.address && (
                        <div style={styles.contactItem}>
                          📍 {shelter.address}
                        </div>
                      )}
                    </div>

                    <div style={styles.listingsTitle}>
                      Animaux disponibles ({listings.length})
                    </div>

                    {listings.length === 0 ? (
                      <div style={styles.noListings}>
                        Aucun animal disponible actuellement
                      </div>
                    ) : (
                      <div style={styles.shelterListings}>
                        {listings.map((listing) => (
                          <div
                            key={listing.id}
                            style={styles.miniListingCard}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/adopt/listing/${listing.id}`);
                            }}
                          >
                            {listing.photo_url ? (
                              <img
                                src={listing.photo_url}
                                alt={listing.name}
                                style={styles.miniListingImage}
                              />
                            ) : (
                              <div style={styles.miniListingPlaceholder}>🐕</div>
                            )}
                            <div style={styles.miniListingInfo}>
                              <div style={styles.miniListingName}>{listing.name}</div>
                              <div style={styles.miniListingBreed}>{listing.breed}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
