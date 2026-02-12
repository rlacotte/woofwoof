import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

// Fix Leaflet default icon issue
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

// Component to recenter map on position update
function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position);
    }
  }, [position, map]);
  return null;
}

export default function WalkTrackPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [mode, setMode] = useState('timer'); // 'timer' or 'manual'
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  // Map State
  const [currentPosition, setCurrentPosition] = useState(null);
  const [path, setPath] = useState([]); // Array of [lat, lng]
  const [events, setEvents] = useState([]); // Array of { type: 'pee'|'poop', lat, lng, time }
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  const [formData, setFormData] = useState({
    distance_km: '',
    duration_minutes: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => { });
  }, []);

  // Initial Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPosition([latitude, longitude]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedSeconds(0);
    setPath([]);
    setEvents([]);
    setDistanceTraveled(0);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Start GPS Tracking
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          // Filter out low accuracy points if needed (e.g., > 50m)
          if (accuracy > 50) return;

          const newPoint = [latitude, longitude];
          setCurrentPosition(newPoint);

          setPath((prevPath) => {
            if (prevPath.length > 0) {
              const lastPoint = prevPath[prevPath.length - 1];
              const dist = calculateDistance(lastPoint[0], lastPoint[1], latitude, longitude);
              // Only add point if moved more than 5 meters to reduce jitter
              if (dist > 0.005) {
                setDistanceTraveled((prevDist) => prevDist + dist);
                return [...prevPath, newPoint];
              }
              return prevPath;
            } else {
              return [newPoint];
            }
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, distanceFilter: 5 }
      );
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const durationMinutes = Math.round(elapsedSeconds / 60);
    const calories = durationMinutes * 5; // Simplified formula

    // Update form with gathered data
    setFormData((prev) => ({
      ...prev,
      duration_minutes: String(durationMinutes),
      distance_km: distanceTraveled.toFixed(2),
      calories: String(calories),
    }));
  };

  const addEvent = (type) => {
    if (!currentPosition) return;
    setEvents((prev) => [
      ...prev,
      { type, lat: currentPosition[0], lng: currentPosition[1], time: new Date() }
    ]);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === 'duration_minutes') {
      const dur = parseInt(value, 10);
      if (!isNaN(dur)) {
        updated.calories = String(dur * 5);
      }
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeDogId) {
      alert('Aucun chien selectionne');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        dog_id: activeDogId,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        duration_minutes: formData.duration_minutes
          ? parseInt(formData.duration_minutes, 10)
          : null,
        calories: formData.duration_minutes
          ? parseInt(formData.duration_minutes, 10) * 5
          : null,
        notes: formData.notes || null,
        route_json: JSON.stringify({ path, events }), // Save the path and events
      };
      await api.request('/walks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      navigate('/walk');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="walk-page">
      <SubAppHeader
        title="Nouvelle promenade"
        icon="▶"
        gradient="linear-gradient(135deg, #48c6ef, #6f86d6)"
        onBack={() => navigate('/walk')}
      />

      {dogs.length > 1 && (
        <div className="walk-dog-selector">
          <select
            className="walk-dog-select"
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(e.target.value)}
          >
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="walk-mode-toggle">
        <button
          className={`walk-mode-btn ${mode === 'timer' ? 'walk-mode-active' : ''}`}
          onClick={() => setMode('timer')}
        >
          Chronometre
        </button>
        <button
          className={`walk-mode-btn ${mode === 'manual' ? 'walk-mode-active' : ''}`}
          onClick={() => setMode('manual')}
        >
          Saisie manuelle
        </button>
      </div>

      {mode === 'timer' && (
        <div className="walk-timer-section">
          {/* Map Area */}
          <div className="walk-map-container" style={{ height: '300px', width: '100%', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden' }}>
            {currentPosition ? (
              <MapContainer center={currentPosition} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapRecenter position={currentPosition} />
                {path.length > 0 && <Polyline positions={path} color="blue" weight={4} />}
                {path.length > 0 && <Marker position={path[0]} icon={startIcon} />}
                <Marker position={currentPosition} />

                {events.map((ev, idx) => (
                  <Marker key={idx} position={[ev.lat, ev.lng]} icon={ev.type === 'poop' ? poopIcon : peeIcon}>
                    <Popup>{ev.type === 'poop' ? 'Caca' : 'Pipi'} à {ev.time.toLocaleTimeString()}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#eee', color: '#666' }}>
                📍 Recherche GPS...
              </div>
            )}
          </div>

          <div className="walk-timer-display">
            <span className="walk-timer-time">{formatTime(elapsedSeconds)}</span>
            <span className="walk-timer-current">Il est {currentTime}</span>
          </div>

          <div className="walk-live-stats" style={{ display: 'flex', justifyContent: 'space-around', margin: '10px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <strong>{distanceTraveled.toFixed(2)}</strong> km
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>{events.filter(e => e.type === 'pee').length}</strong> 💦
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>{events.filter(e => e.type === 'poop').length}</strong> 💩
            </div>
          </div>

          <div className="walk-controls">
            {!isRunning && elapsedSeconds === 0 && (
              <button className="walk-timer-btn walk-timer-start" onClick={startTimer}>
                Demarrer
              </button>
            )}
            {isRunning && (
              <div className="walk-running-controls" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="btn-circle btn-pee" onClick={() => addEvent('pee')} style={{ fontSize: '24px', padding: '15px', borderRadius: '50%', background: '#E3F2FD', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>💦</button>
                  <button className="btn-circle btn-poop" onClick={() => addEvent('poop')} style={{ fontSize: '24px', padding: '15px', borderRadius: '50%', background: '#efeec5', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>💩</button>
                </div>
                <button className="walk-timer-btn walk-timer-stop" onClick={stopTimer}>
                  Terminer
                </button>
              </div>
            )}
            {!isRunning && elapsedSeconds > 0 && (
              <div className="walk-timer-done">
                <p className="walk-timer-result">
                  Bravo ! Verifiez les infos ci-dessous avant d'enregistrer.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <form className="walk-form" onSubmit={handleSubmit}>
        <div className="walk-form-group">
          <label className="walk-form-label">Distance (km)</label>
          <input
            className="walk-form-input"
            type="number"
            step="0.01"
            name="distance_km"
            value={formData.distance_km}
            onChange={handleChange}
            placeholder="Ex: 3.5"
          />
        </div>

        {mode === 'manual' && (
          <div className="walk-form-group">
            <label className="walk-form-label">Duree (minutes)</label>
            <input
              className="walk-form-input"
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              placeholder="Ex: 45"
            />
          </div>
        )}

        {formData.duration_minutes && (
          <div className="walk-calories-info">
            <span className="walk-calories-icon">🔥</span>
            <span className="walk-calories-value">
              Calories estimees: {parseInt(formData.duration_minutes, 10) * 5} kcal
            </span>
          </div>
        )}

        <div className="walk-form-group">
          <label className="walk-form-label">Notes</label>
          <textarea
            className="walk-form-textarea"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Comment s'est passee la promenade ?"
            rows={3}
          />
        </div>

        <button
          className="walk-form-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer la promenade'}
        </button>
      </form>
    </div>
  );
}
