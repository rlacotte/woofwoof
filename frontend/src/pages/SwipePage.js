import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

const activityLabels = { low: 'Calme', moderate: 'Modéré', high: 'Actif', very_high: 'Très actif' };

function PhotoCarousel({ dog }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = [dog.photo_url_1, dog.photo_url_2, dog.photo_url_3]
    .filter(Boolean);

  if (photos.length === 0) {
    return <div className="swipe-card-image-placeholder">🐕</div>;
  }

  if (photos.length === 1) {
    return <img className="swipe-card-image" src={photos[0]} alt={dog.name} draggable={false} />;
  }

  function handleTap(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || e.changedTouches?.[0]?.clientX) - rect.left;
    const third = rect.width / 3;
    if (x < third && activeIndex > 0) {
      setActiveIndex(i => i - 1);
    } else if (x > third * 2 && activeIndex < photos.length - 1) {
      setActiveIndex(i => i + 1);
    }
  }

  return (
    <div className="carousel-container" onClick={handleTap}>
      <img className="swipe-card-image" src={photos[activeIndex]} alt={dog.name} draggable={false} />
      <div className="carousel-indicators">
        {photos.map((_, i) => (
          <div key={i} className={`carousel-indicator ${i === activeIndex ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function SwipeCard({ dog, onSwipe, style, onTapDetail }) {
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [transform, setTransform] = useState('');
  const [likeOpacity, setLikeOpacity] = useState(0);
  const [nopeOpacity, setNopeOpacity] = useState(0);

  function handleStart(clientX, clientY) {
    isDragging.current = true;
    startPos.current = { x: clientX, y: clientY };
  }

  function handleMove(clientX, clientY) {
    if (!isDragging.current) return;
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    currentPos.current = { x: dx, y: dy };
    const rotation = dx * 0.1;
    setTransform(`translate(${dx}px, ${dy}px) rotate(${rotation}deg)`);
    setLikeOpacity(Math.max(0, dx / 100));
    setNopeOpacity(Math.max(0, -dx / 100));
  }

  function handleEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = currentPos.current.x;

    if (Math.abs(dx) > 120) {
      const direction = dx > 0 ? 'like' : 'pass';
      const flyX = dx > 0 ? 600 : -600;
      setTransform(`translate(${flyX}px, ${currentPos.current.y}px) rotate(${dx * 0.2}deg)`);
      setTimeout(() => onSwipe(direction), 200);
    } else {
      setTransform('');
      setLikeOpacity(0);
      setNopeOpacity(0);
      currentPos.current = { x: 0, y: 0 };
    }
  }

  return (
    <div
      ref={cardRef}
      className="swipe-card"
      style={{ ...style, transform, transition: isDragging.current ? 'none' : 'transform 0.4s ease' }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <PhotoCarousel dog={dog} />

      {dog.distance_km != null && (
        <div className="swipe-card-distance">📍 {dog.distance_km} km</div>
      )}

      {dog.owner_city && (
        <div className="swipe-card-owner">{dog.owner_name} · {dog.owner_city}</div>
      )}

      {dog.has_pedigree && (
        <div className="swipe-card-pedigree-badge">LOF ✓</div>
      )}

      {dog.compatibility_score != null && (
        <div className={`compatibility-badge ${dog.compatibility_score >= 75 ? 'compat-high' : dog.compatibility_score >= 50 ? 'compat-mid' : 'compat-low'}`}>
          <span className="compat-value">{dog.compatibility_score}</span>
          <span className="compat-pct">%</span>
        </div>
      )}

      <div className="swipe-overlay swipe-overlay-like" style={{ opacity: likeOpacity }}>LIKE</div>
      <div className="swipe-overlay swipe-overlay-nope" style={{ opacity: nopeOpacity }}>NOPE</div>

      <div className="swipe-card-info">
        <h2 onClick={() => onTapDetail && onTapDetail(dog.id)} style={{ cursor: 'pointer' }}>
          {dog.name}
          <span className="sex-icon">{dog.sex === 'male' ? '♂' : '♀'}</span>
          {dog.health_verified && <span className="verified-inline">✅</span>}
          {dog.breeder_certified && <span className="verified-inline">🏅</span>}
        </h2>
        <div className="swipe-card-breed">{dog.breed}</div>
        <div className="swipe-card-meta">
          <span>🎂 {dog.age_years} an{dog.age_years > 1 ? 's' : ''}{dog.age_months > 0 ? ` ${dog.age_months} mois` : ''}</span>
          {dog.weight_kg && <span>⚖️ {dog.weight_kg} kg</span>}
          {dog.coat_color && <span>🎨 {dog.coat_color}</span>}
        </div>

        <div className="swipe-card-tags">
          {dog.temperament && dog.temperament.split(',').map((t) => (
            <span key={t} className="tag tag-temperament">{t.trim()}</span>
          ))}
          <span className="tag tag-intention">
            {dog.intention === 'reproduction' ? '🧬 Reproduction' : dog.intention === 'both' ? '🔀 Les deux' : '🌳 Balade'}
          </span>
          {dog.health_verified && <span className="tag tag-verified">✓ Santé</span>}
          {dog.breeder_certified && <span className="tag tag-verified">✓ Éleveur</span>}
          {dog.activity_level && <span className="tag tag-activity">{activityLabels[dog.activity_level]}</span>}
        </div>

        <div className="swipe-card-social">
          {dog.good_with_kids && <span className="social-icon">👶 Enfants</span>}
          {dog.good_with_cats && <span className="social-icon">🐱 Chats</span>}
          {dog.good_with_dogs && <span className="social-icon">🐕 Chiens</span>}
        </div>

        {dog.kennel_name && <div className="swipe-card-kennel">🏠 Élevage : {dog.kennel_name}</div>}
        {dog.titles && <div className="swipe-card-titles">🏅 {dog.titles}</div>}
        {dog.bio && <p className="swipe-card-bio">{dog.bio}</p>}
      </div>
    </div>
  );
}

export default function SwipePage({ user, activeDog }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState(null);
  const [swipeError, setSwipeError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    max_distance_km: 200,
    breed: '',
    sex: '',
    intention: '',
    min_age: '',
    max_age: '',
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadCards();
  }, [activeDog?.id]);

  async function loadCards() {
    if (!activeDog) return;
    setLoading(true);
    try {
      const opts = { max_distance_km: filters.max_distance_km };
      if (filters.breed) opts.breed = filters.breed;
      if (filters.sex) opts.sex = filters.sex;
      if (filters.intention) opts.intention = filters.intention;
      if (filters.min_age) opts.min_age = filters.min_age;
      if (filters.max_age) opts.max_age = filters.max_age;
      const results = await api.discover(activeDog.id, opts);
      setCards(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipe(action) {
    if (cards.length === 0) return;
    setSwipeError('');
    const currentCard = cards[cards.length - 1];

    try {
      const result = await api.swipe(activeDog.id, currentCard.id, action);
      setCards((prev) => prev.slice(0, -1));

      if (result.is_match) {
        setMatchPopup(currentCard);
      }
    } catch (err) {
      setSwipeError(err.message);
    }
  }

  function applyFilters() {
    setShowFilters(false);
    loadCards();
  }

  if (loading) {
    return (
      <div className="swipe-page">
        <div className="page-header">
          <h1>WoofWoof</h1>
        </div>
        <div className="empty-state">
          <div className="loading-logo" style={{ fontSize: 48 }}>🐾</div>
          <p>{t('swipe.searching')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-page">
      <div className="page-header">
        <h1>WoofWoof</h1>
        <div className="swipe-header-right">
          <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
            🎛️
          </button>
          <div className="swipe-active-dog">
            {activeDog?.photo_url_1 ? (
              <img src={activeDog.photo_url_1} alt={activeDog.name} className="swipe-active-dog-img" />
            ) : (
              <span className="swipe-active-dog-placeholder">🐕</span>
            )}
            <span>{activeDog?.name}</span>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="discover-filters">
          <div className="discover-filters-grid">
            <div className="form-group">
              <label>{t('filter.maxDistance')}</label>
              <input
                type="range"
                min="5"
                max="500"
                value={filters.max_distance_km}
                onChange={(e) => setFilters(f => ({ ...f, max_distance_km: parseInt(e.target.value) }))}
              />
              <span className="filter-value">{filters.max_distance_km} km</span>
            </div>
            <div className="form-group">
              <label>{t('filter.breed')}</label>
              <input
                value={filters.breed}
                onChange={(e) => setFilters(f => ({ ...f, breed: e.target.value }))}
                placeholder={t("filter.allBreeds")}
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>{t('filter.sex')}</label>
                <select value={filters.sex} onChange={(e) => setFilters(f => ({ ...f, sex: e.target.value }))}>
                  <option value="">{t("filter.all")}</option>
                  <option value="male">{t("filter.male")}</option>
                  <option value="female">{t("filter.female")}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('filter.intention')}</label>
                <select value={filters.intention} onChange={(e) => setFilters(f => ({ ...f, intention: e.target.value }))}>
                  <option value="">{t("filter.allF")}</option>
                  <option value="balade">{t("filter.walk")}</option>
                  <option value="reproduction">{t("filter.reproduction")}</option>
                  <option value="both">{t("filter.both")}</option>
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>{t('filter.minAge')}</label>
                <input type="number" min="0" max="25" value={filters.min_age} onChange={(e) => setFilters(f => ({ ...f, min_age: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label>{t('filter.maxAge')}</label>
                <input type="number" min="0" max="25" value={filters.max_age} onChange={(e) => setFilters(f => ({ ...f, max_age: e.target.value }))} placeholder="25" />
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={applyFilters} style={{ marginTop: 12 }}>
            {t('filter.apply')}
          </button>
        </div>
      )}

      {swipeError && (
        <div className="auth-error" style={{ margin: '8px 16px' }}>{swipeError}</div>
      )}

      {cards.length > 0 ? (
        <>
          <div className="swipe-container">
            {cards.slice(-3).map((dog, i) => (
              <SwipeCard
                key={dog.id}
                dog={dog}
                onSwipe={handleSwipe}
                onTapDetail={(id) => navigate(`/dog/${id}`)}
                style={{ zIndex: i + 1 }}
              />
            ))}
          </div>

          <div className="swipe-actions">
            <button className="swipe-btn swipe-btn-pass" onClick={() => handleSwipe('pass')}>
              ✕
            </button>
            <button className="swipe-btn swipe-btn-super" onClick={() => handleSwipe('super_like')}>
              ⭐
            </button>
            <button className="swipe-btn swipe-btn-like" onClick={() => handleSwipe('like')}>
              ♥
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🐕‍🦺</div>
          <h2>{t('swipe.noMore')}</h2>
          <p>{t('swipe.noMoreSub')}</p>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={loadCards}>
            {t('swipe.refresh')}
          </button>
        </div>
      )}

      {matchPopup && (
        <div className="match-popup">
          <div className="match-popup-sparkles">✨</div>
          <h1>{t('swipe.match')}</h1>
          <p>{activeDog.name} et {matchPopup.name} se sont mutuellement likés !</p>
          <div className="match-popup-dogs">
            <div className="match-popup-dog">
              {activeDog.photo_url_1 ? (
                <img src={activeDog.photo_url_1} alt={activeDog.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : '🐕'}
            </div>
            <div className="match-popup-heart">💕</div>
            <div className="match-popup-dog">
              {matchPopup.photo_url_1 ? (
                <img src={matchPopup.photo_url_1} alt={matchPopup.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : '🐕'}
            </div>
          </div>
          <button className="btn" onClick={() => setMatchPopup(null)}>
            {t('swipe.continue')}
          </button>
        </div>
      )}
    </div>
  );
}
