import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';

const TRAINER_TIPS = [
  {
    id: 1,
    category: 'Bases',
    icon: '🎯',
    title: 'La cohérence est la clé',
    tip: 'Utilisez toujours les mêmes commandes et récompenses. Votre chien apprendra plus vite si tout le monde dans la famille utilise les mêmes mots et gestes.',
  },
  {
    id: 2,
    category: 'Récompenses',
    icon: '🦴',
    title: 'Timing des récompenses',
    tip: 'Récompensez immédiatement (dans les 2 secondes) après le comportement souhaité. Votre chien doit associer la récompense à l\'action correcte.',
  },
  {
    id: 3,
    category: 'Patience',
    icon: '⏱️',
    title: 'Sessions courtes',
    tip: 'Les sessions d\'entraînement devraient durer 5-15 minutes maximum. Plusieurs courtes sessions par jour sont plus efficaces qu\'une longue.',
  },
  {
    id: 4,
    category: 'Motivation',
    icon: '💪',
    title: 'Finir sur une réussite',
    tip: 'Terminez toujours votre session d\'entraînement sur une note positive, avec un exercice que votre chien maîtrise bien.',
  },
  {
    id: 5,
    category: 'Progressivité',
    icon: '📈',
    title: 'Augmentez la difficulté graduellement',
    tip: 'Ne passez à l\'étape suivante que lorsque votre chien maîtrise parfaitement l\'étape actuelle. La patience paie toujours.',
  },
  {
    id: 6,
    category: 'Environnement',
    icon: '🏡',
    title: 'Commencez dans un lieu calme',
    tip: 'Démarrez l\'entraînement dans un environnement sans distractions. Ajoutez progressivement des distractions une fois que votre chien maîtrise la commande.',
  },
  {
    id: 7,
    category: 'Positif',
    icon: '😊',
    title: 'Renforcement positif uniquement',
    tip: 'N\'utilisez jamais de punitions physiques. Le renforcement positif (récompenses) est scientifiquement prouvé comme étant la méthode la plus efficace.',
  },
  {
    id: 8,
    category: 'Socialisation',
    icon: '👥',
    title: 'Socialisez tôt et souvent',
    tip: 'Exposez votre chien à différentes personnes, animaux et situations de manière positive. La socialisation précoce prévient de nombreux problèmes comportementaux.',
  },
  {
    id: 9,
    category: 'Langage corporel',
    icon: '👀',
    title: 'Lisez votre chien',
    tip: 'Apprenez à reconnaître les signes de stress ou de fatigue : bâillements, léchage de babines, détournement du regard. Si vous les voyez, faites une pause.',
  },
  {
    id: 10,
    category: 'Jeu',
    icon: '🎾',
    title: 'Intégrez le jeu',
    tip: 'L\'entraînement doit être amusant ! Utilisez des jouets et du jeu comme récompenses alternatives aux friandises.',
  },
  {
    id: 11,
    category: 'Variété',
    icon: '🔄',
    title: 'Variez les récompenses',
    tip: 'Alternez entre friandises, caresses, jeux et félicitations verbales. Cela garde votre chien motivé et évite qu\'il ne travaille que pour la nourriture.',
  },
  {
    id: 12,
    category: 'Généralisation',
    icon: '🌍',
    title: 'Pratiquez partout',
    tip: 'Une fois qu\'une commande est maîtrisée à la maison, pratiquez-la dans différents lieux : jardin, parc, ville. Votre chien doit obéir partout.',
  },
];

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
  intro: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '16px',
    marginBottom: '20px',
  },
  introIcon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  introTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '8px',
    textAlign: 'center',
  },
  introText: {
    fontSize: '14px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    lineHeight: '1.6',
    textAlign: 'center',
  },
  tipsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tipCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '14px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    padding: '14px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
    minWidth: 0,
  },
  tipCategory: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#667eea',
    background: 'rgba(102, 126, 234, 0.15)',
    padding: '3px 8px',
    borderRadius: '10px',
    marginBottom: '6px',
  },
  tipTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
    marginBottom: '6px',
  },
  tipText: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    lineHeight: '1.5',
  },
};

export default function TrainerTipsPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Conseils d'Expert"
        icon="🎓"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/train')}
      />

      <div style={styles.content}>
        <div style={styles.intro}>
          <div style={styles.introIcon}>🐕‍🦺</div>
          <h2 style={styles.introTitle}>Devenez un pro de l'éducation canine</h2>
          <p style={styles.introText}>
            Découvrez les conseils essentiels des éducateurs canins professionnels pour
            réussir l'éducation de votre compagnon.
          </p>
        </div>

        <div style={styles.tipsGrid}>
          {TRAINER_TIPS.map((tip) => (
            <div key={tip.id} style={styles.tipCard}>
              <div style={styles.tipIcon}>{tip.icon}</div>
              <div style={styles.tipContent}>
                <div style={styles.tipCategory}>{tip.category}</div>
                <h3 style={styles.tipTitle}>{tip.title}</h3>
                <p style={styles.tipText}>{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
