import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const vetIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Vet icon from flaticon/cdn
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3253/3253272.png', // User/Dog icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -34],
});

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function VetFinderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [vets, setVets] = useState([]);
  const [myPos, setMyPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDogId, setActiveDogId] = useState(new URLSearchParams(location.search).get('dogId'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // map or list

  const [newVet, setNewVet] = useState({
    name: '', address: '', city: '', phone: '', website: ''
  });

  useEffect(() => {
    // Get location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyPos([latitude, longitude]);
        loadVets(latitude, longitude);
      },
      (err) => {
        console.error("Loc error", err);
        // Default to Paris if no loc
        setMyPos([48.8566, 2.3522]);
        loadVets(48.8566, 2.3522);
      }
    );
  }, []);

  const loadVets = async (lat, lng, city = null) => {
    try {
      setLoading(true);
      let query = '';
      if (city) query += `?city=${city}`;
      else if (lat && lng) query += `?lat=${lat}&lng=${lng}`;

      const data = await api.request(`/health/vets${query}`);
      setVets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadVets(null, null, searchTerm);
  };

  const handleAssign = async (vetId) => {
    if (!activeDogId) {
      alert("Sélectionnez un chien d'abord (depuis WoofHealth)");
      return;
    }
    try {
      await api.request(`/dogs/${activeDogId}/vet_assignment`, {
        method: 'PUT',
        body: { vet_id: vetId }
      });
      alert("Vétérinaire assigné !");
      navigate('/health');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'assignation");
    }
  };

  const handleAddVet = async (e) => {
    e.preventDefault();
    try {
      await api.request('/health/vets', {
        method: 'POST',
        body: {
          ...newVet,
          latitude: myPos ? myPos[0] : 0,
          longitude: myPos ? myPos[1] : 0
        }
      });
      setShowAddModal(false);
      alert("Vétérinaire ajouté !");
      loadVets(myPos[0], myPos[1]);
    } catch (err) {
      console.error(err);
      alert("Erreur");
    }
  };

  return (
    <div className="health-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SubAppHeader
        title="Trouver un Vétérinaire"
        icon="🩺"
        gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        onBack={() => navigate('/health')}
      />

      <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <input
            className="health-form-input"
            placeholder="Ville..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <button type="submit" className="walk-action-btn walk-action-primary" style={{ width: 'auto' }}>🔍</button>
        </form>
        <button
          className="walk-action-btn walk-action-secondary"
          style={{ width: 'auto' }}
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          {viewMode === 'map' ? 'Liste' : 'Carte'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {viewMode === 'list' ? (
          <div className="food-dashboard">
            {vets.map(vet => (
              <div key={vet.id} className="social-card" style={{ padding: '16px' }}>
                <h3 className="health-section-title">{vet.name}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>📍 {vet.address}, {vet.city}</p>
                <p>📞 {vet.phone || 'Non renseigné'}</p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href={`tel:${vet.phone}`}
                    className="walk-action-btn walk-action-secondary"
                    style={{ textDecoration: 'none', textAlign: 'center' }}
                  >
                    Appeler
                  </a>
                  {activeDogId && (
                    <button
                      className="walk-action-btn walk-action-primary"
                      onClick={() => handleAssign(vet.id)}
                    >
                      Choisir comme véto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MapContainer
            center={myPos || [48.8566, 2.3522]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {myPos && (
              <>
                <Marker position={myPos} icon={userIcon}>
                  <Popup>Vous êtes ici</Popup>
                </Marker>
                <MapRecenter lat={myPos[0]} lng={myPos[1]} />
              </>
            )}

            {vets.map(vet => (
              vet.latitude && vet.longitude && (
                <Marker key={vet.id} position={[vet.latitude, vet.longitude]} icon={vetIcon}>
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <strong>{vet.name}</strong><br />
                      {vet.address}<br />
                      <a href={`tel:${vet.phone}`}>{vet.phone}</a><br />
                      {activeDogId && (
                        <button
                          onClick={() => handleAssign(vet.id)}
                          style={{ marginTop: '8px', width: '100%', padding: '4px', background: '#38ef7d', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                        >
                          Choisir ce véto
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        )}

        <button
          className="social-fab"
          onClick={() => setShowAddModal(true)}
          style={{ bottom: '24px', right: '24px' }}
        >
          +
        </button>
      </div>

      {/* Add Vet Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="social-card" style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
            <h3 className="health-section-title">Ajouter un Vétérinaire</h3>
            <form onSubmit={handleAddVet}>
              <div className="health-form-group">
                <label className="health-form-label">Nom de la clinique / Dr</label>
                <input className="health-form-input" required
                  value={newVet.name} onChange={e => setNewVet({ ...newVet, name: e.target.value })}
                />
              </div>
              <div className="health-form-group">
                <label className="health-form-label">Adresse</label>
                <input className="health-form-input" required
                  value={newVet.address} onChange={e => setNewVet({ ...newVet, address: e.target.value })}
                />
              </div>
              <div className="health-form-group">
                <label className="health-form-label">Ville</label>
                <input className="health-form-input" required
                  value={newVet.city} onChange={e => setNewVet({ ...newVet, city: e.target.value })}
                />
              </div>
              <div className="health-form-group">
                <label className="health-form-label">Téléphone</label>
                <input className="health-form-input"
                  value={newVet.phone} onChange={e => setNewVet({ ...newVet, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="walk-action-btn walk-action-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="walk-action-btn walk-action-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
