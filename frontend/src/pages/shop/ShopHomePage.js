import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const CATEGORIES = [
  { key: 'jouets', label: 'Jouets', icon: '🧸' },
  { key: 'accessoires', label: 'Accessoires', icon: '🦴' },
  { key: 'vetements', label: 'Vetements', icon: '👕' },
  { key: 'toilettage', label: 'Toilettage', icon: '🛁' },
  { key: 'couchages', label: 'Couchages', icon: '🛏️' },
  { key: 'gamelles', label: 'Gamelles', icon: '🥣' },
];

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  content: {
    padding: '16px',
    paddingBottom: '24px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    padding: '10px 14px',
    marginBottom: '16px',
  },
  searchIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
  },
  cartBadge: {
    position: 'relative',
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    flexShrink: 0,
    padding: '2px',
  },
  cartCount: {
    position: 'absolute',
    top: '-4px',
    right: '-6px',
    background: '#ff4d6d',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '10px',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  categoriesRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
    marginBottom: '20px',
    scrollbarWidth: 'none',
  },
  categoryChip: {
    flexShrink: 0,
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    color: 'var(--text, #f0f0f5)',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  categoryChipActive: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    borderColor: 'transparent',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '12px',
    color: 'var(--text, #f0f0f5)',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  productCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  productImage: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
    display: 'block',
    background: 'rgba(255,255,255,0.04)',
  },
  productImagePlaceholder: {
    width: '100%',
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  },
  productInfo: {
    padding: '10px 12px',
  },
  productName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productPrice: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: '6px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px',
  },
  ratingStar: {
    fontSize: '12px',
  },
  ratingValue: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  addBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
};

function renderStars(rating) {
  const stars = [];
  const r = Math.round((rating || 0) * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= r) stars.push('★');
    else if (i - 0.5 === r) stars.push('★');
    else stars.push('☆');
  }
  return stars.join('');
}

export default function ShopHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadCartCount();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.request('/shop/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await api.request('/shop/cart');
      setCartCount((cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.request('/shop/cart', {
        method: 'POST',
        body: { product_id: productId, quantity: 1 },
      });
      setCartCount((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      (p.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !activeCategory ||
      (p.category || '').toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const featured = products.filter((p) => p.featured);

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="WoofShop"
        icon="🛍️"
        gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
      />

      <div style={styles.content}>
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={styles.cartBadge} onClick={() => navigate('/shop/cart')}>
            🛒
            {cartCount > 0 && <span style={styles.cartCount}>{cartCount}</span>}
          </button>
        </div>

        <div style={styles.categoriesRow}>
          <div
            style={{
              ...styles.categoryChip,
              ...(!activeCategory ? styles.categoryChipActive : {}),
            }}
            onClick={() => setActiveCategory('')}
          >
            Tous
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              style={{
                ...styles.categoryChip,
                ...(activeCategory === cat.key ? styles.categoryChipActive : {}),
              }}
              onClick={() =>
                setActiveCategory(activeCategory === cat.key ? '' : cat.key)
              }
            >
              {cat.icon} {cat.label}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}>Chargement des produits...</div>
        ) : (
          <>
            {!search && !activeCategory && featured.length > 0 && (
              <>
                <div style={styles.sectionTitle}>En vedette</div>
                <div style={styles.productsGrid}>
                  {featured.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      style={styles.productCard}
                      onClick={() => navigate(`/shop/product/${product.id}`)}
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={styles.productImage} />
                      ) : (
                        <div style={styles.productImagePlaceholder}>🛍️</div>
                      )}
                      <div style={styles.productInfo}>
                        <div style={styles.productName}>{product.name}</div>
                        <div style={styles.productPrice}>{product.price} EUR</div>
                        <div style={styles.ratingRow}>
                          <span style={{ ...styles.ratingStar, color: '#f5a623' }}>
                            {renderStars(product.rating)}
                          </span>
                          <span style={styles.ratingValue}>({product.rating || 0})</span>
                        </div>
                        <button
                          style={styles.addBtn}
                          onClick={(e) => handleAddToCart(e, product.id)}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={styles.sectionTitle}>
              {activeCategory
                ? CATEGORIES.find((c) => c.key === activeCategory)?.label || 'Produits'
                : 'Tous les produits'}
            </div>

            {filtered.length === 0 ? (
              <div style={styles.empty}>Aucun produit trouve</div>
            ) : (
              <div style={styles.productsGrid}>
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    style={styles.productCard}
                    onClick={() => navigate(`/shop/product/${product.id}`)}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt="" style={styles.productImage} />
                    ) : (
                      <div style={styles.productImagePlaceholder}>🛍️</div>
                    )}
                    <div style={styles.productInfo}>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productPrice}>{product.price} EUR</div>
                      <div style={styles.ratingRow}>
                        <span style={{ ...styles.ratingStar, color: '#f5a623' }}>
                          {renderStars(product.rating)}
                        </span>
                        <span style={styles.ratingValue}>({product.rating || 0})</span>
                      </div>
                      <button
                        style={styles.addBtn}
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
