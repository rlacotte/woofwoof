import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const DIFFICULTY_COLORS = {
  debutant: { bg: 'rgba(86,171,47,0.15)', color: '#56ab2f', label: 'Debutant' },
  intermediaire: { bg: 'rgba(245,166,35,0.15)', color: '#f5a623', label: 'Intermediaire' },
  avance: { bg: 'rgba(255,77,109,0.15)', color: '#ff4d6d', label: 'Avance' },
};

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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressLink: {
    fontSize: '13px',
    color: '#a8e063',
    cursor: 'pointer',
    marginLeft: 'auto',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    textDecoration: 'underline',
  },
  activeCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  activeCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  activeTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
  },
  activeStep: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  progressBarBg: {
    width: '100%',
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
  programsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '8px',
  },
  programCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  programTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '8px',
  },
  difficultyBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  programMeta: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  emptySection: {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '13px',
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '12px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '24px',
  },
};

export default function TrainHomePage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [progress, setProgress] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDogs();
    loadPrograms();
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

  const loadPrograms = async () => {
    try {
      const data = await api.request('/training/programs');
      setPrograms(data || []);
    } catch (err) {
      console.error('Failed to load programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (dogId) => {
    try {
      const data = await api.request(`/training/progress/${dogId}`);
      setProgress(data || []);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const activePrograms = progress.filter((p) => p.status === 'in_progress');

  const getDifficultyStyle = (difficulty) => {
    const key = (difficulty || '').toLowerCase().replace('é', 'e');
    const config = DIFFICULTY_COLORS[key] || DIFFICULTY_COLORS.debutant;
    return { background: config.bg, color: config.color };
  };

  const getDifficultyLabel = (difficulty) => {
    const key = (difficulty || '').toLowerCase().replace('é', 'e');
    return DIFFICULTY_COLORS[key]?.label || difficulty || 'Debutant';
  };

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="WoofTrain"
        icon="🎓"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
      />

      <div className="train-home-header-actions" style={{ padding: '0 16px', paddingBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="train-progress-link"
          onClick={() => navigate('/train/progress')}
        >
          📚 Progrès
        </button>
        <button
          className="train-achievements-link"
          onClick={() => navigate('/train/achievements')}
        >
          🏆 Réussites
        </button>
        <button
          className="train-achievements-link"
          onClick={() => navigate('/train/tips')}
        >
          💡 Conseils
        </button>
      </div>

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
          <div style={styles.loading}>Chargement des programmes...</div>
        ) : (
          <>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                En cours
                <button
                  style={styles.progressLink}
                  onClick={() => navigate('/train/progress')}
                >
                  Voir tout
                </button>
              </div>

              {activePrograms.length === 0 ? (
                <div style={styles.emptySection}>
                  Aucun programme en cours. Choisissez un programme ci-dessous !
                </div>
              ) : (
                activePrograms.map((prog) => {
                  const pct =
                    prog.total_steps > 0
                      ? Math.round((prog.current_step / prog.total_steps) * 100)
                      : 0;
                  return (
                    <div
                      key={prog.id}
                      style={styles.activeCard}
                      onClick={() => navigate(`/train/program/${prog.program_id}`)}
                    >
                      <div style={styles.activeCardHeader}>
                        <div style={styles.activeTitle}>{prog.program_name}</div>
                        <div style={styles.activeStep}>
                          {prog.current_step}/{prog.total_steps}
                        </div>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div
                          style={{ ...styles.progressBarFill, width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Programmes disponibles</div>
              <div style={styles.programsGrid}>
                {programs.map((program) => (
                  <div
                    key={program.id}
                    style={styles.programCard}
                    onClick={() => navigate(`/train/program/${program.id}`)}
                  >
                    <div style={styles.programTitle}>{program.title}</div>
                    <div
                      style={{
                        ...styles.difficultyBadge,
                        ...getDifficultyStyle(program.difficulty),
                      }}
                    >
                      {getDifficultyLabel(program.difficulty)}
                    </div>
                    <div style={styles.programMeta}>
                      <span>Duree : {program.duration || 'N/A'}</span>
                      {program.category && <span>{program.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
