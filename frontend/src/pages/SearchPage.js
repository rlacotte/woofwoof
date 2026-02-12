import React, { useState } from 'react';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function SearchPage({ user }) {
  const [filters, setFilters] = useState({
    breed: '', sex: '', intention: '', min_age_years: '', max_age_years: '',
    min_weight_kg: '', max_weight_kg: '', has_pedigree: '', health_verified: '',
    coat_color: '', activity_level: '', good_with_kids: '', good_with_cats: '',
    good_with_dogs: '', sort_by: 'distance', per_page: 20,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const { t } = useTranslation();

  function updateFilter(key, val) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  async function handleSearch(e) {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.searchDogs(filters);
      setResults(data);
      setShowFilters(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const activityLabels = { low: t('activity.low'), moderate: t('activity.moderate'), high: t('activity.high'), very_high: t('activity.very_high') };

  return (
    <div className="search-page">
      <div className="page-header">
        <h1>{t('search.title')}</h1>
        <button className="btn-icon" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? '\u25B2' : '\u25BC'} Filtres
        </button>
      </div>

      {error && <div className="auth-error" style={{ margin: 16 }}>{error}</div>}

      {showFilters && (
        <form className="search-filters" onSubmit={handleSearch}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Race</label>
              <input value={filters.breed} onChange={e => updateFilter('breed', e.target.value)} placeholder="Labrador..." />
            </div>
            <div className="form-group">
              <label>Sexe</label>
              <select value={filters.sex} onChange={e => updateFilter('sex', e.target.value)}>
                <option value="">Tous</option>
                <option value="male">Male</option>
                <option value="female">Femelle</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Intention</label>
              <select value={filters.intention} onChange={e => updateFilter('intention', e.target.value)}>
                <option value="">Toutes</option>
                <option value="balade">Balade</option>
                <option value="reproduction">Reproduction</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div className="form-group">
              <label>Activite</label>
              <select value={filters.activity_level} onChange={e => updateFilter('activity_level', e.target.value)}>
                <option value="">Toutes</option>
                <option value="low">Calme</option>
                <option value="moderate">Modere</option>
                <option value="high">Actif</option>
                <option value="very_high">Tres actif</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Age min (ans)</label>
              <input type="number" min="0" value={filters.min_age_years} onChange={e => updateFilter('min_age_years', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Age max (ans)</label>
              <input type="number" min="0" value={filters.max_age_years} onChange={e => updateFilter('max_age_years', e.target.value)} />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Poids min (kg)</label>
              <input type="number" min="0" value={filters.min_weight_kg} onChange={e => updateFilter('min_weight_kg', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Poids max (kg)</label>
              <input type="number" min="0" value={filters.max_weight_kg} onChange={e => updateFilter('max_weight_kg', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Couleur de robe</label>
            <input value={filters.coat_color} onChange={e => updateFilter('coat_color', e.target.value)} placeholder="Noir, Dore..." />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Pedigree</label>
              <select value={filters.has_pedigree} onChange={e => updateFilter('has_pedigree', e.target.value)}>
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sante OK</label>
              <select value={filters.health_verified} onChange={e => updateFilter('health_verified', e.target.value)}>
                <option value="">Tous</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trier par</label>
              <select value={filters.sort_by} onChange={e => updateFilter('sort_by', e.target.value)}>
                <option value="distance">Distance</option>
                <option value="age">Age</option>
                <option value="name">Nom</option>
              </select>
            </div>
          </div>

          <div className="search-social-row">
            <label className="search-chip">
              <input type="checkbox" checked={filters.good_with_kids === 'true'} onChange={e => updateFilter('good_with_kids', e.target.checked ? 'true' : '')} />
              Enfants
            </label>
            <label className="search-chip">
              <input type="checkbox" checked={filters.good_with_cats === 'true'} onChange={e => updateFilter('good_with_cats', e.target.checked ? 'true' : '')} />
              Chats
            </label>
            <label className="search-chip">
              <input type="checkbox" checked={filters.good_with_dogs === 'true'} onChange={e => updateFilter('good_with_dogs', e.target.checked ? 'true' : '')} />
              Chiens
            </label>
          </div>

          <button type="submit" className="btn btn-primary mt-8" disabled={loading}>
            {loading ? '...' : t('search.go')}
          </button>
        </form>
      )}

      {results !== null && (
        <div className="search-results">
          <div className="search-results-header">
            <span>{results.length} resultat{results.length > 1 ? 's' : ''}</span>
            {!showFilters && (
              <button className="btn-link" onClick={() => setShowFilters(true)}>Modifier les filtres</button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="empty-state" style={{ height: 'auto', padding: '40px 24px' }}>
              <div className="empty-state-icon">\uD83D\uDD0D</div>
              <h2>{t('search.noResults')}</h2>
              <p>{t('search.noResultsSub')}</p>
            </div>
          ) : (
            <div className="search-grid">
              {results.map(dog => (
                <div key={dog.id} className="search-card">
                  {dog.photo_url_1 ? (
                    <img src={dog.photo_url_1} alt={dog.name} className="search-card-img" />
                  ) : (
                    <div className="search-card-img search-card-img-placeholder">\uD83D\uDC15</div>
                  )}
                  <div className="search-card-body">
                    <div className="search-card-name">
                      {dog.name} {dog.sex === 'male' ? '\u2642' : '\u2640'}
                      {dog.has_pedigree && <span className="tag tag-pedigree">LOF</span>}
                    </div>
                    <div className="search-card-breed">{dog.breed}</div>
                    <div className="search-card-meta">
                      <span>{dog.age_years} an{dog.age_years > 1 ? 's' : ''}</span>
                      {dog.weight_kg && <span>{dog.weight_kg} kg</span>}
                      {dog.distance_km != null && <span>{dog.distance_km} km</span>}
                    </div>
                    <div className="search-card-tags">
                      {dog.coat_color && <span className="tag tag-coat">{dog.coat_color}</span>}
                      {dog.activity_level && <span className="tag tag-activity">{activityLabels[dog.activity_level] || dog.activity_level}</span>}
                      {dog.health_verified && <span className="tag tag-verified">Sante OK</span>}
                      {dog.good_with_kids && <span className="tag tag-social">Enfants</span>}
                      {dog.good_with_cats && <span className="tag tag-social">Chats</span>}
                      {dog.good_with_dogs && <span className="tag tag-social">Chiens</span>}
                    </div>
                    {dog.owner_city && (
                      <div className="search-card-owner">{dog.owner_name} - {dog.owner_city}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results === null && !showFilters && (
        <div className="empty-state">
          <div className="empty-state-icon">\uD83D\uDD0D</div>
          <h2>{t('search.title')}</h2>
          <p>{t('search.noResultsSub')}</p>
        </div>
      )}
    </div>
  );
}
