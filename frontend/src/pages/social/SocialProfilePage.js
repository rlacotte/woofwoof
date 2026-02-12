import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

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
      <div className="social-page">
        <SubAppHeader
          title="Profil"
          icon="📸"
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
          onBack={() => navigate('/social')}
        />
        <div className="loading-screen">
          <div className="loading-logo">📸</div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="social-page">
        <SubAppHeader
          title="Profil"
          icon="📸"
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
          onBack={() => navigate('/social')}
        />
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h2>Profil introuvable</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="social-page">
      <SubAppHeader
        title="Profil"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <div className="social-profile-header">
        <div className="social-profile-avatar-container">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="social-profile-avatar" />
          ) : (
            <div className="social-profile-avatar" style={{ background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>👤</div>
          )}
        </div>
        <div className="social-profile-name">{profile.full_name || 'Utilisateur'}</div>

        <div className="social-profile-stats">
          <div className="social-stat-item">
            <div className="social-stat-value">{profile.post_count || 0}</div>
            <div className="social-stat-label">Posts</div>
          </div>
          <div className="social-stat-item">
            <div className="social-stat-value">{profile.followers_count || 0}</div>
            <div className="social-stat-label">Abonnés</div>
          </div>
          <div className="social-stat-item">
            <div className="social-stat-value">{profile.following_count || 0}</div>
            <div className="social-stat-label">Suivi(s)</div>
          </div>
        </div>

        <button
          className={`walk-action-btn ${profile.is_following ? 'walk-action-secondary' : 'walk-action-primary'}`}
          style={{ padding: '10px 32px', fontSize: '14px', width: 'auto', flexDirection: 'row', gap: '8px' }}
          onClick={handleFollow}
        >
          {profile.is_following ? 'Ne plus suivre' : 'Suivre'}
        </button>
      </div>

      {(profile.posts || []).length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <p>Aucun post publié</p>
        </div>
      ) : (
        <div className="social-posts-grid">
          {(profile.posts || []).map((post) => (
            <div key={post.id} onClick={() => setExpandedPost(post)} style={{ position: 'relative', overflow: 'hidden' }}>
              {post.photo_url ? (
                <img src={post.photo_url} alt="" className="social-post-thumb" />
              ) : (
                <div className="social-post-thumb" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📝</div>
              )}
            </div>
          ))}
        </div>
      )}

      {expandedPost && (
        <div className="modal-overlay" onClick={() => setExpandedPost(null)}>
          <div
            className="social-card"
            style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <button
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                onClick={() => setExpandedPost(null)}
              >✕</button>
              {expandedPost.photo_url && (
                <img src={expandedPost.photo_url} alt="" className="social-post-image" />
              )}
            </div>

            {expandedPost.content && (
              <div className="social-post-content">{expandedPost.content}</div>
            )}
            <div className="social-actions" style={{ justifyContent: 'flex-start' }}>
              <span>❤️ {expandedPost.likes_count || 0}</span>
              <span>💬 {expandedPost.comments_count || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

