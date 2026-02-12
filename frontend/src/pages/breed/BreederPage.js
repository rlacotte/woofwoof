import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function BreederPage() {
  const navigate = useNavigate();
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBreed, setFilterBreed] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    kennel_name: '',
    breeds: '',
    city: '',
    description: '',
    experience_years: '',
    phone: '',
  });

  const fetchBreeders = () => {
    setLoading(true);
    api.request('/breed/breeders')
      .then((data) => {
        setBreeders(data);
        setLoading(false);
      })
      .catch(() => {
        setBreeders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBreeders();
  }, []);

  const filteredBreeders = filterBreed
    ? breeders.filter((b) => {
        const breeds = Array.isArray(b.breeds) ? b.breeds.join(', ') : (b.breeds || '');
        return breeds.toLowerCase().includes(filterBreed.toLowerCase());
      })
    : breeders;

  const handleExpand = async (breederId) => {
    if (expandedId === breederId) {
      setExpandedId(null);
      setExpandedDetails(null);
      return;
    }
    setExpandedId(breederId);
    try {
      const details = await api.request(`/breed/breeders/${breederId}`);
      setExpandedDetails(details);
    } catch {
      setExpandedDetails(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kennel_name || !form.city) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        breeds: form.breeds.split(',').map((b) => b.trim()).filter(Boolean),
        experience_years: form.experience_years ? parseInt(form.experience_years) : 0,
      };
      await api.request('/breed/breeders/profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setForm({
        kennel_name: '',
        breeds: '',
        city: '',
        description: '',
        experience_years: '',
        phone: '',
      });
      setShowForm(false);
      fetchBreeders();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < full ? '#f5af19' : 'rgba(255,255,255,0.2)' }}>
          ★
        </span>
      );
    }
    return stars;
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
    <div className="breeder-page">
      <SubAppHeader
        title="WoofBreed"
        icon="🧬"
        gradient="linear-gradient(135deg, #4facfe, #00f2fe)"
        onBack={() => navigate('/breed')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 12px 0' }}>
          Eleveurs
        </h2>

        {/* Filter */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Filtrer par race..."
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f0f0f5',
              fontSize: '14px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        {/* Breeders List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : filteredBreeders.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
            marginBottom: '16px',
          }}>
            Aucun eleveur trouve
          </div>
        ) : (
          filteredBreeders.map((breeder) => {
            const isExpanded = expandedId === breeder.id;
            const breeds = Array.isArray(breeder.breeds)
              ? breeder.breeds.join(', ')
              : (breeder.breeds || '');

            return (
              <div
                key={breeder.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                }}
              >
                {/* Breeder Card */}
                <div
                  onClick={() => handleExpand(breeder.id)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#f0f0f5',
                        fontWeight: 600,
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        {breeder.kennel_name}
                        {breeder.verified && (
                          <span style={{
                            background: 'rgba(46,213,115,0.12)',
                            color: '#2ed573',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                          }}>
                            Verifie
                          </span>
                        )}
                      </div>
                      {breeds && (
                        <div style={{ color: '#4facfe', fontSize: '13px', marginTop: '3px' }}>
                          {breeds}
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

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px',
                  }}>
                    <div style={{ fontSize: '14px' }}>{renderStars(breeder.rating)}</div>
                    <span style={{ color: 'rgba(240,240,245,0.5)', fontSize: '12px' }}>
                      📍 {breeder.city || 'Ville inconnue'}
                    </span>
                    {breeder.experience_years && (
                      <span style={{ color: 'rgba(240,240,245,0.5)', fontSize: '12px' }}>
                        {breeder.experience_years} ans
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px',
                  }}>
                    {(expandedDetails || breeder).description && (
                      <div style={{
                        color: 'rgba(240,240,245,0.7)',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        marginBottom: '14px',
                      }}>
                        {(expandedDetails || breeder).description}
                      </div>
                    )}

                    {/* Litters */}
                    {expandedDetails && expandedDetails.litters && expandedDetails.litters.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{
                          color: 'rgba(240,240,245,0.6)',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '8px',
                        }}>
                          Portees ({expandedDetails.litters.length})
                        </div>
                        {expandedDetails.litters.map((litter, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ color: '#f0f0f5', fontSize: '13px', fontWeight: 600 }}>
                              {litter.breed || 'Race non specifiee'}
                            </div>
                            {litter.birth_date && (
                              <div style={{ color: 'rgba(240,240,245,0.5)', fontSize: '12px', marginTop: '2px' }}>
                                Nee le {new Date(litter.birth_date).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                            {litter.available_puppies !== undefined && (
                              <div style={{ color: '#4facfe', fontSize: '12px', marginTop: '2px' }}>
                                {litter.available_puppies} chiot{litter.available_puppies !== 1 ? 's' : ''} disponible{litter.available_puppies !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contact */}
                    {(expandedDetails || breeder).phone && (
                      <div style={{ color: '#f0f0f5', fontSize: '14px', marginBottom: '6px' }}>
                        📞 {(expandedDetails || breeder).phone}
                      </div>
                    )}
                    {(expandedDetails || breeder).email && (
                      <div style={{ color: '#f0f0f5', fontSize: '14px' }}>
                        📧 {(expandedDetails || breeder).email}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Become Breeder Form */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%',
            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #4facfe, #00f2fe)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: showForm ? '#f0f0f5' : '#0f0f1a',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {showForm ? '✕ Annuler' : '⭐ Devenir eleveur'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '20px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <input
              type="text"
              placeholder="Nom de l'elevage *"
              value={form.kennel_name}
              onChange={(e) => setForm({ ...form, kennel_name: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Races (separees par des virgules)"
              value={form.breeds}
              onChange={(e) => setForm({ ...form, breeds: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Ville *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={inputStyle}
              required
            />
            <textarea
              placeholder="Description de votre elevage"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <input
              type="number"
              placeholder="Annees d'experience"
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
              style={inputStyle}
              min="0"
            />
            <input
              type="tel"
              placeholder="Telephone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: '#0f0f1a',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Creation...' : 'Creer mon profil eleveur'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
