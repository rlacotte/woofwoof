import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const MEAL_SECTIONS = [
  { type: 'breakfast', label: 'Petit-dejeuner', icon: '🌅' },
  { type: 'lunch', label: 'Dejeuner', icon: '☀️' },
  { type: 'dinner', label: 'Diner', icon: '🌙' },
  { type: 'snack', label: 'Collation', icon: '🦴' },
];

export default function FoodHomePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeDogId) return;
    setLoading(true);
    api.request(`/food/meals/${activeDogId}`)
      .then((data) => {
        setMeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setMeals([]);
        setLoading(false);
      });
  }, [activeDogId]);

  const getMealsByType = (type) => {
    return meals.filter((m) => m.meal_type === type);
  };

  return (
    <div className="food-page">
      <SubAppHeader
        title="WoofFood"
        icon="🍖"
        gradient="linear-gradient(135deg, #f7971e, #ffd200)"
      />

      {dogs.length > 1 && (
        <div className="food-dog-selector">
          <select
            className="food-dog-select"
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(e.target.value)}
          >
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="food-quick-actions">
        <button
          className="food-action-btn food-action-primary"
          onClick={() => navigate('/food/meals')}
        >
          <span className="food-action-icon">+</span>
          Ajouter repas
        </button>
        <button
          className="food-action-btn food-action-secondary"
          onClick={() => navigate('/food/products')}
        >
          <span className="food-action-icon">📦</span>
          Catalogue produits
        </button>
      </div>

      {loading ? (
        <div className="food-loading">Chargement...</div>
      ) : (
        <div className="food-schedule">
          <h3 className="food-schedule-title">Programme alimentaire du jour</h3>
          {MEAL_SECTIONS.map((section) => {
            const sectionMeals = getMealsByType(section.type);
            return (
              <div key={section.type} className="food-schedule-section">
                <div className="food-schedule-header">
                  <span className="food-schedule-icon">{section.icon}</span>
                  <span className="food-schedule-label">{section.label}</span>
                  <span className="food-schedule-count">
                    {sectionMeals.length > 0 ? `${sectionMeals.length} repas` : ''}
                  </span>
                </div>

                {sectionMeals.length === 0 ? (
                  <div className="food-schedule-empty">
                    <p>Aucun repas programm&eacute;</p>
                  </div>
                ) : (
                  <div className="food-schedule-meals">
                    {sectionMeals.map((meal, idx) => (
                      <div key={meal.id || idx} className="food-meal-card">
                        <div className="food-meal-info">
                          <h4 className="food-meal-name">{meal.food_name}</h4>
                          {meal.brand && (
                            <span className="food-meal-brand">{meal.brand}</span>
                          )}
                        </div>
                        <div className="food-meal-details">
                          {meal.portion_grams && (
                            <span className="food-meal-portion">
                              {meal.portion_grams}g
                            </span>
                          )}
                          {meal.time && (
                            <span className="food-meal-time">{meal.time}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
