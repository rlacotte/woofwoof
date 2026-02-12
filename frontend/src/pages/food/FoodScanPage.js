import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const PRODUCT_TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'croquettes', label: 'Croquettes' },
  { value: 'pate', label: 'Pate' },
  { value: 'friandise', label: 'Friandise' },
  { value: 'complement', label: 'Complement' },
];

export default function FoodScanPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');

  const fetchProducts = (type, search) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const path = queryString ? `/food/products?${queryString}` : '/food/products';

    api.request(path)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts(activeType, searchQuery);
  }, [activeType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(activeType, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const renderStars = (rating) => {
    const r = rating || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="food-product-stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
        <span className="food-product-rating-num">({r.toFixed(1)})</span>
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const found = PRODUCT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="food-page">
      <SubAppHeader
        title="Catalogue produits"
        icon="📦"
        gradient="linear-gradient(135deg, #f7971e, #ffd200)"
        onBack={() => navigate('/food')}
      />

      <div className="food-search-bar">
        <input
          className="food-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un produit..."
        />
        {searchQuery && (
          <button
            className="food-search-clear"
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="food-type-filters">
        {PRODUCT_TYPES.map((type) => (
          <button
            key={type.value}
            className={`food-filter-btn ${activeType === type.value ? 'food-filter-active' : ''}`}
            onClick={() => setActiveType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="food-loading">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="food-empty">
          <span className="food-empty-icon">📦</span>
          <p>Aucun produit trouv&eacute;</p>
          {searchQuery && (
            <p className="food-empty-hint">
              Essayez avec d'autres mots-cl&eacute;s
            </p>
          )}
        </div>
      ) : (
        <div className="food-product-grid">
          {products.map((product, idx) => (
            <div key={product.id || idx} className="food-product-card">
              {product.photo && (
                <div className="food-product-image">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="food-product-img"
                  />
                </div>
              )}
              <div className="food-product-content">
                <div className="food-product-header">
                  <h4 className="food-product-name">{product.name}</h4>
                  <span className="food-product-type-badge">
                    {getTypeBadge(product.type)}
                  </span>
                </div>
                {product.brand && (
                  <span className="food-product-brand">{product.brand}</span>
                )}
                <div className="food-product-footer">
                  {product.rating !== undefined && product.rating !== null && (
                    renderStars(product.rating)
                  )}
                  {product.price !== undefined && product.price !== null && (
                    <span className="food-product-price">
                      {typeof product.price === 'number'
                        ? `${product.price.toFixed(2)} EUR`
                        : product.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
