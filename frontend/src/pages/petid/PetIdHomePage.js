import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function PetIdHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeDogId) return;
    setLoading(true);
    api.request(`/id/tags/dog/${activeDogId}`)
      .then((data) => {
        setTags(data);
        setLoading(false);
      })
      .catch(() => {
        setTags([]);
        setLoading(false);
      });
  }, [activeDogId]);

  const handleCreateTag = async () => {
    if (!activeDogId) return;
    setCreating(true);
    try {
      await api.request('/id/tags', {
        method: 'POST',
        body: JSON.stringify({ dog_id: activeDogId }),
      });
      // Refresh tags
      const data = await api.request(`/id/tags/dog/${activeDogId}`).catch(() => []);
      setTags(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="petid-page">
      <SubAppHeader
        title="WoofID"
        icon="📡"
        gradient="linear-gradient(135deg, #f12711, #f5af19)"
      />

      <div style={{ padding: '16px' }}>
        {/* Dog Selector */}
        {dogs.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <select
              value={activeDogId || ''}
              onChange={(e) => setActiveDogId(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: '#f0f0f5',
                fontSize: '14px',
                outline: 'none',
                appearance: 'auto',
              }}
            >
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mes Tags */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 12px 0' }}>
            Mes tags QR
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '30px 0' }}>
              Chargement...
            </div>
          ) : tags.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '24px',
              textAlign: 'center',
              color: 'rgba(240,240,245,0.6)',
            }}>
              Aucun tag pour ce chien
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '16px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '15px', fontFamily: 'monospace' }}>
                    🏷️ {tag.tag_code}
                  </div>
                  <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '12px', marginTop: '4px' }}>
                    {tag.scans || 0} scan{(tag.scans || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(241,39,17,0.12)',
                  color: '#f5af19',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '20px',
                }}>
                  📱
                </div>
              </div>
            ))
          )}

          {/* Create Tag Button */}
          <button
            onClick={handleCreateTag}
            disabled={creating || !activeDogId}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f12711, #f5af19)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              cursor: creating ? 'wait' : 'pointer',
              opacity: creating || !activeDogId ? 0.6 : 1,
              marginTop: '10px',
            }}
          >
            {creating ? 'Creation...' : '+ Creer un tag'}
          </button>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          <div
            onClick={() => navigate('/petid/lost')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐾</div>
            <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '14px' }}>
              Animaux perdus
            </div>
            <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '11px', marginTop: '4px' }}>
              Signaler ou rechercher
            </div>
          </div>

          <div
            onClick={() => navigate('/petid/scan')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '14px' }}>
              Scanner un tag
            </div>
            <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '11px', marginTop: '4px' }}>
              Identifier un animal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
