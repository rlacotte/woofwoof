import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function FoodHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeDogId) {
      loadDogStats(activeDogId);
      loadMeals(activeDogId);
    }
  }, [activeDogId]);

  const loadData = async () => {
    try {
      const dogsData = await api.request('/dogs');
      setDogs(dogsData || []);
      if (dogsData && dogsData.length > 0) {
        setActiveDogId(dogsData[0].id);
      }

      const productsData = await api.request('/food/products');
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to load food data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDogStats = async (dogId) => {
    try {
      const data = await api.request(`/food/stats/${dogId}`);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadMeals = async (dogId) => {
    try {
      const data = await api.request(`/food/meals/${dogId}?limit=5`);
      setMeals(data || []);
    } catch (err) {
      console.error('Failed to load meals:', err);
    }
  };

  const handleQuickFeed = async (amount) => {
    if (!activeDogId) return;

    // Find default food (first available or handle selection)
    const defaultFood = products.length > 0 ? products[0] : null;

    try {
      await api.request('/food/meals', {
        method: 'POST',
        body: {
          dog_id: activeDogId,
          food_product_id: defaultFood ? defaultFood.id : null,
          amount_g: amount,
          meal_type: 'meal'
        }
      });
      // Refresh
      loadDogStats(activeDogId);
      loadMeals(activeDogId);
      // Refresh products to show updated stock
      const productsData = await api.request('/food/products');
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to feed:', err);
      alert('Erreur lors de l\'enregistrement du repas');
    }
  };

  const timeSince = (isoDate) => {
    if (!isoDate) return 'Jamais';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}j`;
    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  const getStockPercentage = (product) => {
    if (!product.total_stock_g || product.total_stock_g === 0) return 100; // Assume full if no capacity set
    return Math.min(100, Math.max(0, (product.current_stock_g / product.total_stock_g) * 100));
  };

  return (
    <div className="food-page">
      <SubAppHeader
        title="Nutrition"
        icon="🍖"
        gradient="linear-gradient(135deg, #ff9966, #ff5e62)"
        onBack={() => navigate('/')}
      />

      <div className="health-dog-selector" style={{ padding: '16px' }}>
        {dogs.length > 0 ? (
          <select
            className="health-dog-select"
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(parseInt(e.target.value))}
          >
            {dogs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Aucun chien enregistré</div>
        )}
      </div>

      <div className="food-dashboard">
        {/* Timer Card */}
        <div className="food-timer-card">
          <div className="food-timer-label">Dernier repas</div>
          <div className="food-timer-value">
            {stats ? timeSince(stats.last_meal_time) : '--'}
          </div>
          <button
            className="food-action-btn-large"
            onClick={() => handleQuickFeed(150)} // Default 150g, layout could be improved to ask amount
          >
            <span>🍖</span> Nourrir (150g)
          </button>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Appui long pour changer la quantité
          </div>
        </div>

        {/* Stats Grid */}
        <div className="food-stats-grid">
          <div className="food-stat-box">
            <div className="food-stat-icon">🔥</div>
            <div className="food-stat-value">{stats?.calories_today || 0}</div>
            <div className="food-stat-label">Kcal auj.</div>
          </div>
          <div className="food-stat-box">
            <div className="food-stat-icon">🥣</div>
            <div className="food-stat-value">{stats?.meals_count_today || 0}</div>
            <div className="food-stat-label">Repas</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="food-section-title" style={{ marginTop: '10px' }}>Actions rapides</div>
        <div className="food-quick-actions">
          <button className="food-quick-action-chip" onClick={() => handleQuickFeed(50)}>🍬 Friandise</button>
          <button className="food-quick-action-chip" onClick={() => handleQuickFeed(100)}>🥣 Déjeuner</button>
          <button className="food-quick-action-chip" onClick={() => handleQuickFeed(200)}>🌙 Dîner</button>
          <button className="food-quick-action-chip" onClick={() => navigate('/food/products')}>📦 Gérer Stock</button>
        </div>

        {/* Pantry Section */}
        <div className="food-pantry-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="food-section-title" style={{ marginBottom: 0 }}>Mon Stock</div>
            <button style={{ background: 'none', border: 'none', color: '#ff9966', fontSize: '12px', fontWeight: '600' }} onClick={() => navigate('/food/products')}>Voir tout</button>
          </div>

          {products.slice(0, 2).map(product => {
            const pct = getStockPercentage(product);
            const isLow = pct < 20;
            return (
              <div key={product.id} className="food-item-card">
                <div className="food-item-icon">
                  {product.product_type === 'friandise' ? '🍬' : '🥩'}
                </div>
                <div className="food-item-info">
                  <div className="food-item-name">{product.name}</div>
                  <div className="food-item-stock">
                    <div className="food-stock-bar-bg">
                      <div
                        className={`food-stock-bar-fill ${isLow ? 'low' : ''}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(product.current_stock_g / 1000 * 10) / 10}kg</span>
                  </div>
                </div>
                {isLow && (
                  <div style={{ color: '#ff4757', fontSize: '20px' }}>⚠️</div>
                )}
              </div>
            );
          })}

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              Aucun produit. Ajoutez votre nourriture pour suivre le stock !
              <button
                style={{ marginTop: '10px', display: 'block', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                onClick={() => navigate('/food/products')}
              >
                + Ajouter un produit
              </button>
            </div>
          )}
        </div>

        {/* Recent Meals */}
        <div className="food-pantry-section">
          <div className="food-section-title">Historique récent</div>
          <div className="food-log-list">
            {meals.map(meal => (
              <div key={meal.id} className="food-log-item">
                <div>
                  <div className="food-log-time">
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="food-log-detail">
                    {meal.meal_type === 'meal' ? 'Repas' : 'Snack'} • {meal.food_name || 'Nourriture'}
                  </div>
                </div>
                <div style={{ fontWeight: '700', color: '#ff9966' }}>
                  {Math.round(meal.amount_g)}g
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>Aucun repas enregistré</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
