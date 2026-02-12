import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

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
  cartItem: {
    display: 'flex',
    gap: '12px',
    padding: '14px',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    marginBottom: '12px',
  },
  itemImage: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  itemPrice: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ff6b6b',
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  qtyBtn: {
    width: '30px',
    height: '30px',
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    color: 'var(--text, #f0f0f5)',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    width: '32px',
    height: '30px',
    background: 'rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    borderLeft: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRight: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d6d',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  summaryCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '16px',
    marginTop: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0',
    marginTop: '8px',
    borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
  },
  orderBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'opacity 0.2s',
  },
  orderBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  emptyIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '13px',
    marginBottom: '20px',
  },
  shopLink: {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  successMsg: {
    background: 'rgba(86,171,47,0.15)',
    border: '1px solid rgba(86,171,47,0.3)',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    color: '#56ab2f',
    textAlign: 'center',
    marginBottom: '16px',
  },
};

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await api.request('/shop/cart');
      setCartItems(data || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.request(`/shop/cart/${itemId}`, {
        method: 'PUT',
        body: { quantity: newQuantity },
      });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.request(`/shop/cart/${itemId}`, { method: 'DELETE' });
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      setOrdering(true);
      await api.request('/shop/orders', { method: 'POST' });
      setOrderSuccess(true);
      setCartItems([]);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setOrdering(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const total = subtotal;

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Panier"
          icon="🛍️"
          gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
          onBack={() => navigate('/shop')}
        />
        <div style={styles.loading}>Chargement du panier...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Panier"
        icon="🛍️"
        gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)"
        onBack={() => navigate('/shop')}
      />

      <div style={styles.content}>
        {orderSuccess && (
          <div style={styles.successMsg}>
            Commande passee avec succes ! Merci pour votre achat.
          </div>
        )}

        {cartItems.length === 0 && !orderSuccess ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyIcon}>🛒</div>
            <div style={styles.emptyText}>Votre panier est vide</div>
            <div style={styles.emptySubtext}>
              Decouvrez nos produits pour votre compagnon
            </div>
            <button style={styles.shopLink} onClick={() => navigate('/shop')}>
              Voir la boutique
            </button>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                {item.image_url ? (
                  <img src={item.image_url} alt="" style={styles.itemImage} />
                ) : (
                  <div style={styles.itemImagePlaceholder}>🛍️</div>
                )}
                <div style={styles.itemDetails}>
                  <div>
                    <div style={styles.itemName}>{item.product_name || item.name}</div>
                    <div style={styles.itemPrice}>
                      {((item.price || 0) * (item.quantity || 1)).toFixed(2)} EUR
                    </div>
                  </div>
                  <div style={styles.itemControls}>
                    <div style={styles.quantityControls}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      >
                        -
                      </button>
                      <div style={styles.qtyValue}>{item.quantity || 1}</div>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cartItems.length > 0 && (
              <>
                <div style={styles.summaryCard}>
                  <div style={styles.summaryRow}>
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} EUR</span>
                  </div>
                  <div style={styles.summaryTotal}>
                    <span>Total</span>
                    <span>{total.toFixed(2)} EUR</span>
                  </div>
                </div>

                <button
                  style={{
                    ...styles.orderBtn,
                    ...(ordering ? styles.orderBtnDisabled : {}),
                  }}
                  onClick={handleOrder}
                  disabled={ordering}
                >
                  {ordering ? 'Commande en cours...' : 'Commander'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
