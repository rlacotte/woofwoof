import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const MAX_CHARS = 500;

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  form: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  textarea: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    color: 'var(--text, #f0f0f5)',
    resize: 'vertical',
    minHeight: '120px',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  charCount: {
    fontSize: '12px',
    textAlign: 'right',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  charCountOver: {
    color: '#ff4d6d',
  },
  input: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
  },
  select: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  imagePreview: {
    borderRadius: '12px',
    maxHeight: '200px',
    objectFit: 'cover',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.2s',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    background: 'rgba(255,77,109,0.15)',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#ff4d6d',
  },
};

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
      setError('Erreur lors de la publication. Veuillez reessayer.');
      console.error('Failed to create post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0 && content.length <= MAX_CHARS;

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Nouveau post"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Contenu</label>
          <textarea
            style={styles.textarea}
            placeholder="Quoi de neuf avec votre compagnon ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div
            style={{
              ...styles.charCount,
              ...(content.length > MAX_CHARS ? styles.charCountOver : {}),
            }}
          >
            {content.length}/{MAX_CHARS}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Photo (URL)</label>
          <input
            style={styles.input}
            type="url"
            placeholder="https://exemple.com/photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Apercu"
              style={styles.imagePreview}
              onError={(e) => (e.target.style.display = 'none')}
              onLoad={(e) => (e.target.style.display = 'block')}
            />
          )}
        </div>

        {dogs.length > 0 && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Chien (optionnel)</label>
            <select
              style={styles.select}
              value={dogId}
              onChange={(e) => setDogId(e.target.value)}
            >
              <option value="">-- Aucun --</option>
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            ...(!isValid || submitting ? styles.submitBtnDisabled : {}),
          }}
          disabled={!isValid || submitting}
        >
          {submitting ? 'Publication...' : 'Publier'}
        </button>
      </form>
    </div>
  );
}
