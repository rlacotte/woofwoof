import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const PLACE_TYPES = [
  { value: '', label: 'Tous' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'beach', label: 'Plage' },
  { value: 'camping', label: 'Camping' },
  { value: 'transport', label: 'Transport' },
];

const AMENITY_OPTIONS = [
  'Gamelle eau', 'Jardin', 'Terrasse', 'Croquettes', 'Parc clos',
  'Plage accessible', 'Climatisation', 'Parking',
];

export default function PlacesMapPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    place_type: 'hotel',
    city: '',
    address: '',
    description: '',
    amenities: [],
    website: '',
  });

  const fetchPlaces = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (search) params.set('search', search);
    const query = params.toString();
    api.request(`/travel/places${query ? '?' + query : ''}`)
      .then((data) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(() => {
        setPlaces([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaces();
  }, [filterType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city) return;
    setSubmitting(true);
    try {
      await api.request('/travel/places', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({
        name: '',
        place_type: 'hotel',
        city: '',
        address: '',
        description: '',
        amenities: [],
        website: '',
      });
      setShowForm(false);
      fetchPlaces();
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
    <div className="places-page">
      <SubAppHeader
        title="WoofTravel"
        icon="✈️"
        gradient="linear-gradient(135deg, #00c9ff, #92fe9d)"
        onBack={() => navigate('/travel')}
      />

      <div style={{ padding: '16px' }}>
        {/* Search + Filter */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #00c9ff, #92fe9d)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#0f0f1a',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            OK
          </button>
        </form>

        {/* Type Filter */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {PLACE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              style={{
                background: filterType === t.value
                  ? 'linear-gradient(135deg, #00c9ff, #92fe9d)'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '6px 14px',
                color: filterType === t.value ? '#0f0f1a' : '#f0f0f5',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: filterType === t.value ? 600 : 400,
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Places List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : places.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
          }}>
            Aucun lieu trouve
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '16px',
                marginBottom: '10px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '6px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '16px' }}>
                    {place.name}
                  </div>
                  <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', marginTop: '2px' }}>
                    {place.city}
                  </div>
                </div>
                <span style={{
                  background: 'rgba(0,201,255,0.15)',
                  color: '#00c9ff',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}>
                  {place.place_type || place.type}
                </span>
              </div>

              <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                {renderStars(place.rating)}
              </div>

              {place.description && (
                <div style={{
                  color: 'rgba(240,240,245,0.6)',
                  fontSize: '13px',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}>
                  {place.description.length > 120
                    ? place.description.substring(0, 120) + '...'
                    : place.description}
                </div>
              )}

              {place.amenities && place.amenities.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {place.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(146,254,157,0.12)',
                        color: '#92fe9d',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Add Place Toggle */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%',
            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00c9ff, #92fe9d)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: showForm ? '#f0f0f5' : '#0f0f1a',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          {showForm ? '✕ Fermer' : '+ Ajouter un lieu'}
        </button>

        {/* Add Place Form */}
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
              placeholder="Nom du lieu *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              required
            />
            <select
              value={form.place_type}
              onChange={(e) => setForm({ ...form, place_type: e.target.value })}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="beach">Plage</option>
              <option value="camping">Camping</option>
              <option value="transport">Transport</option>
            </select>
            <input
              type="text"
              placeholder="Ville *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={inputStyle}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <div>
              <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', marginBottom: '8px' }}>
                Equipements :
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      background: form.amenities.includes(amenity)
                        ? 'rgba(0,201,255,0.2)'
                        : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${form.amenities.includes(amenity) ? '#00c9ff' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: form.amenities.includes(amenity) ? '#00c9ff' : 'rgba(240,240,245,0.6)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="url"
              placeholder="Site web"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #00c9ff, #92fe9d)',
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
              {submitting ? 'Ajout...' : 'Ajouter le lieu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
