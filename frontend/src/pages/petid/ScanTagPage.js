import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function ScanTagPage() {
  const navigate = useNavigate();
  const [tagCode, setTagCode] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!tagCode.trim()) return;
    setScanning(true);
    setResult(null);
    setNotFound(false);
    try {
      const data = await api.request(`/id/tags/scan/${encodeURIComponent(tagCode.trim())}`);
      setResult(data);
    } catch {
      setNotFound(true);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setTagCode('');
    setResult(null);
    setNotFound(false);
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
    <div className="scan-page">
      <SubAppHeader
        title="WoofID"
        icon="📡"
        gradient="linear-gradient(135deg, #f12711, #f5af19)"
        onBack={() => navigate('/petid')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 8px 0' }}>
          Scanner un tag
        </h2>
        <p style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', margin: '0 0 20px 0' }}>
          Entrez le code du tag pour identifier l'animal
        </p>

        {/* Scan Form */}
        <form onSubmit={handleScan} style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Code du tag (ex: WF-ABC123)"
            value={tagCode}
            onChange={(e) => setTagCode(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            required
          />
          <button
            type="submit"
            disabled={scanning || !tagCode.trim()}
            style={{
              background: 'linear-gradient(135deg, #f12711, #f5af19)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: scanning ? 'wait' : 'pointer',
              opacity: scanning || !tagCode.trim() ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            {scanning ? '...' : '🔍 Scanner'}
          </button>
        </form>

        {/* Scanning Indicator */}
        {scanning && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
            padding: '40px 0',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
            Recherche en cours...
          </div>
        )}

        {/* Not Found */}
        {notFound && !scanning && (
          <div style={{
            background: 'rgba(255,71,87,0.08)',
            borderRadius: '14px',
            border: '1px solid rgba(255,71,87,0.2)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
            <div style={{ color: '#ff4757', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
              Tag non trouve
            </div>
            <div style={{
              color: 'rgba(240,240,245,0.5)',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              Le code "{tagCode}" ne correspond a aucun tag enregistre.
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '10px 24px',
                color: '#f0f0f5',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Reessayer
            </button>
          </div>
        )}

        {/* Result */}
        {result && !scanning && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(46,213,115,0.2)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{
              background: 'rgba(46,213,115,0.12)',
              color: '#2ed573',
              borderRadius: '8px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-block',
              marginBottom: '16px',
            }}>
              Tag identifie
            </div>

            {/* Dog Photo */}
            {result.photo || result.photo_url ? (
              <img
                src={result.photo || result.photo_url}
                alt={result.dog_name || result.name || 'Chien'}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 14px',
                  display: 'block',
                  border: '3px solid rgba(255,255,255,0.12)',
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(241,39,17,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                margin: '0 auto 14px',
                border: '3px solid rgba(255,255,255,0.12)',
              }}>
                🐕
              </div>
            )}

            {/* Dog Info */}
            <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>
              {result.dog_name || result.name || 'Nom inconnu'}
            </div>
            {(result.breed || result.dog_breed) && (
              <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '14px', marginBottom: '16px' }}>
                {result.breed || result.dog_breed}
              </div>
            )}

            {/* Owner Info */}
            {(result.owner_name || result.owner_email || result.owner_phone) && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginTop: '8px',
              }}>
                <div style={{
                  color: 'rgba(240,240,245,0.5)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                }}>
                  Proprietaire
                </div>
                {result.owner_name && (
                  <div style={{ color: '#f0f0f5', fontSize: '14px', marginBottom: '6px' }}>
                    👤 {result.owner_name}
                  </div>
                )}
                {result.owner_email && (
                  <div style={{ color: '#f0f0f5', fontSize: '14px', marginBottom: '6px' }}>
                    📧 {result.owner_email}
                  </div>
                )}
                {result.owner_phone && (
                  <div style={{ color: '#f0f0f5', fontSize: '14px' }}>
                    📞 {result.owner_phone}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '10px 24px',
                color: '#f0f0f5',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '20px',
              }}
            >
              Scanner un autre tag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
