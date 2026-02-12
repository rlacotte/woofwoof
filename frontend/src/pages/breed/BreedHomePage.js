import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function BreedHomePage() {
  const navigate = useNavigate();
  const [breeders, setBreeders] = useState([]);
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBreeder, setIsBreeder] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.request('/breed/breeders').catch(() => []),
      api.request('/breed/litters').catch(() => []),
    ]).then(([b, l]) => {
      setBreeders(b);
      setLitters(l);
      // Check if current user is a breeder
      const currentUserIsBreeder = Array.isArray(b)
        ? b.some((breeder) => breeder.is_own || breeder.is_current_user)
        : false;
      setIsBreeder(currentUserIsBreeder);
      setLoading(false);
    });
  }, []);

  const availableLitters = litters.filter((l) => {
    if (l.available_puppies !== undefined) return l.available_puppies > 0;
    return true;
  });

  return (
    <div className="breed-page">
      <SubAppHeader
        title="WoofBreed"
        icon="🧬"
        gradient="linear-gradient(135deg, #4facfe, #00f2fe)"
      />

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : (
          <>
            {/* Eleveurs Section */}
            <div
              onClick={() => navigate('/breed/breeders')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '20px',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '24px' }}>🏠</span>
                  <span style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '16px' }}>
                    Eleveurs
                  </span>
                </div>
                <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
                  {breeders.length} eleveur{breeders.length !== 1 ? 's' : ''} enregistre{breeders.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span style={{ color: 'rgba(240,240,245,0.4)', fontSize: '20px' }}>›</span>
            </div>

            {/* Portees Section */}
            <div
              onClick={() => navigate('/breed/litters')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '20px',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '24px' }}>🐾</span>
                  <span style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '16px' }}>
                    Portees disponibles
                  </span>
                </div>
                <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
                  {availableLitters.length} portee{availableLitters.length !== 1 ? 's' : ''} disponible{availableLitters.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span style={{ color: 'rgba(240,240,245,0.4)', fontSize: '20px' }}>›</span>
            </div>

            {/* Pedigree CTA */}
            <div
              onClick={() => navigate('/breed/pedigree')}
              style={{
                background: 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.15))',
                borderRadius: '14px',
                border: '1px solid rgba(79,172,254,0.25)',
                padding: '20px',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '24px' }}>🌳</span>
                  <span style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '16px' }}>
                    Arbre genealogique
                  </span>
                </div>
                <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
                  Visualisez l'ascendance de votre chien
                </div>
              </div>
              <span style={{ color: 'rgba(240,240,245,0.4)', fontSize: '20px' }}>›</span>
            </div>

            {/* Become Breeder CTA */}
            {!isBreeder && (
              <div
                onClick={() => navigate('/breed/breeders')}
                style={{
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  borderRadius: '14px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '12px',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⭐</div>
                <div style={{ color: '#0f0f1a', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                  Devenir eleveur
                </div>
                <div style={{ color: 'rgba(15,15,26,0.6)', fontSize: '13px' }}>
                  Creez votre profil d'eleveur et publiez vos portees
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
