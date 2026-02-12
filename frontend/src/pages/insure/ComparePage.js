import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const COVERAGE_LABELS = {
  accident: 'Accident',
  illness: 'Maladie',
  prevention: 'Prevention',
};

export default function ComparePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('/insurance/plans')
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch(() => {
        setPlans([]);
        setLoading(false);
      });
  }, []);

  // Find best value: lowest price per coverage percentage
  const getBestValueId = () => {
    if (plans.length === 0) return null;
    let bestId = null;
    let bestRatio = Infinity;
    plans.forEach((plan) => {
      const coverage = plan.coverage_pct || plan.coverage || 0;
      if (coverage > 0) {
        const ratio = (plan.price_month || plan.price || 0) / coverage;
        if (ratio < bestRatio) {
          bestRatio = ratio;
          bestId = plan.id;
        }
      }
    });
    return bestId;
  };

  const bestValueId = getBestValueId();

  return (
    <div className="compare-page">
      <SubAppHeader
        title="WoofInsure"
        icon="🛡️"
        gradient="linear-gradient(135deg, #c471f5, #fa71cd)"
        onBack={() => navigate('/insure')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 16px 0' }}>
          Comparer les assurances
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : plans.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
          }}>
            Aucun plan disponible
          </div>
        ) : (
          plans.map((plan) => {
            const isBestValue = plan.id === bestValueId;
            const coverages = plan.coverages || {};
            const priceMonth = plan.price_month || plan.price || 0;
            const coveragePct = plan.coverage_pct || plan.coverage || 0;
            const deductible = plan.deductible || 0;
            const maxAnnual = plan.max_annual || 0;

            return (
              <div
                key={plan.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  border: isBestValue
                    ? '2px solid #c471f5'
                    : '1px solid rgba(255,255,255,0.12)',
                  padding: '20px',
                  marginBottom: '14px',
                  position: 'relative',
                }}
              >
                {isBestValue && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #c471f5, #fa71cd)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    Meilleur rapport
                  </div>
                )}

                {/* Plan Name + Provider */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: '17px' }}>
                    {plan.name}
                  </div>
                  {plan.provider && (
                    <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', marginTop: '2px' }}>
                      {plan.provider}
                    </div>
                  )}
                </div>

                {/* Price + Coverage */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#c471f5', fontSize: '20px', fontWeight: 700 }}>
                      {priceMonth}EUR
                    </div>
                    <div style={{ color: 'rgba(240,240,245,0.5)', fontSize: '10px' }}>
                      / mois
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#f0f0f5', fontSize: '20px', fontWeight: 700 }}>
                      {coveragePct}%
                    </div>
                    <div style={{ color: 'rgba(240,240,245,0.5)', fontSize: '10px' }}>
                      Couverture
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#f0f0f5', fontSize: '20px', fontWeight: 700 }}>
                      {deductible}EUR
                    </div>
                    <div style={{ color: 'rgba(240,240,245,0.5)', fontSize: '10px' }}>
                      Franchise
                    </div>
                  </div>
                </div>

                {/* Max Annual */}
                <div style={{
                  color: 'rgba(240,240,245,0.6)',
                  fontSize: '13px',
                  marginBottom: '12px',
                }}>
                  Plafond annuel : <span style={{ color: '#f0f0f5', fontWeight: 600 }}>{maxAnnual}EUR</span>
                </div>

                {/* Coverage Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(COVERAGE_LABELS).map(([key, label]) => {
                    const isCovered = coverages[key] === true ||
                      (Array.isArray(plan.coverage_types) && plan.coverage_types.includes(key));
                    return (
                      <span
                        key={key}
                        style={{
                          background: isCovered ? 'rgba(46,213,115,0.12)' : 'rgba(255,255,255,0.04)',
                          color: isCovered ? '#2ed573' : 'rgba(240,240,245,0.3)',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${isCovered ? 'rgba(46,213,115,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        {isCovered ? '✓ ' : '✕ '}{label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
