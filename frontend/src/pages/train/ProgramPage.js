import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginBottom: '12px',
  },
  metaRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  metaItem: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dogSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  stepsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '4px',
    color: 'var(--text, #f0f0f5)',
  },
  stepCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '12px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '14px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    transition: 'all 0.2s',
  },
  stepCardCurrent: {
    border: '1px solid rgba(168,224,99,0.4)',
    background: 'rgba(168,224,99,0.06)',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.1)',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  stepNumberCompleted: {
    background: '#56ab2f',
    color: '#fff',
  },
  stepNumberCurrent: {
    background: 'linear-gradient(135deg, #56ab2f, #a8e063)',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    lineHeight: '1.4',
    marginBottom: '6px',
  },
  stepTips: {
    fontSize: '12px',
    color: '#a8e063',
    fontStyle: 'italic',
    marginBottom: '4px',
  },
  stepDuration: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #56ab2f, #a8e063)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  actionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  completedMsg: {
    textAlign: 'center',
    padding: '16px',
    background: 'rgba(86,171,47,0.15)',
    border: '1px solid rgba(86,171,47,0.3)',
    borderRadius: '12px',
    color: '#56ab2f',
    fontSize: '15px',
    fontWeight: '600',
  },
};

export default function ProgramPage() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [program, setProgram] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDogs();
    loadProgram();
  }, [programId]);

  useEffect(() => {
    if (selectedDogId) {
      loadUserProgress(selectedDogId);
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

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/training/programs/${programId}`);
      setProgram(data);
    } catch (err) {
      console.error('Failed to load program:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async (dogId) => {
    try {
      const allProgress = await api.request(`/training/progress/${dogId}`);
      const found = (allProgress || []).find(
        (p) => String(p.program_id) === String(programId)
      );
      setUserProgress(found || null);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleStart = async () => {
    if (!selectedDogId) {
      console.error('No dog selected');
      return;
    }
    try {
      setActionLoading(true);
      console.log('Starting program:', { program_id: parseInt(programId), dog_id: parseInt(selectedDogId) });
      await api.request('/training/start', {
        method: 'POST',
        body: JSON.stringify({ program_id: parseInt(programId), dog_id: parseInt(selectedDogId) }),
      });
      await loadUserProgress(selectedDogId);
    } catch (err) {
      console.error('Failed to start program:', err);
      const errorMsg = err?.detail || err?.message || JSON.stringify(err) || 'Impossible de démarrer le programme';
      alert(`Erreur: ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!userProgress) return;
    try {
      setActionLoading(true);
      await api.request(`/training/progress/${userProgress.id}/advance`, {
        method: 'PUT',
      });
      await loadUserProgress(selectedDogId);
    } catch (err) {
      console.error('Failed to advance:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getDifficultyStyle = (difficulty) => {
    const key = (difficulty || '').toLowerCase().replace('é', 'e');
    const config = DIFFICULTY_COLORS[key] || DIFFICULTY_COLORS.debutant;
    return { background: config.bg, color: config.color };
  };

  const getDifficultyLabel = (difficulty) => {
    const key = (difficulty || '').toLowerCase().replace('é', 'e');
    return DIFFICULTY_COLORS[key]?.label || difficulty || 'Debutant';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Programme"
          icon="🎓"
          gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
          onBack={() => navigate('/train')}
        />
        <div style={styles.loading}>Chargement...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Programme"
          icon="🎓"
          gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
          onBack={() => navigate('/train')}
        />
        <div style={styles.loading}>Programme introuvable</div>
      </div>
    );
  }

  const steps = program.steps || [];
  const currentStep = userProgress?.current_step ?? -1;
  const isStarted = userProgress && userProgress.status !== 'not_started';
  const isCompleted = userProgress?.status === 'completed';

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Programme"
        icon="🎓"
        gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
        onBack={() => navigate('/train')}
      />

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.title}>{program.title}</div>
          {program.description && (
            <div style={styles.description}>{program.description}</div>
          )}
          <div style={styles.metaRow}>
            <div
              style={{
                ...styles.difficultyBadge,
                ...getDifficultyStyle(program.difficulty),
              }}
            >
              {getDifficultyLabel(program.difficulty)}
            </div>
            <div style={styles.metaItem}>
              <span>Duree : {program.duration || 'N/A'}</span>
            </div>
          </div>
        </div>

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

        {steps.length > 0 && (
          <div style={styles.stepsSection}>
            <div style={styles.sectionTitle}>Etapes</div>
            {steps.map((step, idx) => {
              const isStepCompleted = isStarted && idx < currentStep;
              const isStepCurrent = isStarted && idx === currentStep;

              return (
                <div
                  key={step.id || idx}
                  style={{
                    ...styles.stepCard,
                    ...(isStepCurrent ? styles.stepCardCurrent : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.stepNumber,
                      ...(isStepCompleted ? styles.stepNumberCompleted : {}),
                      ...(isStepCurrent ? styles.stepNumberCurrent : {}),
                    }}
                  >
                    {isStepCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>{step.title}</div>
                    {step.description && (
                      <div style={styles.stepDesc}>{step.description}</div>
                    )}
                    {step.tips && isStepCurrent && (
                      <div style={styles.stepTips}>Conseil : {step.tips}</div>
                    )}
                    {step.duration && (
                      <div style={styles.stepDuration}>Duree : {step.duration}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isCompleted ? (
          <div style={styles.completedMsg}>Programme termine ! Bravo !</div>
        ) : !isStarted ? (
          <button
            style={{
              ...styles.actionBtn,
              ...(actionLoading ? styles.actionBtnDisabled : {}),
            }}
            onClick={handleStart}
            disabled={actionLoading}
          >
            {actionLoading ? 'Demarrage...' : 'Commencer'}
          </button>
        ) : (
          <button
            style={{
              ...styles.actionBtn,
              ...(actionLoading ? styles.actionBtnDisabled : {}),
            }}
            onClick={handleAdvance}
            disabled={actionLoading}
          >
            {actionLoading ? 'Chargement...' : 'Etape suivante'}
          </button>
        )}
      </div>
    </div>
  );
}
