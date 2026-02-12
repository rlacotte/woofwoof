import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const CLAIM_TYPES = [
  { value: 'accident', label: 'Accident' },
  { value: 'illness', label: 'Maladie' },
  { value: 'prevention', label: 'Prevention' },
];

const STATUS_CONFIG = {
  submitted: { label: 'Soumise', color: '#ffa502', bg: 'rgba(255,165,2,0.12)' },
  processing: { label: 'En cours', color: '#3742fa', bg: 'rgba(55,66,250,0.12)' },
  approved: { label: 'Approuvee', color: '#2ed573', bg: 'rgba(46,213,115,0.12)' },
  rejected: { label: 'Rejetee', color: '#ff4757', bg: 'rgba(255,71,87,0.12)' },
};

export default function ClaimsPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    dog_id: '',
    claim_type: 'accident',
    amount: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
        setForm((prev) => ({ ...prev, dog_id: data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchClaims = () => {
    setLoading(true);
    api.request('/insurance/claims')
      .then((data) => {
        setClaims(data);
        setLoading(false);
      })
      .catch(() => {
        setClaims([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.claim_type || !form.amount) return;
    setSubmitting(true);
    try {
      await api.request('/insurance/claims', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          dog_id: form.dog_id || activeDogId,
          amount: parseFloat(form.amount),
        }),
      });
      setForm({
        dog_id: activeDogId || '',
        claim_type: 'accident',
        amount: '',
        description: '',
        date: '',
      });
      setShowForm(false);
      fetchClaims();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getClaimTypeLabel = (type) => {
    const found = CLAIM_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
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
    <div className="claims-page">
      <SubAppHeader
        title="WoofInsure"
        icon="🛡️"
        gradient="linear-gradient(135deg, #c471f5, #fa71cd)"
        onBack={() => navigate('/insure')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 16px 0' }}>
          Mes declarations
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : claims.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
            marginBottom: '16px',
          }}>
            Aucune declaration de sinistre
          </div>
        ) : (
          claims.map((claim) => {
            const status = STATUS_CONFIG[claim.status] || STATUS_CONFIG.submitted;
            return (
              <div
                key={claim.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '16px',
                  marginBottom: '10px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}>
                  <div>
                    <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '15px' }}>
                      {getClaimTypeLabel(claim.claim_type)}
                    </div>
                    <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', marginTop: '2px' }}>
                      {claim.date
                        ? new Date(claim.date).toLocaleDateString('fr-FR')
                        : 'Date inconnue'}
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

                <div style={{
                  color: '#c471f5',
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}>
                  {claim.amount}EUR
                </div>

                {claim.description && (
                  <div style={{
                    color: 'rgba(240,240,245,0.6)',
                    fontSize: '13px',
                    lineHeight: '1.4',
                  }}>
                    {claim.description}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* New Claim Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%',
            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #c471f5, #fa71cd)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {showForm ? '✕ Annuler' : '+ Nouvelle declaration'}
        </button>

        {/* New Claim Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '20px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {dogs.length > 1 && (
              <select
                value={form.dog_id}
                onChange={(e) => setForm({ ...form, dog_id: e.target.value })}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={form.claim_type}
              onChange={(e) => setForm({ ...form, claim_type: e.target.value })}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              {CLAIM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant (EUR) *"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={inputStyle}
              required
              min="0"
              step="0.01"
            />
            <textarea
              placeholder="Description du sinistre"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #c471f5, #fa71cd)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Envoi...' : 'Soumettre la declaration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
