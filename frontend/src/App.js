import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import { LanguageProvider } from './i18n/LanguageContext';
import AuthPage from './pages/AuthPage';
import SwipePage from './pages/SwipePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import PuppyPredictorPage from './pages/PuppyPredictorPage';
import SearchPage from './pages/SearchPage';
import PlansPage from './pages/PlansPage';
import DogDetailPage from './pages/DogDetailPage';
import MapPage from './pages/MapPage';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [activeDog, setActiveDog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('woofwoof_token');
    if (token) {
      api.token = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const me = await api.getMe();
      setUser(me);
      const myDogs = await api.getMyDogs();
      setDogs(myDogs);
      if (myDogs.length > 0) {
        setActiveDog(myDogs[0]);
      }
    } catch {
      api.clearToken();
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(userData) {
    setUser(userData);
    loadUser();
  }

  function handleLogout() {
    api.clearToken();
    setUser(null);
    setDogs([]);
    setActiveDog(null);
  }

  if (loading) {
    return (
      <LanguageProvider>
        <div className="loading-screen">
          <div className="loading-logo">{'\uD83D\uDC3E'}</div>
          <h1>WoofWoof</h1>
        </div>
      </LanguageProvider>
    );
  }

  if (!user) {
    return (
      <LanguageProvider>
        <AuthPage onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              activeDog ? (
                <SwipePage user={user} activeDog={activeDog} />
              ) : (
                <Navigate to="/profile" />
              )
            }
          />
          <Route
            path="/search"
            element={<SearchPage user={user} />}
          />
          <Route
            path="/matches"
            element={<MatchesPage user={user} dogs={dogs} />}
          />
          <Route
            path="/chat/:matchId"
            element={<ChatPage user={user} />}
          />
          <Route
            path="/plans"
            element={<PlansPage user={user} onUserUpdate={setUser} />}
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                dogs={dogs}
                activeDog={activeDog}
                setActiveDog={setActiveDog}
                onDogsUpdate={(d) => { setDogs(d); if (d.length > 0 && !activeDog) setActiveDog(d[0]); }}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/predictor"
            element={<PuppyPredictorPage user={user} dogs={dogs} />}
          />
          <Route
            path="/dog/:dogId"
            element={<DogDetailPage />}
          />
          <Route
            path="/map"
            element={<MapPage user={user} activeDog={activeDog} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <BottomNav />
        <InstallPrompt />
      </div>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
