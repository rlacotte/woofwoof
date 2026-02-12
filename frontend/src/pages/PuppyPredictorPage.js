import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

const sizeLabels = {
  tiny: '🐾 Très petit (< 5 kg)',
  small: '🐕 Petit (5-10 kg)',
  medium: '🐕 Moyen (10-25 kg)',
  large: '🦮 Grand (25-45 kg)',
  giant: '🐻 Géant (> 45 kg)',
};

export default function PuppyPredictorPage({ user, dogs }) {
  const [allDogs, setAllDogs] = useState([]);
  const [dog1Id, setDog1Id] = useState('');
  const [dog2Id, setDog2Id] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadMatchedDogs();
  }, []);

  async function loadMatchedDogs() {
    try {
      const matches = await api.getMatches();
      const myDogIds = dogs.map((d) => d.id);
      const matchedDogsList = [];

      dogs.forEach((d) => matchedDogsList.push(d));

      matches.forEach((m) => {
        if (myDogIds.includes(m.dog_1.id) && !matchedDogsList.find((d) => d.id === m.dog_2.id)) {
          matchedDogsList.push(m.dog_2);
        }
        if (myDogIds.includes(m.dog_2.id) && !matchedDogsList.find((d) => d.id === m.dog_1.id)) {
          matchedDogsList.push(m.dog_1);
        }
      });

      setAllDogs(matchedDogsList);
      if (dogs.length > 0) setDog1Id(dogs[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  }

  async function handlePredict(e) {
    e.preventDefault();
    if (!dog1Id || !dog2Id) return;
    setError('');
    setLoading(true);
    setPrediction(null);

    try {
      const result = await api.predictPuppies(parseInt(dog1Id), parseInt(dog2Id));
      setPrediction(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const dog1 = allDogs.find((d) => d.id === parseInt(dog1Id));
  const dog2 = allDogs.find((d) => d.id === parseInt(dog2Id));

  return (
    <div className="predictor-page">
      <div className="page-header">
        <h1>{t('predictor.title')}</h1>
      </div>

      <div className="predictor-intro">
        <div className="predictor-intro-icon">🧬</div>
        <p>{t('predictor.subtitle')}</p>
      </div>

      <div className="predictor-form">
        <form onSubmit={handlePredict}>
          <div className="predictor-dogs">
            <div className="predictor-dog-select">
              {dog1?.photo_url_1 ? (
                <img src={dog1.photo_url_1} alt={dog1.name} className="predictor-dog-avatar" />
              ) : (
                <div className="predictor-dog-avatar predictor-dog-avatar-placeholder">
                  {dog1 ? '🐕' : '?'}
                </div>
              )}
              <select value={dog1Id} onChange={(e) => setDog1Id(e.target.value)}>
                <option value="">{t('predictor.selectDog1')}</option>
                {allDogs.map((d) => (
                  <option key={`a-${d.id}`} value={d.id}>
                    {d.name} ({d.breed})
                  </option>
                ))}
              </select>
            </div>

            <span className="predictor-heart">❤️</span>

            <div className="predictor-dog-select">
              {dog2?.photo_url_1 ? (
                <img src={dog2.photo_url_1} alt={dog2.name} className="predictor-dog-avatar" />
              ) : (
                <div className="predictor-dog-avatar predictor-dog-avatar-placeholder">
                  {dog2 ? '🐕' : '?'}
                </div>
              )}
              <select value={dog2Id} onChange={(e) => setDog2Id(e.target.value)}>
                <option value="">{t('predictor.selectDog2')}</option>
                {allDogs.filter((d) => d.id.toString() !== dog1Id).map((d) => (
                  <option key={`b-${d.id}`} value={d.id}>
                    {d.name} ({d.breed})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading || !dog1Id || !dog2Id}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Génération de l'image IA en cours...
              </>
            ) : '🔮 Prédire les chiots'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="predictor-loading">
          <div className="predictor-loading-animation">
            <span>🐕</span>
            <span className="predictor-loading-plus">+</span>
            <span>🐕</span>
            <span className="predictor-loading-equals">=</span>
            <span className="predictor-loading-puppy">🐶</span>
          </div>
          <p>{t('predictor.generating')}</p>
          <p className="predictor-loading-sub">Cela peut prendre 15-30 secondes</p>
        </div>
      )}

      {prediction && (
        <div className="predictor-result">
          {prediction.puppy_image_url && (
            <div className="prediction-image-container">
              <div className="prediction-image-label">
                <span>✨</span> Image générée par IA
              </div>
              <img
                src={prediction.puppy_image_url}
                alt={`Chiot ${prediction.breed_mix}`}
                className="prediction-puppy-image"
              />
              <div className="prediction-image-caption">
                Votre futur chiot {prediction.breed_mix}
              </div>
            </div>
          )}

          <h3>🐶 {t('predictor.title')}</h3>

          <div className="prediction-item prediction-item-highlight">
            <label>Croisement</label>
            <p className="prediction-breed-mix">{prediction.breed_mix}</p>
          </div>

          <div className="prediction-grid">
            <div className="prediction-item">
              <label>📏 Taille estimée</label>
              <p>{sizeLabels[prediction.size_estimate] || prediction.size_estimate}</p>
            </div>

            <div className="prediction-item">
              <label>🐾 Portée estimée</label>
              <p>{prediction.litter_size_estimate}</p>
            </div>
          </div>

          <div className="prediction-item">
            <label>🎨 Couleurs possibles</label>
            <div className="prediction-tags">
              {prediction.possible_colors.map((c) => (
                <span key={c} className="tag tag-coat">{c}</span>
              ))}
            </div>
          </div>

          <div className="prediction-item">
            <label>💡 Tempérament probable</label>
            <div className="prediction-tags">
              {prediction.temperament_mix.map((t) => (
                <span key={t} className="tag tag-temperament">{t}</span>
              ))}
            </div>
          </div>

          <div className="prediction-item prediction-health">
            <label>🏥 Notes santé</label>
            {prediction.health_notes.map((note, i) => (
              <p key={i} className="prediction-health-note">• {note}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
