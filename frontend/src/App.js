import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import { LanguageProvider } from './i18n/LanguageContext';

// Core pages
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
import HubPage from './pages/HubPage';

// WoofHealth
import HealthHomePage from './pages/health/HealthHomePage';
import VaccinationsPage from './pages/health/VaccinationsPage';
import AppointmentsPage from './pages/health/AppointmentsPage';

// WoofWalk
import WalkHomePage from './pages/walk/WalkHomePage';
import WalkTrackPage from './pages/walk/WalkTrackPage';
import WalkSpotsPage from './pages/walk/WalkSpotsPage';

// WoofFood
import FoodHomePage from './pages/food/FoodHomePage';
import MealPlanPage from './pages/food/MealPlanPage';
import FoodScanPage from './pages/food/FoodScanPage';

// WoofSitter
import SitterHomePage from './pages/sitter/SitterHomePage';
import SitterProfilePage from './pages/sitter/SitterProfilePage';
import BookingPage from './pages/sitter/BookingPage';

// WoofSocial
import SocialFeedPage from './pages/social/SocialFeedPage';
import SocialProfilePage from './pages/social/SocialProfilePage';
import CreatePostPage from './pages/social/CreatePostPage';

// WoofShop
import ShopHomePage from './pages/shop/ShopHomePage';
import ProductPage from './pages/shop/ProductPage';
import CartPage from './pages/shop/CartPage';

// WoofTrain
import TrainHomePage from './pages/train/TrainHomePage';
import ProgramPage from './pages/train/ProgramPage';
import ProgressPage from './pages/train/ProgressPage';

// WoofAdopt
import AdoptHomePage from './pages/adopt/AdoptHomePage';
import ListingPage from './pages/adopt/ListingPage';
import SheltersPage from './pages/adopt/SheltersPage';

// WoofTravel
import TravelHomePage from './pages/travel/TravelHomePage';
import PlacesMapPage from './pages/travel/PlacesMapPage';
import ChecklistPage from './pages/travel/ChecklistPage';

// WoofInsure
import InsureHomePage from './pages/insure/InsureHomePage';
import ComparePage from './pages/insure/ComparePage';
import ClaimsPage from './pages/insure/ClaimsPage';

// WoofID
import PetIdHomePage from './pages/petid/PetIdHomePage';
import LostPetsPage from './pages/petid/LostPetsPage';
import ScanTagPage from './pages/petid/ScanTagPage';

// WoofBreed
import BreedHomePage from './pages/breed/BreedHomePage';
import BreederPage from './pages/breed/BreederPage';
import PedigreePage from './pages/breed/PedigreePage';

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
          {/* ===== Core Routes ===== */}
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
          <Route path="/hub" element={<HubPage />} />
          <Route path="/search" element={<SearchPage user={user} />} />
          <Route path="/matches" element={<MatchesPage user={user} dogs={dogs} />} />
          <Route path="/chat/:matchId" element={<ChatPage user={user} />} />
          <Route path="/plans" element={<PlansPage user={user} onUserUpdate={setUser} />} />
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
          <Route path="/predictor" element={<PuppyPredictorPage user={user} dogs={dogs} />} />
          <Route path="/dog/:dogId" element={<DogDetailPage />} />
          <Route path="/map" element={<MapPage user={user} activeDog={activeDog} />} />

          {/* ===== WoofHealth ===== */}
          <Route path="/health" element={<HealthHomePage />} />
          <Route path="/health/vaccinations" element={<VaccinationsPage />} />
          <Route path="/health/appointments" element={<AppointmentsPage />} />

          {/* ===== WoofWalk ===== */}
          <Route path="/walk" element={<WalkHomePage />} />
          <Route path="/walk/track" element={<WalkTrackPage />} />
          <Route path="/walk/spots" element={<WalkSpotsPage />} />

          {/* ===== WoofFood ===== */}
          <Route path="/food" element={<FoodHomePage />} />
          <Route path="/food/meals" element={<MealPlanPage />} />
          <Route path="/food/products" element={<FoodScanPage />} />

          {/* ===== WoofSitter ===== */}
          <Route path="/sitter" element={<SitterHomePage />} />
          <Route path="/sitter/:sitterId" element={<SitterProfilePage />} />
          <Route path="/sitter/bookings" element={<BookingPage />} />

          {/* ===== WoofSocial ===== */}
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="/social/profile/:userId" element={<SocialProfilePage />} />
          <Route path="/social/create" element={<CreatePostPage />} />

          {/* ===== WoofShop ===== */}
          <Route path="/shop" element={<ShopHomePage />} />
          <Route path="/shop/product/:productId" element={<ProductPage />} />
          <Route path="/shop/cart" element={<CartPage />} />

          {/* ===== WoofTrain ===== */}
          <Route path="/train" element={<TrainHomePage />} />
          <Route path="/train/program/:programId" element={<ProgramPage />} />
          <Route path="/train/progress" element={<ProgressPage />} />

          {/* ===== WoofAdopt ===== */}
          <Route path="/adopt" element={<AdoptHomePage />} />
          <Route path="/adopt/listing/:listingId" element={<ListingPage />} />
          <Route path="/adopt/shelters" element={<SheltersPage />} />

          {/* ===== WoofTravel ===== */}
          <Route path="/travel" element={<TravelHomePage />} />
          <Route path="/travel/places" element={<PlacesMapPage />} />
          <Route path="/travel/checklists" element={<ChecklistPage />} />

          {/* ===== WoofInsure ===== */}
          <Route path="/insure" element={<InsureHomePage />} />
          <Route path="/insure/compare" element={<ComparePage />} />
          <Route path="/insure/claims" element={<ClaimsPage />} />

          {/* ===== WoofID ===== */}
          <Route path="/petid" element={<PetIdHomePage />} />
          <Route path="/petid/lost" element={<LostPetsPage />} />
          <Route path="/petid/scan" element={<ScanTagPage />} />

          {/* ===== WoofBreed ===== */}
          <Route path="/breed" element={<BreedHomePage />} />
          <Route path="/breed/breeders" element={<BreederPage />} />
          <Route path="/breed/pedigree" element={<PedigreePage />} />

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
