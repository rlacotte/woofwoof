import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Petit-dejeuner' },
  { value: 'lunch', label: 'Dejeuner' },
  { value: 'dinner', label: 'Diner' },
  { value: 'snack', label: 'Collation' },
];

export default function MealPlanPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    food_name: '',
    brand: '',
    portion_grams: '',
    time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  const fetchMeals = (dogId) => {
    if (!dogId) return;
    setLoading(true);
    api.request(`/food/meals/${dogId}`)
      .then((data) => {
        setMeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setMeals([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeals(activeDogId);
  }, [activeDogId]);

  const resetForm = () => {
    setFormData({
      meal_type: 'breakfast',
      food_name: '',
      brand: '',
      portion_grams: '',
      time: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (meal) => {
    setEditingId(meal.id);
    setFormData({
      meal_type: meal.meal_type || 'breakfast',
      food_name: meal.food_name || '',
      brand: meal.brand || '',
      portion_grams: meal.portion_grams ? String(meal.portion_grams) : '',
      time: meal.time || '',
      notes: meal.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (mealId) => {
    if (!window.confirm('Supprimer ce repas ?')) return;
    try {
      await api.request(`/food/meals/${mealId}`, { method: 'DELETE' });
      fetchMeals(activeDogId);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        dog_id: activeDogId,
        portion_grams: formData.portion_grams
          ? parseInt(formData.portion_grams, 10)
          : null,
      };

      if (editingId) {
        await api.request(`/food/meals/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api.request('/food/meals', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      fetchMeals(activeDogId);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
    setSubmitting(false);
  };

  const getTypeLabel = (type) => {
    const found = MEAL_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="food-page">
      <SubAppHeader
        title="Plan de repas"
        icon="📋"
        gradient="linear-gradient(135deg, #f7971e, #ffd200)"
        onBack={() => navigate('/food')}
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

      <div className="food-actions">
        <button
          className="food-add-btn"
          onClick={() => {
            if (showForm && !editingId) {
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
        >
          {showForm && !editingId ? 'Annuler' : '+ Ajouter un repas'}
        </button>
      </div>

      {showForm && (
        <form className="food-form" onSubmit={handleSubmit}>
          <h4 className="food-form-title">
            {editingId ? 'Modifier le repas' : 'Nouveau repas'}
          </h4>
          <div className="food-form-group">
            <label className="food-form-label">Type de repas</label>
            <select
              className="food-form-select"
              name="meal_type"
              value={formData.meal_type}
              onChange={handleChange}
            >
              {MEAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="food-form-group">
            <label className="food-form-label">Nom de l'aliment</label>
            <input
              className="food-form-input"
              type="text"
              name="food_name"
              value={formData.food_name}
              onChange={handleChange}
              placeholder="Ex: Croquettes poulet"
              required
            />
          </div>
          <div className="food-form-group">
            <label className="food-form-label">Marque</label>
            <input
              className="food-form-input"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ex: Royal Canin"
            />
          </div>
          <div className="food-form-row">
            <div className="food-form-group food-form-half">
              <label className="food-form-label">Portion (g)</label>
              <input
                className="food-form-input"
                type="number"
                name="portion_grams"
                value={formData.portion_grams}
                onChange={handleChange}
                placeholder="150"
              />
            </div>
            <div className="food-form-group food-form-half">
              <label className="food-form-label">Heure</label>
              <input
                className="food-form-input"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="food-form-group">
            <label className="food-form-label">Notes</label>
            <textarea
              className="food-form-textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes supplementaires..."
              rows={2}
            />
          </div>
          <div className="food-form-buttons">
            <button
              className="food-form-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Enregistrement...'
                : editingId
                ? 'Mettre a jour'
                : 'Ajouter'}
            </button>
            {editingId && (
              <button
                className="food-form-cancel"
                type="button"
                onClick={resetForm}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="food-loading">Chargement...</div>
      ) : meals.length === 0 ? (
        <div className="food-empty">
          <span className="food-empty-icon">🍖</span>
          <p>Aucun repas programm&eacute;</p>
        </div>
      ) : (
        <div className="food-meal-list">
          {meals.map((meal, idx) => (
            <div key={meal.id || idx} className="food-meal-card food-meal-editable">
              <div className="food-meal-main">
                <div className="food-meal-info">
                  <span className="food-meal-type-badge">
                    {getTypeLabel(meal.meal_type)}
                  </span>
                  <h4 className="food-meal-name">{meal.food_name}</h4>
                  {meal.brand && (
                    <span className="food-meal-brand">{meal.brand}</span>
                  )}
                </div>
                <div className="food-meal-meta">
                  {meal.portion_grams && (
                    <span className="food-meal-portion">{meal.portion_grams}g</span>
                  )}
                  {meal.time && (
                    <span className="food-meal-time">{meal.time}</span>
                  )}
                </div>
              </div>
              {meal.notes && (
                <p className="food-meal-notes">{meal.notes}</p>
              )}
              <div className="food-meal-actions">
                <button
                  className="food-meal-edit-btn"
                  onClick={() => handleEdit(meal)}
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  className="food-meal-delete-btn"
                  onClick={() => handleDelete(meal.id)}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
