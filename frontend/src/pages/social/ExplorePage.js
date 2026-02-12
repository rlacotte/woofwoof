import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending'); // trending | users
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExplore();
  }, []);

  const loadExplore = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real API
      setTimeout(() => {
        setTrendingPosts([
          {
            id: 1,
            photo_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
            likes_count: 245,
            comments_count: 32,
            user_name: 'Marie L.',
            dog_name: 'Max',
          },
          {
            id: 2,
            photo_url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400',
            likes_count: 189,
            comments_count: 21,
            user_name: 'Pierre D.',
            dog_name: 'Luna',
          },
          {
            id: 3,
            photo_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
            likes_count: 156,
            comments_count: 18,
            user_name: 'Sophie M.',
            dog_name: 'Rex',
          },
          {
            id: 4,
            photo_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
            likes_count: 134,
            comments_count: 15,
            user_name: 'Lucas R.',
            dog_name: 'Bella',
          },
          {
            id: 5,
            photo_url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400',
            likes_count: 127,
            comments_count: 14,
            user_name: 'Emma B.',
            dog_name: 'Rocky',
          },
          {
            id: 6,
            photo_url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400',
            likes_count: 98,
            comments_count: 12,
            user_name: 'Thomas V.',
            dog_name: 'Charlie',
          },
        ]);

        setSuggestedUsers([
          {
            id: 1,
            name: 'Marie Laurent',
            dog_name: 'Max',
            followers_count: 1234,
            post_count: 45,
            is_following: false,
          },
          {
            id: 2,
            name: 'Pierre Dubois',
            dog_name: 'Luna',
            followers_count: 987,
            post_count: 32,
            is_following: false,
          },
          {
            id: 3,
            name: 'Sophie Martin',
            dog_name: 'Rex',
            followers_count: 756,
            post_count: 28,
            is_following: true,
          },
          {
            id: 4,
            name: 'Lucas Robert',
            dog_name: 'Bella',
            followers_count: 654,
            post_count: 24,
            is_following: false,
          },
          {
            id: 5,
            name: 'Emma Bernard',
            dog_name: 'Rocky',
            followers_count: 543,
            post_count: 20,
            is_following: false,
          },
        ]);

        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Failed to load explore:', err);
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await api.request(`/social/follow/${userId}`, { method: 'POST' });
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                is_following: !u.is_following,
                followers_count: u.is_following
                  ? u.followers_count - 1
                  : u.followers_count + 1,
              }
            : u
        )
      );
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  return (
    <div className="social-page">
      <SubAppHeader
        title="Explorer"
        icon="🔍"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          🔥 Tendances
        </button>
        <button
          className={`explore-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Suggestions
        </button>
      </div>

      {loading ? (
        <div className="social-loading">
          <div className="social-loading-spinner">🔍</div>
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          {activeTab === 'trending' && (
            <div className="explore-grid">
              {trendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="explore-post-card"
                  onClick={() => navigate('/social')}
                >
                  <div className="explore-post-image-container">
                    <img
                      src={post.photo_url}
                      alt=""
                      className="explore-post-image"
                    />
                    <div className="explore-post-overlay">
                      <div className="explore-post-stats">
                        <span>❤️ {post.likes_count}</span>
                        <span>💬 {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="explore-post-info">
                    <div className="explore-post-user">{post.user_name}</div>
                    {post.dog_name && (
                      <div className="explore-post-dog">🐾 {post.dog_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="explore-users-list">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="explore-user-card">
                  <div
                    className="explore-user-info"
                    onClick={() => navigate(`/social/profile/${user.id}`)}
                  >
                    <div className="explore-user-avatar">👤</div>
                    <div className="explore-user-details">
                      <div className="explore-user-name">{user.name}</div>
                      {user.dog_name && (
                        <div className="explore-user-dog">🐾 {user.dog_name}</div>
                      )}
                      <div className="explore-user-stats">
                        {user.followers_count} abonnés · {user.post_count} posts
                      </div>
                    </div>
                  </div>
                  <button
                    className={`explore-follow-btn ${
                      user.is_following ? 'following' : ''
                    }`}
                    onClick={() => handleFollow(user.id)}
                  >
                    {user.is_following ? 'Suivi' : 'Suivre'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
