import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';

const SHOP_ITEMS = [
  {
    id: 1,
    name: 'Bon de réduction vétérinaire',
    description: '15% de réduction chez nos vétérinaires partenaires',
    icon: '🏥',
    points: 500,
    category: 'partners',
    stock: 'Disponible',
  },
  {
    id: 2,
    name: 'Sac WoofWoof Premium',
    description: 'Sac de transport de qualité avec logo WoofWoof',
    icon: '🎒',
    points: 2000,
    category: 'goodies',
    stock: 'Limité',
  },
  {
    id: 3,
    name: 'Bon pet shop - 10€',
    description: 'Crédit de 10€ dans nos boutiques partenaires',
    icon: '🛍️',
    points: 800,
    category: 'partners',
    stock: 'Disponible',
  },
  {
    id: 4,
    name: 'Mois Premium gratuit',
    description: 'Un mois d\'accès Premium WoofWoof offert',
    icon: '⭐',
    points: 1500,
    category: 'premium',
    stock: 'Disponible',
  },
  {
    id: 5,
    name: 'T-Shirt WoofWoof',
    description: 'T-shirt officiel en coton bio (tailles S-XL)',
    icon: '👕',
    points: 1200,
    category: 'goodies',
    stock: 'Disponible',
  },
  {
    id: 6,
    name: 'Séance toilettage gratuite',
    description: 'Une séance de toilettage offerte dans nos salons partenaires',
    icon: '✂️',
    points: 1000,
    category: 'partners',
    stock: 'Disponible',
  },
  {
    id: 7,
    name: 'Gamelle Premium WoofWoof',
    description: 'Gamelle en céramique avec gravure personnalisée',
    icon: '🥣',
    points: 1800,
    category: 'goodies',
    stock: 'Limité',
  },
  {
    id: 8,
    name: 'Badge personnalisé',
    description: 'Badge d\'identification personnalisé pour votre chien',
    icon: '🏷️',
    points: 600,
    category: 'goodies',
    stock: 'Disponible',
  },
  {
    id: 9,
    name: 'Séance photo professionnelle',
    description: 'Shooting photo de 1h avec un photographe animalier',
    icon: '📸',
    points: 3000,
    category: 'experience',
    stock: 'Très limité',
  },
  {
    id: 10,
    name: 'Laisse LED WoofWoof',
    description: 'Laisse LED rechargeable pour promenades nocturnes',
    icon: '💡',
    points: 900,
    category: 'goodies',
    stock: 'Disponible',
  },
  {
    id: 11,
    name: 'Cours d\'éducation canine',
    description: '3 séances d\'éducation avec un éducateur certifié',
    icon: '🎓',
    points: 2500,
    category: 'experience',
    stock: 'Disponible',
  },
  {
    id: 12,
    name: 'Bon de réduction assurance',
    description: '20% sur la première année d\'assurance santé',
    icon: '🛡️',
    points: 400,
    category: 'partners',
    stock: 'Disponible',
  },
];

export default function RewardsShopPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [userPoints] = useState(3450); // Mock user points
  const [redeeming, setRedeeming] = useState(null);

  const categories = [
    { value: 'all', label: 'Tout', icon: '🎁' },
    { value: 'partners', label: 'Partenaires', icon: '🤝' },
    { value: 'goodies', label: 'Goodies', icon: '🎨' },
    { value: 'premium', label: 'Premium', icon: '⭐' },
    { value: 'experience', label: 'Expériences', icon: '🎪' },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const handleRedeem = async (item) => {
    if (userPoints < item.points) {
      alert('Vous n\'avez pas assez de points pour cet article');
      return;
    }

    setRedeeming(item.id);
    // Mock API call
    setTimeout(() => {
      alert(`Félicitations ! Vous avez échangé "${item.name}". Vous recevrez un email de confirmation.`);
      setRedeeming(null);
    }, 1000);
  };

  const getStockColor = (stock) => {
    switch (stock) {
      case 'Disponible':
        return '#56ab2f';
      case 'Limité':
        return '#f5a623';
      case 'Très limité':
        return '#ff4757';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="rewards-page">
      <SubAppHeader
        title="Boutique Récompenses"
        icon="🛒"
        gradient="linear-gradient(135deg, #f093fb, #f5576c)"
        onBack={() => navigate('/rewards')}
      />

      <div className="rewards-shop-header">
        <div className="rewards-shop-balance">
          <div className="rewards-shop-balance-label">Vos points disponibles</div>
          <div className="rewards-shop-balance-value">
            🎁 {userPoints.toLocaleString()} pts
          </div>
        </div>
      </div>

      <div className="rewards-shop-categories">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`rewards-shop-category ${
              activeCategory === cat.value ? 'active' : ''
            }`}
            onClick={() => setActiveCategory(cat.value)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="rewards-shop-grid">
        {filteredItems.map((item) => {
          const canAfford = userPoints >= item.points;
          const isRedeeming = redeeming === item.id;

          return (
            <div key={item.id} className="rewards-shop-item">
              <div className="rewards-shop-item-icon">{item.icon}</div>
              <div className="rewards-shop-item-header">
                <div className="rewards-shop-item-name">{item.name}</div>
                <div
                  className="rewards-shop-item-stock"
                  style={{ color: getStockColor(item.stock) }}
                >
                  {item.stock}
                </div>
              </div>
              <div className="rewards-shop-item-description">
                {item.description}
              </div>
              <div className="rewards-shop-item-footer">
                <div className="rewards-shop-item-points">
                  🎁 {item.points.toLocaleString()} pts
                </div>
                <button
                  className={`rewards-shop-item-btn ${
                    canAfford ? 'can-afford' : 'cannot-afford'
                  }`}
                  onClick={() => handleRedeem(item)}
                  disabled={!canAfford || isRedeeming}
                >
                  {isRedeeming
                    ? 'Échange...'
                    : canAfford
                    ? 'Échanger'
                    : 'Insuffisant'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rewards-shop-empty">
          <div className="rewards-shop-empty-icon">🎁</div>
          <p>Aucun article dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}
