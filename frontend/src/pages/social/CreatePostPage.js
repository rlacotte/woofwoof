import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const MAX_CHARS = 500;

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [dogId, setDogId] = useState('');
  const [dogs, setDogs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    try {
      const data = await api.request('/dogs');
      setDogs(data || []);
      if (data && data.length > 0) {
        setDogId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load dogs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARS) return;
    try {
      setSubmitting(true);
      setError('');
      await api.request('/social/posts', {
        method: 'POST',
        body: {
          content: content.trim(),
          photo_url: photoUrl.trim() || null,
          dog_id: dogId || null,
        },
      });
      navigate('/social');
    } catch (err) {
      setError('Erreur lors de la publication. Veuillez réessayer.');
      console.error('Failed to create post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0 && content.length <= MAX_CHARS;

  return (
    <div className="social-page">
      <SubAppHeader
        title="Nouveau post"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <div className="create-post-container">
        {error && (
          <div style={{
            background: 'rgba(255, 77, 109, 0.15)',
            border: '1px solid rgba(255, 77, 109, 0.3)',
            color: '#ff4d6d',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            className="create-post-textarea"
            placeholder="Quoi de neuf avec votre compagnon ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div style={{ textAlign: 'right', fontSize: '12px', color: content.length > MAX_CHARS ? '#ff4d6d' : 'var(--text-secondary)', marginBottom: '20px' }}>
            {content.length}/{MAX_CHARS}
          </div>

          <div className="create-post-options">
            <div className="create-post-option">
              <span>📷</span>
              <input
                type="text"
                placeholder="URL de l'image (optionnel)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>

            {dogs.length > 0 && (
              <div className="create-post-option">
                <span>🐾</span>
                <select
                  value={dogId}
                  onChange={(e) => setDogId(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none',
                    appearance: 'none'
                  }}
                >
                  <option value="" style={{ color: 'black' }}>Sélectionner un chien</option>
                  {dogs.map((dog) => (
                    <option key={dog.id} value={dog.id} style={{ color: 'black' }}>
                      {dog.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {photoUrl && (
            <img
              src={photoUrl}
              alt="Aperçu"
              className="create-post-preview"
              onError={(e) => (e.target.style.display = 'none')}
              onLoad={(e) => (e.target.style.display = 'block')}
            />
          )}

          <button
            type="submit"
            className="walk-action-btn walk-action-primary"
            style={{
              width: '100%',
              marginTop: '32px',
              opacity: !isValid || submitting ? 0.5 : 1,
              pointerEvents: !isValid || submitting ? 'none' : 'auto'
            }}
            disabled={!isValid || submitting}
          >
            {submitting ? 'Publication...' : 'Publier'}
          </button>
        </form>
      </div>
    </div>
  );
}

