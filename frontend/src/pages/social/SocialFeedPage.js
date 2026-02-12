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
  feed: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '80px',
  },
  postCard: {
    background: 'var(--bg-card, rgba(255,255,255,0.06))',
    borderRadius: '16px',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
    color: 'var(--text, #f0f0f5)',
  },
  dogName: {
    fontSize: '12px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginTop: '2px',
  },
  postImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  postContent: {
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--text, #f0f0f5)',
  },
  postActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '8px 16px 14px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  actionBtnActive: {
    color: '#ff4d6d',
  },
  commentsSection: {
    borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    padding: '12px 16px',
  },
  comment: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  commentAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: '12px',
    color: 'var(--text, #f0f0f5)',
  },
  commentText: {
    fontSize: '13px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    marginTop: '2px',
  },
  commentInputRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  commentInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.12))',
    borderRadius: '20px',
    padding: '8px 14px',
    fontSize: '13px',
    color: 'var(--text, #f0f0f5)',
    outline: 'none',
  },
  commentSendBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary, rgba(240,240,245,0.6))',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
};

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
    try {
      await api.request(`/social/posts/${postId}/like`, { method: 'POST' });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: !p.liked,
                likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err);
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
    <div style={styles.container}>
      <SubAppHeader
        title="WoofSocial"
        icon="📸"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
      />

      {loading ? (
        <div style={styles.loading}>Chargement du fil...</div>
      ) : posts.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📸</div>
          <div>Aucun post pour le moment</div>
        </div>
      ) : (
        <div style={styles.feed}>
          {posts.map((post) => (
            <div key={post.id} style={styles.postCard}>
              <div
                style={styles.postHeader}
                onClick={() => navigate(`/social/profile/${post.user_id}`)}
              >
                <div style={styles.avatar}>
                  {post.user_avatar ? (
                    <img
                      src={post.user_avatar}
                      alt=""
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div style={styles.headerInfo}>
                  <div style={styles.userName}>{post.user_name || 'Utilisateur'}</div>
                  {post.dog_name && <div style={styles.dogName}>🐾 {post.dog_name}</div>}
                </div>
              </div>

              {post.photo_url && (
                <img src={post.photo_url} alt="" style={styles.postImage} />
              )}

              {post.content && <div style={styles.postContent}>{post.content}</div>}

              <div style={styles.postActions}>
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(post.liked ? styles.actionBtnActive : {}),
                  }}
                  onClick={() => handleLike(post.id)}
                >
                  {post.liked ? '❤️' : '🤍'} {post.likes_count || 0}
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={() => toggleComments(post.id)}
                >
                  💬 {post.comments_count || 0}
                </button>
              </div>

              {expandedComments[post.id] && (
                <div style={styles.commentsSection}>
                  {(post.comments || []).map((c, idx) => (
                    <div key={c.id || idx} style={styles.comment}>
                      <div style={styles.commentAvatar}>👤</div>
                      <div style={styles.commentBody}>
                        <div style={styles.commentUser}>{c.user_name || 'Utilisateur'}</div>
                        <div style={styles.commentText}>{c.content}</div>
                      </div>
                    </div>
                  ))}
                  <div style={styles.commentInputRow}>
                    <input
                      style={styles.commentInput}
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
                      style={styles.commentSendBtn}
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

      <button style={styles.fab} onClick={() => navigate('/social/create')}>
        +
      </button>
    </div>
  );
}
