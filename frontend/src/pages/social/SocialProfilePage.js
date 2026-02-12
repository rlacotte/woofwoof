import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-deep, #0f0f1a)',
    color: 'var(--text, #f0f0f5)',
  },
  profileHeader: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    border: '3px solid rgba(255,255,255,0.2)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  name: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
    justifyContent: 'center',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text, #f0f0f5)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginTop: '2px',
  },
  followBtn: {
    padding: '10px 32px',
    borderRadius: '24px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  followBtnFollow: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
  },
  followBtnUnfollow: {
    background: 'rgba(255,255,255,0.1)',
    color: 'var(--text, #f0f0f5)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
  },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2px',
    padding: '2px',
  },
  postThumb: {
    aspectRatio: '1',
    objectFit: 'cover',
    width: '100%',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.06)',
    display: 'block',
  },
  postThumbPlaceholder: {
    aspectRatio: '1',
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
  },
  expandedOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  expandedCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '16px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  expandedImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '16px 16px 0 0',
    display: 'block',
  },
  expandedContent: {
    padding: '16px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  expandedStats: {
    padding: '8px 16px 16px',
    display: 'flex',
    gap: '16px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '13px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    color: '#fff',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  noPosts: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
};

export default function SocialProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/social/profile/${userId}`);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await api.request(`/social/follow/${userId}`, { method: 'POST' });
      setProfile((prev) => ({
        ...prev,
        is_following: !prev.is_following,
        followers_count: prev.is_following
          ? prev.followers_count - 1
          : prev.followers_count + 1,
      }));
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Profil"
          icon="📸"
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
          onBack={() => navigate('/social')}
        />
        <div style={styles.loading}>Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.container}>
        <SubAppHeader
          title="Profil"
          icon="📸"
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
          onBack={() => navigate('/social')}
        />
        <div style={styles.noPosts}>Profil introuvable</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <SubAppHeader
        title="Profil"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <div style={styles.profileHeader}>
        <div style={styles.avatar}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="" style={styles.avatarImg} />
          ) : (
            '👤'
          )}
        </div>
        <div style={styles.name}>{profile.name || 'Utilisateur'}</div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.posts_count || 0}</div>
            <div style={styles.statLabel}>Posts</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.followers_count || 0}</div>
            <div style={styles.statLabel}>Abonnes</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{profile.following_count || 0}</div>
            <div style={styles.statLabel}>Abonnements</div>
          </div>
        </div>

        <button
          style={{
            ...styles.followBtn,
            ...(profile.is_following ? styles.followBtnUnfollow : styles.followBtnFollow),
          }}
          onClick={handleFollow}
        >
          {profile.is_following ? 'Ne plus suivre' : 'Suivre'}
        </button>
      </div>

      {(profile.posts || []).length === 0 ? (
        <div style={styles.noPosts}>Aucun post</div>
      ) : (
        <div style={styles.postsGrid}>
          {(profile.posts || []).map((post) => (
            <div key={post.id} onClick={() => setExpandedPost(post)}>
              {post.photo_url ? (
                <img src={post.photo_url} alt="" style={styles.postThumb} />
              ) : (
                <div style={styles.postThumbPlaceholder}>📝</div>
              )}
            </div>
          ))}
        </div>
      )}

      {expandedPost && (
        <div style={styles.expandedOverlay} onClick={() => setExpandedPost(null)}>
          <div
            style={{ ...styles.expandedCard, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setExpandedPost(null)}>
              ✕
            </button>
            {expandedPost.photo_url && (
              <img src={expandedPost.photo_url} alt="" style={styles.expandedImage} />
            )}
            {expandedPost.content && (
              <div style={styles.expandedContent}>{expandedPost.content}</div>
            )}
            <div style={styles.expandedStats}>
              <span>❤️ {expandedPost.likes_count || 0}</span>
              <span>💬 {expandedPost.comments_count || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
