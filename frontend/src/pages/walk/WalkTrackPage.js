import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function WalkTrackPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [mode, setMode] = useState('timer'); // 'timer' or 'manual'
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

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
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const durationMinutes = Math.round(elapsedSeconds / 60);
    const calories = durationMinutes * 5;
    setFormData((prev) => ({
      ...prev,
      duration_minutes: String(durationMinutes),
      calories: String(calories),
    }));
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
          <div className="walk-timer-display">
            <span className="walk-timer-time">{formatTime(elapsedSeconds)}</span>
            <span className="walk-timer-current">Il est {currentTime}</span>
          </div>

          {!isRunning && elapsedSeconds === 0 && (
            <button className="walk-timer-btn walk-timer-start" onClick={startTimer}>
              Demarrer
            </button>
          )}
          {isRunning && (
            <button className="walk-timer-btn walk-timer-stop" onClick={stopTimer}>
              Arreter
            </button>
          )}
          {!isRunning && elapsedSeconds > 0 && (
            <div className="walk-timer-done">
              <p className="walk-timer-result">
                Duree: {Math.round(elapsedSeconds / 60)} min |
                Calories estimees: {Math.round(elapsedSeconds / 60) * 5} kcal
              </p>
            </div>
          )}
        </div>
      )}

      <form className="walk-form" onSubmit={handleSubmit}>
        <div className="walk-form-group">
          <label className="walk-form-label">Distance (km)</label>
          <input
            className="walk-form-input"
            type="number"
            step="0.1"
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
