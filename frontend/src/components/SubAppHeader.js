import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubAppHeader({ title, icon, gradient, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="subapp-header" style={{ background: gradient }}>
      <button className="subapp-back" onClick={onBack || (() => navigate('/hub'))}>
        ← Retour
      </button>
      <div className="subapp-title-row">
        <span className="subapp-icon">{icon}</span>
        <h1 className="subapp-title">{title}</h1>
      </div>
    </div>
  );
}
