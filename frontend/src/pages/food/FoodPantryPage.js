import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function FoodPantryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    product_type: 'croquettes',
    kcal_per_kg: 3500,
    current_stock_g: 0,
    total_stock_g: 0,
    low_stock_threshold_g: 500
  });

  // Refill Form State
  const [refillAmount, setRefillAmount] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.request('/food/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.request('/food/products', {
        method: 'POST',
        body: newProduct
      });
      setShowAddModal(false);
      loadProducts();
      // Reset form
      setNewProduct({
        name: '',
        brand: '',
        product_type: 'croquettes',
        kcal_per_kg: 3500,
        current_stock_g: 0,
        total_stock_g: 0,
        low_stock_threshold_g: 500
      });
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  const handleRefill = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !refillAmount) return;
    try {
      await api.request(`/food/products/${selectedProduct.id}/refill`, {
        method: 'POST',
        body: { amount_g: parseFloat(refillAmount) }
      });
      setShowRefillModal(false);
      setRefillAmount('');
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to refill:', err);
      alert('Erreur lors du remplissage');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await api.request(`/food/products/${productId}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const openRefillModal = (product) => {
    setSelectedProduct(product);
    setShowRefillModal(true);
  };

  return (
    <div className="food-page">
      <SubAppHeader
        title="Mon Stock"
        icon="📦"
        gradient="linear-gradient(135deg, #ff9966, #ff5e62)"
        onBack={() => navigate('/food')}
      />

      <div className="food-dashboard">
        {products.map(product => (
          <div key={product.id} className="food-item-card" style={{ display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div className="food-item-icon">
                {product.product_type === 'friandise' ? '🍬' : '🥩'}
              </div>
              <div className="food-item-info">
                <div className="food-item-name">{product.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{product.brand}</div>
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}
              >🗑️</button>
            </div>

            <div className="food-item-stock" style={{ marginBottom: '10px' }}>
              <div className="food-stock-bar-bg" style={{ width: '100%', height: '8px' }}>
                <div
                  className="food-stock-bar-fill"
                  style={{ width: `${Math.min(100, (product.current_stock_g / (product.total_stock_g || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text)' }}>
              <span>Stock: {Math.round(product.current_stock_g)}g</span>
              <span style={{ color: 'var(--text-secondary)' }}>Capacité: {Math.round(product.total_stock_g)}g</span>
            </div>

            <button
              className="walk-action-btn walk-action-primary"
              style={{ marginTop: '12px', width: '100%', padding: '10px', fontSize: '14px' }}
              onClick={() => openRefillModal(product)}
            >
              🔄 Remplir / Ajuster
            </button>
          </div>
        ))}

        {products.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h2>Garde-manger vide</h2>
            <p>Ajoutez vos produits pour suivre le stock</p>
          </div>
        )}

        <button className="social-fab" onClick={() => setShowAddModal(true)}>
          +
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="social-card" style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
            <h3 className="food-section-title">Nouveau Produit</h3>
            <form onSubmit={handleAddProduct}>
              <div className="health-form-group">
                <label className="health-form-label">Nom</label>
                <input className="health-form-input" required
                  value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Croquettes Poulet"
                />
              </div>
              <div className="health-form-group">
                <label className="health-form-label">Marque</label>
                <input className="health-form-input"
                  value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="Ex: Royal Canin"
                />
              </div>
              <div className="health-form-group">
                <label className="health-form-label">Type</label>
                <select className="health-form-select"
                  value={newProduct.product_type} onChange={e => setNewProduct({ ...newProduct, product_type: e.target.value })}
                >
                  <option value="croquettes">Croquettes</option>
                  <option value="patee">Pâtée</option>
                  <option value="friandise">Friandise</option>
                  <option value="complement">Complément</option>
                </select>
              </div>
              <div className="health-form-row">
                <div>
                  <label className="health-form-label">Kcal/kg</label>
                  <input className="health-form-input" type="number"
                    value={newProduct.kcal_per_kg} onChange={e => setNewProduct({ ...newProduct, kcal_per_kg: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="health-form-label">Seuil alerte (g)</label>
                  <input className="health-form-input" type="number"
                    value={newProduct.low_stock_threshold_g} onChange={e => setNewProduct({ ...newProduct, low_stock_threshold_g: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="health-form-row">
                <div>
                  <label className="health-form-label">Stock actuel (g)</label>
                  <input className="health-form-input" type="number"
                    value={newProduct.current_stock_g} onChange={e => setNewProduct({ ...newProduct, current_stock_g: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="health-form-label">Capacité sac (g)</label>
                  <input className="health-form-input" type="number"
                    value={newProduct.total_stock_g} onChange={e => setNewProduct({ ...newProduct, total_stock_g: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="walk-action-btn walk-action-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="walk-action-btn walk-action-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refill Modal */}
      {showRefillModal && (
        <div className="modal-overlay">
          <div className="social-card" style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
            <h3 className="food-section-title">Ajouter du stock</h3>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
              Combien de grammes voulez-vous ajouter à <strong>{selectedProduct?.name}</strong> ?
            </p>
            <form onSubmit={handleRefill}>
              <div className="health-form-group">
                <label className="health-form-label">Quantité (g)</label>
                <input className="health-form-input" type="number" required autoFocus
                  value={refillAmount} onChange={e => setRefillAmount(e.target.value)}
                  placeholder="Ex: 5000"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="walk-action-btn walk-action-secondary" onClick={() => setShowRefillModal(false)}>Annuler</button>
                <button type="submit" className="walk-action-btn walk-action-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
