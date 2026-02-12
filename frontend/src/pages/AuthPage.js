import React, { useState } from 'react';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.register({ email, password, full_name: fullName });
      } else {
        await api.login(email, password);
      }
      const user = await api.getMe();
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🐾</div>
      <h1 className="auth-title">WoofWoof</h1>
      <p className="auth-subtitle">{t('auth.subtitle')}</p>

      <div className="auth-card">
        <h2>{isRegister ? t('auth.register') : t('auth.login')}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>{t('auth.fullName')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marie Dupont"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : isRegister ? t('auth.registerAction') : t('auth.loginAction')}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? t('auth.hasAccount') + ' ' : t('auth.noAccount') + ' '}
          <span onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? t('auth.login') : t('auth.register')}
          </span>
        </div>

        <div className="auth-demo-hint">
          {t('auth.demoHint')}
        </div>
      </div>
    </div>
  );
}
