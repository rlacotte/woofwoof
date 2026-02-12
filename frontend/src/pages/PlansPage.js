import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function PlansPage({ user, onUserUpdate }) {
  const [plans, setPlans] = useState([]);
  const [swipeLimit, setSwipeLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [plansData, limitData] = await Promise.all([
        api.getPlans(),
        api.getSwipeLimit(),
      ]);
      setPlans(plansData);
      setSwipeLimit(limitData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId) {
    setSubscribing(planId);
    try {
      await api.subscribe(planId);
      const me = await api.getMe();
      if (onUserUpdate) onUserUpdate(me);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubscribing('');
    }
  }

  const planIcons = { croquette: '\uD83E\uDDB4', patee: '\uD83E\uDD6B', os_en_or: '\uD83C\uDFC6' };
  const planColors = { croquette: '#8D6E63', patee: '#FF7043', os_en_or: '#FFD700' };

  if (loading) {
    return (
      <div className="plans-page">
        <div className="page-header"><h1>{t('plans.title')}</h1></div>
        <div className="empty-state">
          <div className="loading-logo" style={{ fontSize: 48 }}>\uD83D\uDC3E</div>
          <p>{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <div className="page-header">
        <h1>{t('plans.title')}</h1>
      </div>

      {swipeLimit && (
        <div className="swipe-limit-bar">
          <div className="swipe-limit-info">
            <span>Swipes</span>
            <strong>{swipeLimit.used_today} / {swipeLimit.daily_limit === 999 ? '\u221E' : swipeLimit.daily_limit}</strong>
          </div>
          <div className="swipe-limit-track">
            <div
              className="swipe-limit-fill"
              style={{ width: `${swipeLimit.daily_limit === 999 ? 5 : Math.min(100, (swipeLimit.used_today / swipeLimit.daily_limit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map(plan => {
          const isCurrent = plan.is_current;
          const icon = planIcons[plan.id] || '\uD83D\uDC3E';
          const color = planColors[plan.id] || '#999';

          return (
            <div key={plan.id} className={`plan-card ${isCurrent ? 'plan-card-current' : ''}`} style={{ borderColor: isCurrent ? color : 'transparent' }}>
              {isCurrent && <div className="plan-current-badge" style={{ background: color }}>{t('plans.currentPlan')}</div>}

              <div className="plan-icon" style={{ color }}>{icon}</div>
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                {plan.price_monthly === 0 ? (
                  <span className="plan-price-amount">{t('plans.free')}</span>
                ) : (
                  <>
                    <span className="plan-price-amount">{plan.price_monthly.toFixed(2)}\u20AC</span>
                    <span className="plan-price-period">{t('plans.monthly')}</span>
                  </>
                )}
              </div>

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className={f.included ? 'included' : 'excluded'}>
                    <span className="plan-feature-icon">{f.included ? '\u2705' : '\u274C'}</span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {!isCurrent ? (
                <button
                  className="btn btn-primary plan-btn"
                  style={{ background: color }}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                >
                  {subscribing === plan.id ? '...' : t('plans.choosePlan')}
                </button>
              ) : (
                <button className="btn btn-outline plan-btn" disabled>
                  {t('plans.currentPlan')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
