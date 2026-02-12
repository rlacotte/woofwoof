import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function SocialFeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await api.request('/social/feed');
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            liked_by_me: !p.liked_by_me,
            likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
            just_liked: !p.liked_by_me // Flag for animation
          }
          : p
      )
    );

    try {
      await api.request(`/social/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to like post:', err);
      // Revert on error
      loadFeed();
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    try {
      const newComment = await api.request(`/social/posts/${postId}/comment`, {
        method: 'POST',
        body: { content: text },
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              comments: [...(p.comments || []), newComment],
              comments_count: (p.comments_count || 0) + 1,
            }
            : p
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  return (
    <div className="social-page">
      <SubAppHeader
        title="WoofSocial"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
      />

      <div className="social-header-actions">
        <button
          className="social-quick-link"
          onClick={() => navigate('/social/explore')}
        >
          🔍 Explorer
        </button>
        <button
          className="social-quick-link"
          onClick={() => navigate('/social/following')}
        >
          👥 Abonnements
        </button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height: '60vh' }}>
          <div className="loading-logo">📸</div>
          <p>Chargement du fil...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h2>Aucun post</h2>
          <p>Soyez le premier à partager un moment avec votre chien !</p>
        </div>
      ) : (
        <div className="social-feed">
          {posts.map((post) => (
            <div key={post.id} className="social-card">
              <div
                className="social-card-header"
                onClick={() => navigate(`/social/profile/${post.user_id}`)}
              >
                {post.user_avatar ? (
                  <img
                    src={post.user_avatar}
                    alt=""
                    className="social-avatar"
                  />
                ) : (
                  <div className="social-avatar-placeholder">👤</div>
                )}
                <div className="social-header-info">
                  <div className="social-username">{post.user_name || 'Utilisateur'}</div>
                  {post.dog_name && <div className="social-dog-name">🐾 {post.dog_name}</div>}
                </div>
              </div>

              {post.photo_url && (
                <div style={{ position: 'relative' }} onDoubleClick={() => handleLike(post.id)}>
                  <img src={post.photo_url} alt="" className="social-post-image" />
                  {post.just_liked && (
                    <div style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '80px',
                      animation: 'float 0.8s ease-out forwards',
                      pointerEvents: 'none'
                    }}>❤️</div>
                  )}
                </div>
              )}

              {post.content && <div className="social-post-content">{post.content}</div>}

              <div className="social-actions">
                <button
                  className={`social-action-btn ${post.liked_by_me ? 'active' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {post.liked_by_me ? '❤️' : '🤍'} {post.likes_count || 0}
                </button>
                <button
                  className="social-action-btn"
                  onClick={() => toggleComments(post.id)}
                >
                  💬 {post.comments_count || 0}
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="social-comments-section">
                  {(post.comments || []).map((c, idx) => (
                    <div key={c.id || idx} className="social-comment">
                      <div className="social-comment-avatar-container">
                        {/* Placeholder or real avatar logic if available in comment data */}
                        <div className="social-comment-avatar" style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                      </div>
                      <div className="social-comment-body">
                        <div className="social-comment-user">{c.user_name || 'Utilisateur'}</div>
                        <div className="social-comment-text">{c.content}</div>
                      </div>
                    </div>
                  ))}
                  <div className="social-comment-input-row">
                    <input
                      className="social-comment-input"
                      placeholder="Ajouter un commentaire..."
                      value={commentTexts[post.id] || ''}
                      onChange={(e) =>
                        setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(post.id);
                      }}
                    />
                    <button
                      className="social-comment-send"
                      onClick={() => handleComment(post.id)}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="social-fab" onClick={() => navigate('/social/create')}>
        +
      </button>
    </div>
  );
}

