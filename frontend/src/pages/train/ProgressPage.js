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
  dogSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  dogLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontWeight: '600',
  },
  dogSelect: {
    flex: 1,
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '12px',
    color: 'var(--text, #f0f0f5)',
  },
  section: {
    marginBottom: '24px',
  },
  activeCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    marginBottom: '10px',
  },
  activeCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  activeTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    cursor: 'pointer',
  },
  abandonBtn: {
    background: 'none',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: '8px',
    color: '#ff4d6d',
    fontSize: '12px',
    padding: '4px 10px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBarBg: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #56ab2f, #a8e063)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    flexShrink: 0,
    minWidth: '40px',
    textAlign: 'right',
  },
  completedCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  trophy: {
    fontSize: '28px',
    flexShrink: 0,
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  completedDate: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  empty: {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '13px',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '12px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  confirmCard: {
    background: '#1a1a2e',
    borderRadius: '16px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '24px',
    maxWidth: '340px',
    width: '100%',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: '15px',
    marginBottom: '20px',
    lineHeight: '1.4',
    color: 'var(--text, #f0f0f5)',
  },
  confirmBtns: {
    display: 'flex',
    gap: '10px',
  },
  confirmCancel: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    background: 'transparent',
    color: 'var(--text, #f0f0f5)',
    fontSize: '14px',
    cursor: 'pointer',
  },
  confirmDelete: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: '#ff4d6d',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default function ProgressPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmAbandon, setConfirmAbandon] = useState(null);

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (selectedDogId) {
      loadProgress(selectedDogId);
    }
  }, [selectedDogId]);

  const loadDogs = async () => {
    try {
      const data = await api.request('/dogs');
      setDogs(data || []);
      if (data && data.length > 0) {
        setSelectedDogId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load dogs:', err);
    }
  };

  const loadProgress = async (dogId) => {
    try {
      setLoading(true);
      const data = await api.request(`/training/progress/${dogId}`);
      setProgress(data || []);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandon = async (progressId) => {
    try {
      await api.request(`/training/progress/${progressId}`, { method: 'DELETE' });
      setProgress((prev) => prev.filter((p) => p.id !== progressId));
      setConfirmAbandon(null);
    } catch (err) {
      console.error('Failed to abandon program:', err);
    }
  };

  const activePrograms = progress.filter((p) => p.status === 'in_progress');
  const completedPrograms = progress.filter((p) => p.status === 'completed');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Ma progression"
        icon="🎓"
        gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
        onBack={() => navigate('/train')}
      />

      <div style={styles.content}>
        {dogs.length > 1 && (
          <div style={styles.dogSelector}>
            <span style={styles.dogLabel}>Chien :</span>
            <select
              style={styles.dogSelect}
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
            >
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>Chargement de la progression...</div>
        ) : (
          <>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Programmes en cours</div>
              {activePrograms.length === 0 ? (
                <div style={styles.empty}>Aucun programme en cours</div>
              ) : (
                activePrograms.map((prog) => {
                  const pct =
                    prog.total_steps > 0
                      ? Math.round((prog.current_step / prog.total_steps) * 100)
                      : 0;
                  return (
                    <div key={prog.id} style={styles.activeCard}>
                      <div style={styles.activeCardTop}>
                        <div
                          style={styles.activeTitle}
                          onClick={() => navigate(`/train/program/${prog.program_id}`)}
                        >
                          {prog.program_name}
                        </div>
                        <button
                          style={styles.abandonBtn}
                          onClick={() => setConfirmAbandon(prog.id)}
                        >
                          Abandonner
                        </button>
                      </div>
                      <div style={styles.progressRow}>
                        <div style={styles.progressBarBg}>
                          <div
                            style={{ ...styles.progressBarFill, width: `${pct}%` }}
                          />
                        </div>
                        <div style={styles.progressText}>
                          {prog.current_step}/{prog.total_steps}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Programmes termines</div>
              {completedPrograms.length === 0 ? (
                <div style={styles.empty}>Aucun programme termine</div>
              ) : (
                completedPrograms.map((prog) => (
                  <div key={prog.id} style={styles.completedCard}>
                    <div style={styles.trophy}>🏆</div>
                    <div style={styles.completedInfo}>
                      <div style={styles.completedTitle}>{prog.program_name}</div>
                      <div style={styles.completedDate}>
                        Termine le {formatDate(prog.completed_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {confirmAbandon && (
        <div
          style={styles.confirmOverlay}
          onClick={() => setConfirmAbandon(null)}
        >
          <div
            style={styles.confirmCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.confirmText}>
              Etes-vous sur de vouloir abandonner ce programme ? Votre progression sera perdue.
            </div>
            <div style={styles.confirmBtns}>
              <button
                style={styles.confirmCancel}
                onClick={() => setConfirmAbandon(null)}
              >
                Annuler
              </button>
              <button
                style={styles.confirmDelete}
                onClick={() => handleAbandon(confirmAbandon)}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
