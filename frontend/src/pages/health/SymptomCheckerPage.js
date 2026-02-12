import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';

const SYMPTOM_CATEGORIES = [
  {
    category: 'Digestif',
    icon: '🤢',
    symptoms: [
      'Vomissements',
      'Diarrhée',
      'Constipation',
      'Perte d\'appétit',
      'Ballonnements',
      'Sang dans les selles',
    ],
  },
  {
    category: 'Respiratoire',
    icon: '🫁',
    symptoms: [
      'Toux',
      'Éternuements',
      'Difficulté à respirer',
      'Respiration rapide',
      'Écoulement nasal',
      'Halètement excessif',
    ],
  },
  {
    category: 'Comportement',
    icon: '🧠',
    symptoms: [
      'Léthargie',
      'Agitation',
      'Agressivité inhabituelle',
      'Confusion',
      'Tremblements',
      'Convulsions',
    ],
  },
  {
    category: 'Peau',
    icon: '🐾',
    symptoms: [
      'Démangeaisons',
      'Rougeurs',
      'Perte de poils',
      'Plaies',
      'Grosseurs',
      'Pellicules',
    ],
  },
  {
    category: 'Autres',
    icon: '⚕️',
    symptoms: [
      'Fièvre',
      'Boiterie',
      'Yeux rouges',
      'Oreilles sales',
      'Mauvaise haleine',
      'Soif excessive',
    ],
  },
];

export default function SymptomCheckerPage() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('less_24h');
  const [severity, setSeverity] = useState('mild');
  const [showResults, setShowResults] = useState(false);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const analyzeSymptoms = () => {
    setShowResults(true);
  };

  const getUrgencyLevel = () => {
    if (severity === 'severe' || selectedSymptoms.length >= 4) {
      return {
        level: 'urgent',
        color: '#ff4757',
        icon: '🚨',
        title: 'Urgence Vétérinaire',
        message: 'Consultez un vétérinaire immédiatement ou rendez-vous aux urgences vétérinaires.',
      };
    } else if (severity === 'moderate' || selectedSymptoms.length >= 2) {
      return {
        level: 'soon',
        color: '#ffa502',
        icon: '⚠️',
        title: 'Consultation Recommandée',
        message: 'Prenez rendez-vous avec votre vétérinaire dans les 24-48h.',
      };
    } else {
      return {
        level: 'monitor',
        color: '#2ed573',
        icon: '👀',
        title: 'Surveillance',
        message: 'Surveillez l\'évolution des symptômes. Consultez si cela empire.',
      };
    }
  };

  const urgency = showResults ? getUrgencyLevel() : null;

  return (
    <div className="health-page">
      <SubAppHeader
        title="Vérificateur de Symptômes"
        icon="🩺"
        gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        onBack={() => navigate('/health')}
      />

      <div style={{ padding: '16px' }}>
        {!showResults ? (
          <>
            <div className="symptom-checker-intro">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Sélectionnez les symptômes observés chez votre chien. Cet outil vous donnera une
                indication sur l'urgence de la situation.
              </p>
              <div className="symptom-checker-warning">
                ⚠️ Cet outil ne remplace pas un diagnostic vétérinaire professionnel.
              </div>
            </div>

            <div className="symptom-selected-count">
              {selectedSymptoms.length} symptôme{selectedSymptoms.length !== 1 ? 's' : ''} sélectionné{selectedSymptoms.length !== 1 ? 's' : ''}
            </div>

            {SYMPTOM_CATEGORIES.map((cat) => (
              <div key={cat.category} className="symptom-category">
                <div className="symptom-category-header">
                  <span className="symptom-category-icon">{cat.icon}</span>
                  <span className="symptom-category-title">{cat.category}</span>
                </div>
                <div className="symptom-grid">
                  {cat.symptoms.map((symptom) => (
                    <button
                      key={symptom}
                      className={`symptom-chip ${
                        selectedSymptoms.includes(symptom) ? 'selected' : ''
                      }`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="symptom-info-section">
              <div className="symptom-info-group">
                <label>Durée des symptômes</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="health-form-select"
                >
                  <option value="less_24h">Moins de 24h</option>
                  <option value="1_3_days">1-3 jours</option>
                  <option value="more_3_days">Plus de 3 jours</option>
                  <option value="more_week">Plus d'une semaine</option>
                </select>
              </div>

              <div className="symptom-info-group">
                <label>Gravité</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="health-form-select"
                >
                  <option value="mild">Légère</option>
                  <option value="moderate">Modérée</option>
                  <option value="severe">Sévère</option>
                </select>
              </div>
            </div>

            <button
              className="walk-action-btn walk-action-primary"
              style={{ width: '100%', marginTop: '24px' }}
              onClick={analyzeSymptoms}
              disabled={selectedSymptoms.length === 0}
            >
              Analyser les Symptômes
            </button>
          </>
        ) : (
          <>
            <div
              className="symptom-result-card"
              style={{ borderColor: urgency.color }}
            >
              <div
                className="symptom-result-icon"
                style={{ fontSize: '48px', marginBottom: '16px' }}
              >
                {urgency.icon}
              </div>
              <h2
                className="symptom-result-title"
                style={{ color: urgency.color, marginBottom: '12px' }}
              >
                {urgency.title}
              </h2>
              <p className="symptom-result-message">{urgency.message}</p>
            </div>

            <div className="symptom-selected-summary">
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
                Symptômes identifiés:
              </h3>
              <div className="symptom-summary-list">
                {selectedSymptoms.map((symptom) => (
                  <div key={symptom} className="symptom-summary-item">
                    • {symptom}
                  </div>
                ))}
              </div>
            </div>

            <div className="symptom-recommendations">
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
                Recommandations:
              </h3>
              {urgency.level === 'urgent' && (
                <ul className="symptom-rec-list">
                  <li>Contactez immédiatement votre vétérinaire</li>
                  <li>Si fermé, rendez-vous aux urgences vétérinaires</li>
                  <li>Ne donnez aucun médicament sans avis vétérinaire</li>
                  <li>Gardez votre chien au calme</li>
                </ul>
              )}
              {urgency.level === 'soon' && (
                <ul className="symptom-rec-list">
                  <li>Prenez rendez-vous avec votre vétérinaire</li>
                  <li>Notez l'évolution des symptômes</li>
                  <li>Assurez-vous que votre chien s'hydrate</li>
                  <li>Surveillez son comportement</li>
                </ul>
              )}
              {urgency.level === 'monitor' && (
                <ul className="symptom-rec-list">
                  <li>Surveillez l'évolution sur 24-48h</li>
                  <li>Notez tout changement</li>
                  <li>Assurez repos et hydratation</li>
                  <li>Consultez si aggravation</li>
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="walk-action-btn walk-action-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowResults(false);
                  setSelectedSymptoms([]);
                  setDuration('less_24h');
                  setSeverity('mild');
                }}
              >
                Recommencer
              </button>
              <button
                className="walk-action-btn walk-action-primary"
                style={{ flex: 1 }}
                onClick={() => navigate('/health/vets')}
              >
                Trouver un Vétérinaire
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
