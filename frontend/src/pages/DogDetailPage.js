import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';





export default function DogDetailPage() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const [dog, setDog] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const activityLabels = { low: t('activity.low'), moderate: t('activity.moderate'), high: t('activity.high'), very_high: t('activity.very_high') };
  const vaccinLabels = { a_jour: t('vaccine.upToDate'), partiel: t('vaccine.partial'), non_vaccine: t('vaccine.none') };
  const dietLabels = { croquettes: t('diet.croquettes'), patee: t('diet.patee'), barf: t('diet.barf'), mixte: t('diet.mixte') };

  useEffect(() => {
    loadDog();
  }, [dogId]);

  async function loadDog() {
    try {
      const d = await api.getDog(dogId);
      setDog(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dog-detail-page">
        <div className="empty-state">
          <div className="loading-logo" style={{ fontSize: 48 }}>🐾</div>
          <p>{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="dog-detail-page">
        <div className="empty-state">
          <div className="empty-state-icon">😢</div>
          <h2>{t('detail.notFound')}</h2>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>{t('detail.back')}</button>
        </div>
      </div>
    );
  }

  const photos = [dog.photo_url_1, dog.photo_url_2, dog.photo_url_3, dog.photo_url_4, dog.photo_url_5, dog.photo_url_6].filter(Boolean);

  return (
    <div className="dog-detail-page">
      {/* Photo Gallery */}
      <div className="detail-gallery">
        <button className="detail-back-btn" onClick={() => navigate(-1)}>←</button>

        {photos.length > 0 ? (
          <>
            <img
              src={photos[activePhoto]}
              alt={dog.name}
              className="detail-gallery-img"
            />
            {photos.length > 1 && (
              <div className="detail-gallery-dots">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    className={`detail-gallery-dot ${i === activePhoto ? 'active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                  />
                ))}
              </div>
            )}
            {photos.length > 1 && (
              <>
                {activePhoto > 0 && (
                  <button className="detail-gallery-nav detail-gallery-prev" onClick={() => setActivePhoto(p => p - 1)}>‹</button>
                )}
                {activePhoto < photos.length - 1 && (
                  <button className="detail-gallery-nav detail-gallery-next" onClick={() => setActivePhoto(p => p + 1)}>›</button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="detail-gallery-placeholder">🐕</div>
        )}

        {/* Verification badges overlay */}
        <div className="detail-badges">
          {dog.health_verified && (
            <span className="detail-badge detail-badge-health">✅ {t('detail.healthVerified')}</span>
          )}
          {dog.breeder_certified && (
            <span className="detail-badge detail-badge-breeder">🏅 {t('detail.breederCertified')}</span>
          )}
          {dog.has_pedigree && (
            <span className="detail-badge detail-badge-lof">LOF</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="detail-body">
        <div className="detail-header">
          <h1>
            {dog.name}
            <span className="sex-icon">{dog.sex === 'male' ? '♂' : '♀'}</span>
          </h1>
          <div className="detail-breed">{dog.breed}</div>
        </div>

        {/* Quick stats */}
        <div className="detail-stats-grid">
          <div className="detail-stat">
            <span className="detail-stat-icon">🎂</span>
            <span className="detail-stat-value">{dog.age_years} an{dog.age_years > 1 ? 's' : ''}{dog.age_months > 0 ? ` ${dog.age_months}m` : ''}</span>
            <span className="detail-stat-label">{t('detail.age')}</span>
          </div>
          {dog.weight_kg && (
            <div className="detail-stat">
              <span className="detail-stat-icon">⚖️</span>
              <span className="detail-stat-value">{dog.weight_kg} kg</span>
              <span className="detail-stat-label">{t('detail.weight')}</span>
            </div>
          )}
          {dog.height_cm && (
            <div className="detail-stat">
              <span className="detail-stat-icon">📏</span>
              <span className="detail-stat-value">{dog.height_cm} cm</span>
              <span className="detail-stat-label">{t('detail.height')}</span>
            </div>
          )}
          <div className="detail-stat">
            <span className="detail-stat-icon">{dog.intention === 'reproduction' ? '🧬' : dog.intention === 'both' ? '🔀' : '🌳'}</span>
            <span className="detail-stat-value">{dog.intention === 'reproduction' ? 'Repro' : dog.intention === 'both' ? 'Les 2' : 'Balade'}</span>
            <span className="detail-stat-label">{t('detail.intention')}</span>
          </div>
        </div>

        {/* Temperament */}
        {dog.temperament && (
          <div className="detail-section">
            <h3>💡 {t('detail.character')}</h3>
            <div className="detail-tags">
              {dog.temperament.split(',').map(t => (
                <span key={t} className="tag tag-temperament">{t.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {dog.bio && (
          <div className="detail-section">
            <h3>📝 {t('detail.bio')}</h3>
            <p className="detail-bio">{dog.bio}</p>
          </div>
        )}

        {/* Physique */}
        {(dog.coat_color || dog.eye_color) && (
          <div className="detail-section">
            <h3>💪 {t('detail.physique')}</h3>
            <div className="detail-info-grid">
              {dog.coat_color && <div className="detail-info-item"><span className="detail-info-label">{t('detail.coat')}</span><span>{dog.coat_color}</span></div>}
              {dog.eye_color && <div className="detail-info-item"><span className="detail-info-label">{t('detail.eyes')}</span><span>{dog.eye_color}</span></div>}
              <div className="detail-info-item"><span className="detail-info-label">{t('detail.neutered')}</span><span>{dog.is_neutered ? t('detail.yes') : t('detail.no')}</span></div>
            </div>
          </div>
        )}

        {/* Social */}
        {(dog.good_with_kids !== null || dog.good_with_cats !== null || dog.good_with_dogs !== null) && (
          <div className="detail-section">
            <h3>🤝 {t('detail.social')}</h3>
            <div className="detail-social-grid">
              {dog.good_with_kids !== null && (
                <div className={`detail-social-item ${dog.good_with_kids ? 'positive' : 'negative'}`}>
                  <span>👶</span> Enfants: {dog.good_with_kids ? '✅' : '❌'}
                </div>
              )}
              {dog.good_with_cats !== null && (
                <div className={`detail-social-item ${dog.good_with_cats ? 'positive' : 'negative'}`}>
                  <span>🐱</span> Chats: {dog.good_with_cats ? '✅' : '❌'}
                </div>
              )}
              {dog.good_with_dogs !== null && (
                <div className={`detail-social-item ${dog.good_with_dogs ? 'positive' : 'negative'}`}>
                  <span>🐕</span> Chiens: {dog.good_with_dogs ? '✅' : '❌'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lifestyle */}
        {(dog.activity_level || dog.diet) && (
          <div className="detail-section">
            <h3>🏃 {t('detail.lifestyle')}</h3>
            <div className="detail-info-grid">
              {dog.activity_level && <div className="detail-info-item"><span className="detail-info-label">{t('detail.activityLevel')}</span><span>{activityLabels[dog.activity_level]}</span></div>}
              {dog.diet && <div className="detail-info-item"><span className="detail-info-label">{t('detail.diet')}</span><span>{dietLabels[dog.diet]}</span></div>}
            </div>
          </div>
        )}

        {/* Health */}
        {(dog.vaccination_status || dog.health_tests || dog.allergies) && (
          <div className="detail-section">
            <h3>🏥 {t('detail.health')}</h3>
            <div className="detail-info-grid">
              {dog.vaccination_status && <div className="detail-info-item"><span className="detail-info-label">{t('detail.vaccines')}</span><span>{vaccinLabels[dog.vaccination_status] || dog.vaccination_status}</span></div>}
              {dog.health_tests && <div className="detail-info-item detail-info-full"><span className="detail-info-label">{t('detail.tests')}</span><span>{dog.health_tests}</span></div>}
              {dog.allergies && <div className="detail-info-item detail-info-full"><span className="detail-info-label">{t('detail.allergies')}</span><span>{dog.allergies}</span></div>}
            </div>
          </div>
        )}

        {/* Pedigree */}
        {(dog.has_pedigree || dog.lof_number || dog.kennel_name || dog.sire_name || dog.dam_name) && (
          <div className="detail-section">
            <h3>🏆 {t('detail.pedigree')}</h3>
            <div className="detail-info-grid">
              {dog.lof_number && <div className="detail-info-item"><span className="detail-info-label">{t('detail.lofNumber')}</span><span>{dog.lof_number}</span></div>}
              {dog.microchip_number && <div className="detail-info-item"><span className="detail-info-label">{t('detail.microchip')}</span><span>{dog.microchip_number}</span></div>}
              {dog.kennel_name && <div className="detail-info-item detail-info-full"><span className="detail-info-label">{t('dog.kennel')}</span><span>{dog.kennel_name}</span></div>}
              {dog.sire_name && <div className="detail-info-item"><span className="detail-info-label">{t('detail.sire')}</span><span>{dog.sire_name}{dog.sire_breed ? ` (${dog.sire_breed})` : ''}</span></div>}
              {dog.dam_name && <div className="detail-info-item"><span className="detail-info-label">{t('detail.dam')}</span><span>{dog.dam_name}{dog.dam_breed ? ` (${dog.dam_breed})` : ''}</span></div>}
            </div>
          </div>
        )}

        {/* Titles */}
        {dog.titles && (
          <div className="detail-section">
            <h3>🏅 {t('detail.titles')}</h3>
            <p className="detail-titles">{dog.titles}</p>
          </div>
        )}
      </div>
    </div>
  );
}
