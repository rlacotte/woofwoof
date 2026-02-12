import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { path: '/', icon: '🔥', labelKey: 'nav.discover' },
    { path: '/search', icon: '🔍', labelKey: 'nav.search' },
    { path: '/matches', icon: '💬', labelKey: 'nav.matches' },
    { path: '/plans', icon: '⭐', labelKey: 'nav.plans' },
    { path: '/profile', icon: '👤', labelKey: 'nav.profile' },
  ];

  if (location.pathname.startsWith('/chat/')) return null;
  if (location.pathname.startsWith('/dog/')) return null;
  if (location.pathname === '/predictor') return null;
  if (location.pathname === '/map') return null;

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={tab.path === '/'}
        >
          <span className="nav-item-icon">{tab.icon}</span>
          <span className="nav-item-label">{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
