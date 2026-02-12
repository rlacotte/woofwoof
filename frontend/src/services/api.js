const API_BASE = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('woofwoof_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('woofwoof_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('woofwoof_token');
  }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.clearToken();
      window.location.href = '/';
      throw new Error('Session expir\u00e9e');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erreur serveur' }));
      throw new Error(err.detail || 'Erreur');
    }

    return res.json();
  }

  // Auth
  async register(data) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Erreur de connexion');
    }

    const result = await res.json();
    this.setToken(result.access_token);
    return result;
  }

  async getMe() {
    return this.request('/me');
  }

  async updateLocation(lat, lng, city) {
    return this.request('/me/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude: lat, longitude: lng, city }),
    });
  }

  // Dogs
  async createDog(data) {
    return this.request('/dogs', { method: 'POST', body: JSON.stringify(data) });
  }

  async getMyDogs() {
    return this.request('/dogs');
  }

  async updateDog(dogId, data) {
    return this.request(`/dogs/${dogId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Discover & Swipe
  async discover(dogId, options = {}) {
    const params = new URLSearchParams({ dog_id: dogId, ...options });
    return this.request(`/discover?${params}`);
  }

  async swipe(swiperDogId, swipedDogId, action) {
    return this.request('/swipe', {
      method: 'POST',
      body: JSON.stringify({
        swiper_dog_id: swiperDogId,
        swiped_dog_id: swipedDogId,
        action,
      }),
    });
  }

  // Matches
  async getMatches() {
    return this.request('/matches');
  }

  // Messages
  async getMessages(matchId) {
    return this.request(`/messages/${matchId}`);
  }

  async sendMessage(matchId, content) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ match_id: matchId, content }),
    });
  }

  // Puppy Predictor
  async predictPuppies(dog1Id, dog2Id) {
    return this.request('/puppy-predictor', {
      method: 'POST',
      body: JSON.stringify({ dog_1_id: dog1Id, dog_2_id: dog2Id }),
    });
  }

  // Search
  async searchDogs(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        params.append(key, val);
      }
    });
    return this.request(`/search?${params}`);
  }

  // Plans & Subscriptions
  async getPlans() {
    return this.request('/plans');
  }

  async getMySubscription() {
    return this.request('/my-subscription');
  }

  async subscribe(plan) {
    return this.request('/subscribe', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async getSwipeLimit() {
    return this.request('/swipe-limit');
  }

  // Photo Upload
  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}/upload-photo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erreur upload' }));
      throw new Error(err.detail || 'Erreur upload');
    }
    return res.json();
  }

  // Verification
  async verifyHealth(dogId) {
    return this.request(`/dogs/${dogId}/verify-health`, { method: 'POST' });
  }

  async verifyBreeder(dogId) {
    return this.request(`/dogs/${dogId}/verify-breeder`, { method: 'POST' });
  }

  // Dog detail
  async getDog(dogId) {
    return this.request(`/dogs/${dogId}`);
  }

  // Delete dog
  async deleteDog(dogId) {
    return this.request(`/dogs/${dogId}`, { method: 'DELETE' });
  }
}

const api = new ApiService();
export default api;
