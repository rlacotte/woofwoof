import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

// Reuse icon logic
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const poopIcon = new L.DivIcon({
  html: '<div style="font-size: 24px;">💩</div>',
  className: 'emoji-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const peeIcon = new L.DivIcon({
  html: '<div style="font-size: 24px;">💦</div>',
  className: 'emoji-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const startIcon = new L.DivIcon({
  html: '<div style="font-size: 24px;">🏁</div>',
  className: 'emoji-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const endIcon = new L.DivIcon({
  html: '<div style="font-size: 24px;">🏁</div>',
  className: 'emoji-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapBounds({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
}

export default function WalkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [walk, setWalk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.request(`/walks/${id}/detail`) // We might need to adjust the API or use logic to get a single walk if needed
      .then(data => {
        // Parse route_json if it exists
        if (data.route_json && typeof data.route_json === 'string') {
          try {
            const parsed = JSON.parse(data.route_json);
            // Handle legacy format or new format
            if (Array.isArray(parsed)) {
              data.path = parsed;
              data.events = [];
            } else {
              data.path = parsed.path || [];
              data.events = parsed.events || [];
            }
          } catch (e) {
            data.path = [];
            data.events = [];
          }
        } else {
          data.path = [];
          data.events = [];
        }
        setWalk(data);
        setLoading(false);
      })
      .catch(err => {
        // Fallback: The API `GET /walks/:dog_id` returns a list. 
        // We probably need a `GET /walks/detail/:walk_id` or similar.
        // Let's implement a quick fetch for single walk in backend if needed.
        // For now, let's assume I'll add the endpoint or it exists.
        // Actually, looking at `walk.py`, there is NO endpoint for get single walk by ID except `get_walk_spot`.
        // I need to add that to backend!
        setError("Impossible de charger la promenade.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!walk) return <div className="p-4">Promenade non trouvée.</div>;

  return (
    <div className="walk-page">
      <SubAppHeader
        title={`Promenade du ${new Date(walk.start_time).toLocaleDateString()}`}
        icon="🐕"
        gradient="linear-gradient(135deg, #48c6ef, #6f86d6)"
        onBack={() => navigate('/walk')}
      />

      <div className="walk-detail-container" style={{ padding: '20px' }}>

        {walk.path && walk.path.length > 0 ? (
          <div className="walk-map-container" style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={walk.path[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapBounds path={walk.path} />
              <Polyline positions={walk.path} color="blue" weight={4} />
              <Marker position={walk.path[0]} icon={startIcon}>
                <Popup>Départ</Popup>
              </Marker>
              <Marker position={walk.path[walk.path.length - 1]} icon={endIcon}>
                <Popup>Arrivée</Popup>
              </Marker>

              {walk.events && walk.events.map((ev, idx) => (
                <Marker key={idx} position={[ev.lat, ev.lng]} icon={ev.type === 'poop' ? poopIcon : peeIcon}>
                  <Popup>{ev.type === 'poop' ? 'Caca' : 'Pipi'} à {new Date(ev.time).toLocaleTimeString()}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="no-map-message" style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '10px', marginBottom: '20px' }}>
            <p>Pas de tracé GPS pour cette promenade.</p>
          </div>
        )}

        <div className="walk-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="stat-card" style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{walk.distance_km}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Kilomètres</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{walk.duration_minutes}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Minutes</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{walk.calories}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Calories</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {walk.events ? walk.events.length : 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Besoins</div>
          </div>
        </div>

        {walk.notes && (
          <div className="walk-notes" style={{ background: '#fff3cd', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#856404' }}>Notes</h4>
            <p style={{ margin: 0, color: '#856404' }}>{walk.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
