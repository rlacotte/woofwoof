import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const HIDDEN_PATHS = ['/chat/', '/dog/', '/predictor', '/map'];
const SUB_APP_PREFIXES = ['/health', '/walk', '/food', '/sitter', '/social', '/shop', '/train', '/adopt', '/travel', '/insure', '/petid', '/breed', '/alert'];

export default function BottomNav() {
  const location = useLocation();

  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;
  if (SUB_APP_PREFIXES.some(p => location.pathname.startsWith(p))) return null;

  const tabs = [
    { path: '/', icon: '🐾', label: 'Hub' },
    { path: '/match', icon: '💕', label: 'Match' },
    { path: '/search', icon: '🔍', label: 'Chercher' },
    { path: '/matches', icon: '💬', label: 'Messages' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ];

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
          <span className="nav-item-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
