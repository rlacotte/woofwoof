import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

export default function MyFollowingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following'); // following | followers
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real API
      setTimeout(() => {
        setFollowing([
          {
            id: 1,
            name: 'Marie Laurent',
            dog_name: 'Max',
            followers_count: 1234,
            is_following_back: true,
          },
          {
            id: 2,
            name: 'Pierre Dubois',
            dog_name: 'Luna',
            followers_count: 987,
            is_following_back: false,
          },
          {
            id: 3,
            name: 'Sophie Martin',
            dog_name: 'Rex',
            followers_count: 756,
            is_following_back: true,
          },
        ]);

        setFollowers([
          {
            id: 4,
            name: 'Lucas Robert',
            dog_name: 'Bella',
            followers_count: 654,
            is_following: true,
          },
          {
            id: 5,
            name: 'Emma Bernard',
            dog_name: 'Rocky',
            followers_count: 543,
            is_following: false,
          },
          {
            id: 6,
            name: 'Thomas Vincent',
            dog_name: 'Charlie',
            followers_count: 432,
            is_following: true,
          },
        ]);

        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Failed to load connections:', err);
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.request(`/social/follow/${userId}`, { method: 'POST' });
      setFollowing((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  };

  const handleFollowBack = async (userId) => {
    try {
      await api.request(`/social/follow/${userId}`, { method: 'POST' });
      setFollowers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_following: !u.is_following } : u
        )
      );
    } catch (err) {
      console.error('Failed to follow back:', err);
    }
  };

  return (
    <div className="social-page">
      <SubAppHeader
        title="Mes abonnements"
        icon="👥"
        gradient="linear-gradient(135deg, #667eea, #764ba2)"
        onBack={() => navigate('/social')}
      />

      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Abonnements ({following.length})
        </button>
        <button
          className={`explore-tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Abonnés ({followers.length})
        </button>
      </div>

      {loading ? (
        <div className="social-loading">
          <div className="social-loading-spinner">👥</div>
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          {activeTab === 'following' && (
            <div className="following-list">
              {following.length === 0 ? (
                <div className="social-empty-state">
                  <div className="social-empty-icon">🔍</div>
                  <p>Vous ne suivez personne encore</p>
                  <button
                    className="social-empty-btn"
                    onClick={() => navigate('/social/explore')}
                  >
                    Découvrir des utilisateurs
                  </button>
                </div>
              ) : (
                following.map((user) => (
                  <div key={user.id} className="following-user-card">
                    <div
                      className="following-user-info"
                      onClick={() => navigate(`/social/profile/${user.id}`)}
                    >
                      <div className="following-user-avatar">👤</div>
                      <div className="following-user-details">
                        <div className="following-user-name">{user.name}</div>
                        {user.dog_name && (
                          <div className="following-user-dog">
                            🐾 {user.dog_name}
                          </div>
                        )}
                        <div className="following-user-meta">
                          {user.followers_count} abonnés
                          {user.is_following_back && (
                            <span className="following-mutual-badge">
                              · Vous suit aussi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="following-unfollow-btn"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Ne plus suivre
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="following-list">
              {followers.length === 0 ? (
                <div className="social-empty-state">
                  <div className="social-empty-icon">😊</div>
                  <p>Personne ne vous suit encore</p>
                  <button
                    className="social-empty-btn"
                    onClick={() => navigate('/social/create')}
                  >
                    Créer un post
                  </button>
                </div>
              ) : (
                followers.map((user) => (
                  <div key={user.id} className="following-user-card">
                    <div
                      className="following-user-info"
                      onClick={() => navigate(`/social/profile/${user.id}`)}
                    >
                      <div className="following-user-avatar">👤</div>
                      <div className="following-user-details">
                        <div className="following-user-name">{user.name}</div>
                        {user.dog_name && (
                          <div className="following-user-dog">
                            🐾 {user.dog_name}
                          </div>
                        )}
                        <div className="following-user-meta">
                          {user.followers_count} abonnés
                        </div>
                      </div>
                    </div>
                    <button
                      className={`following-follow-btn ${
                        user.is_following ? 'following' : ''
                      }`}
                      onClick={() => handleFollowBack(user.id)}
                    >
                      {user.is_following ? 'Suivi' : 'Suivre'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
