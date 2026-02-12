import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const DANGER_TYPES = [
  { value: 'ticks', label: 'Tiques' },
  { value: 'plants', label: 'Plantes Toxiques' },
  { value: 'glass', label: 'Verre brise' },
  { value: 'other', label: 'Autre danger' },
];

export default function AlertReportPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    alert_type: 'ticks',
    description: '',
    latitude: '',
    longitude: '',
    city: '',
    photo_url: ''
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        alert("Position recuperee !");
      }, (err) => {
        alert("Erreur de localisation: " + err.message);
      });
    } else {
      alert("Geolocalisation non supportee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      alert("La position est requise. Cliquez sur '📍 Ma position actuelle'");
      return;
    }
    setSubmitting(true);
    try {
      await api.request('/alerts/danger', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      navigate('/alert');
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setSubmitting(false);
    }
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
    <div className="alert-report-page" style={{ height: '100vh', background: '#1c1c1e', overflowY: 'auto' }}>
      <SubAppHeader
        title="Signaler un Danger"
        icon="⚠️"
        gradient="linear-gradient(135deg, #f5af19, #f12711)"
        onBack={() => navigate('/alert')}
      />

      <div style={{ padding: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={{ color: '#aaa', fontSize: 13, marginBottom: 5, display: 'block' }}>Type de danger</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DANGER_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, alert_type: type.value })}
                  style={{
                    padding: '10px 15px',
                    borderRadius: 20,
                    border: '1px solid ' + (form.alert_type === type.value ? '#f5af19' : 'rgba(255,255,255,0.2)'),
                    background: form.alert_type === type.value ? 'rgba(245,175,25,0.2)' : 'transparent',
                    color: form.alert_type === type.value ? '#f5af19' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: '#aaa', fontSize: 13, marginBottom: 5, display: 'block' }}>Description</label>
            <textarea
              rows={4}
              style={inputStyle}
              placeholder="Decrivez le danger (ex: Beaucoup de tiques dans les herbes hautes...)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={getLocation}
              style={{
                width: '100%',
                padding: 15,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                border: '1px dashed rgba(255,255,255,0.3)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              📍 {form.latitude ? `Position: ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : "Utiliser ma position actuelle"}
            </button>
          </div>

          <div>
            <label style={{ color: '#aaa', fontSize: 13, marginBottom: 5, display: 'block' }}>Ville (Optionnel)</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Ville"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
          </div>

          <div>
            <label style={{ color: '#aaa', fontSize: 13, marginBottom: 5, display: 'block' }}>Photo URL (Optionnel)</label>
            <input
              type="url"
              style={inputStyle}
              placeholder="https://..."
              value={form.photo_url}
              onChange={e => setForm({ ...form, photo_url: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #f5af19, #f12711)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Signalement...' : 'Publier le signalement'}
          </button>

        </form>
      </div>
    </div>
  );
}
