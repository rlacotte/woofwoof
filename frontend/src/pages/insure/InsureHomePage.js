import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function InsureHomePage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('/insurance/claims')
      .then((data) => {
        setClaims(data);
        setLoading(false);
      })
      .catch(() => {
        setClaims([]);
        setLoading(false);
      });
  }, []);

  const approvedClaims = claims.filter((c) => c.status === 'approved');
  const totalApproved = approvedClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
  const recentClaims = claims.slice(0, 3);

  const statusConfig = {
    submitted: { label: 'Soumise', color: '#ffa502', bg: 'rgba(255,165,2,0.12)' },
    processing: { label: 'En cours', color: '#3742fa', bg: 'rgba(55,66,250,0.12)' },
    approved: { label: 'Approuvee', color: '#2ed573', bg: 'rgba(46,213,115,0.12)' },
    rejected: { label: 'Rejetee', color: '#ff4757', bg: 'rgba(255,71,87,0.12)' },
  };

  return (
    <div className="insure-page">
      <SubAppHeader
        title="WoofInsure"
        icon="🛡️"
        gradient="linear-gradient(135deg, #c471f5, #fa71cd)"
      />

      <div style={{ padding: '16px' }}>
        {/* Compare CTA */}
        <div
          onClick={() => navigate('/insure/compare')}
          style={{
            background: 'linear-gradient(135deg, rgba(196,113,245,0.2), rgba(250,113,205,0.2))',
            borderRadius: '16px',
            border: '1px solid rgba(196,113,245,0.3)',
            padding: '24px 20px',
            marginBottom: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ color: '#f0f0f5', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Comparer les assurances
            </div>
            <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px' }}>
              Trouvez la meilleure couverture pour votre chien
            </div>
          </div>
          <span style={{ fontSize: '32px' }}>📊</span>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '24px',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '18px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#f0f0f5', fontSize: '28px', fontWeight: 700 }}>
                  {claims.length}
                </div>
                <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '12px', marginTop: '4px' }}>
                  Declaration{claims.length !== 1 ? 's' : ''} totale{claims.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '18px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#2ed573', fontSize: '28px', fontWeight: 700 }}>
                  {totalApproved.toFixed(0)}EUR
                </div>
                <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '12px', marginTop: '4px' }}>
                  Montant approuve
                </div>
              </div>
            </div>

            {/* Recent Claims */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: 0 }}>
                  Mes declarations
                </h2>
                <button
                  onClick={() => navigate('/insure/claims')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#c471f5',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Voir tout →
                </button>
              </div>

              {recentClaims.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(240,240,245,0.6)',
                }}>
                  Aucune declaration
                </div>
              ) : (
                recentClaims.map((claim) => {
                  const status = statusConfig[claim.status] || statusConfig.submitted;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => navigate('/insure/claims')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '14px 16px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '14px' }}>
                          {claim.claim_type === 'accident' ? 'Accident' :
                           claim.claim_type === 'illness' ? 'Maladie' : 'Prevention'}
                        </div>
                        <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '12px', marginTop: '2px' }}>
                          {claim.date
                            ? new Date(claim.date).toLocaleDateString('fr-FR')
                            : 'Date inconnue'} - {claim.amount}EUR
                        </div>
                      </div>
                      <span style={{
                        background: status.bg,
                        color: status.color,
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {status.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
