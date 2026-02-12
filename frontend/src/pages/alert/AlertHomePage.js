import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icons
const dangerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const lostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AlertHomePage() {
  const navigate = useNavigate();
  const [dangers, setDangers] = useState([]);
  const [lostPets, setLostPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState([48.8566, 2.3522]); // Default Paris

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    Promise.all([
      api.request('/alerts/danger').catch(() => []),
      api.request('/id/lost').catch(() => [])
    ]).then(([dangerData, lostData]) => {
      setDangers(dangerData);
      setLostPets(lostData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="alert-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1c1c1e' }}>
       <SubAppHeader 
          title="WoofAlert" 
          icon="⚠️" 
          gradient="linear-gradient(135deg, #FF416C, #FF4B2B)"
          onBack={() => navigate('/hub')} 
       />
       
       <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
             <div style={{ padding: 20, textAlign: 'center', color: '#fff' }}>Chargement de la carte...</div>
          ) : (
             <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {dangers.map(danger => (
                   <Marker key={`d-${danger.id}`} position={[danger.latitude, danger.longitude]} icon={dangerIcon}>
                      <Popup>
                         <strong>⚠️ {danger.alert_type}</strong><br/>
                         {danger.description}<br/>
                         {danger.photo_url && <img src={danger.photo_url} alt="danger" style={{width: '100%', marginTop: 5, borderRadius: 5}} />}
                         <div style={{fontSize: 10, color: '#666', marginTop: 5}}>Signale le {new Date(danger.created_at).toLocaleDateString()}</div>
                      </Popup>
                   </Marker>
                ))}

                {lostPets.map(pet => (
                   pet.latitude && pet.longitude ? (
                     <Marker key={`l-${pet.id}`} position={[pet.latitude, pet.longitude]} icon={lostIcon}>
                        <Popup>
                           <strong>🐶 Perdu !</strong><br/>
                           {pet.description}<br/>
                           📍 {pet.last_seen_address}<br/>
                           {pet.photo_url && <img src={pet.photo_url} alt="lost" style={{width: '100%', marginTop: 5, borderRadius: 5}} />}
                           {pet.contact_phone && <div style={{fontWeight: 'bold', marginTop: 5}}>📞 {pet.contact_phone}</div>}
                        </Popup>
                     </Marker>
                   ) : null
                ))}
             </MapContainer>
          )}

          {/* Floating Actions */}
          <div style={{
             position: 'absolute', bottom: 30, right: 20, display: 'flex', flexDirection: 'column', gap: 15, zIndex: 1000
          }}>
             <button onClick={() => navigate('/alert/report')} style={{
                padding: '15px 20px', borderRadius: 30, border: 'none', background: '#f5af19', color: '#000', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
             }}>
                ⚠️ Signaler Danger
             </button>
             <button onClick={() => navigate('/id/lost')} style={{
                padding: '15px 20px', borderRadius: 30, border: 'none', background: '#FF416C', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
             }}>
                🐶 Chien Perdu
             </button>
          </div>
       </div>
    </div>
  );
}
