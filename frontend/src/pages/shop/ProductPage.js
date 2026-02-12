import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    fontSize: '64px',
  },
  details: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  name: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
    flex: 1,
  },
  price: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ff6b6b',
    flexShrink: 0,
  },
  brand: {
    fontSize: '14px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stars: {
    fontSize: '16px',
    color: '#f5a623',
  },
  ratingText: {
    fontSize: '14px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  stockIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  stockInStock: {
    background: 'rgba(86,171,47,0.15)',
    color: '#56ab2f',
  },
  stockLow: {
    background: 'rgba(245,166,35,0.15)',
    color: '#f5a623',
  },
  stockOut: {
    background: 'rgba(255,77,109,0.15)',
    color: '#ff4d6d',
  },
  stockDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  addToCartSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  qtyBtn: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    color: 'var(--text, #f0f0f5)',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    width: '40px',
    height: '36px',
    background: 'rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    borderLeft: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRight: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  addToCartBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  addToCartBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  successMsg: {
    background: 'rgba(86,171,47,0.15)',
    border: '1px solid rgba(86,171,47,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#56ab2f',
    textAlign: 'center',
  },
};

function renderStars(rating) {
  const stars = [];
  const r = Math.round((rating || 0) * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= r) stars.push('★');
    else stars.push('☆');
  }
  return stars.join('');
}

export default function ProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/shop/products/${productId}`);
      setProduct(data);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    try {
      setAdding(true);
      await api.request('/shop/cart', {
        method: 'POST',
        body: { product_id: product.id, quantity },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  const getStockInfo = () => {
    if (!product) return {};
    const stock = product.stock ?? 0;
    if (stock === 0) return { label: 'Rupture de stock', style: styles.stockOut, dotColor: '#ff4d6d' };
    if (stock <= 5) return { label: `Plus que ${stock} en stock`, style: styles.stockLow, dotColor: '#f5a623' };
    return { label: 'En stock', style: styles.stockInStock, dotColor: '#56ab2f' };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Produit"
          icon="🛍️"
          gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
          onBack={() => navigate('/shop')}
        />
        <div style={styles.loading}>Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Produit"
          icon="🛍️"
          gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
          onBack={() => navigate('/shop')}
        />
        <div style={styles.loading}>Produit introuvable</div>
      </div>
    );
  }

  const stockInfo = getStockInfo();
  const outOfStock = (product.stock ?? 0) === 0;

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Produit"
        icon="🛍️"
        gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
        onBack={() => navigate('/shop')}
      />

      <div style={styles.imageContainer}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.productImage} />
        ) : (
          <div style={styles.imagePlaceholder}>🛍️</div>
        )}
      </div>

      <div style={styles.details}>
        <div style={styles.titleRow}>
          <div style={styles.name}>{product.name}</div>
          <div style={styles.price}>{product.price} EUR</div>
        </div>

        {product.brand && <div style={styles.brand}>{product.brand}</div>}

        <div style={styles.ratingRow}>
          <span style={styles.stars}>{renderStars(product.rating)}</span>
          <span style={styles.ratingText}>{product.rating || 0} / 5</span>
        </div>

        <div style={{ ...styles.stockIndicator, ...stockInfo.style }}>
          <span style={{ ...styles.stockDot, background: stockInfo.dotColor }} />
          {stockInfo.label}
        </div>

        {product.description && (
          <div style={styles.description}>{product.description}</div>
        )}

        {added && <div style={styles.successMsg}>Ajoute au panier !</div>}

        <div style={styles.addToCartSection}>
          <div style={styles.quantityControls}>
            <button
              style={styles.qtyBtn}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={outOfStock}
            >
              -
            </button>
            <div style={styles.qtyValue}>{quantity}</div>
            <button
              style={styles.qtyBtn}
              onClick={() =>
                setQuantity((q) => Math.min(product.stock || 99, q + 1))
              }
              disabled={outOfStock}
            >
              +
            </button>
          </div>
          <button
            style={{
              ...styles.addToCartBtn,
              ...(outOfStock || adding ? styles.addToCartBtnDisabled : {}),
            }}
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
          >
            {adding ? 'Ajout...' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  );
}
