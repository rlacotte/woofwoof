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

  // ============================================================
  // WoofHealth
  // ============================================================
  async getHealthRecords(dogId) {
    return this.request(`/health/records/${dogId}`);
  }
  async createHealthRecord(data) {
    return this.request('/health/records', { method: 'POST', body: JSON.stringify(data) });
  }
  async getVaccinations(dogId) {
    return this.request(`/health/vaccinations/${dogId}`);
  }
  async createVaccination(data) {
    return this.request('/health/vaccinations', { method: 'POST', body: JSON.stringify(data) });
  }
  async getAppointments(dogId) {
    return this.request(`/health/appointments/${dogId}`);
  }
  async createAppointment(data) {
    return this.request('/health/appointments', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateAppointmentStatus(aptId, status) {
    return this.request(`/health/appointments/${aptId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // ============================================================
  // WoofWalk
  // ============================================================
  async getWalks(dogId, limit = 20) {
    return this.request(`/walks/${dogId}?limit=${limit}`);
  }
  async createWalk(data) {
    return this.request('/walks', { method: 'POST', body: JSON.stringify(data) });
  }
  async getWalkStats(dogId) {
    return this.request(`/walks/${dogId}/stats`);
  }
  async getWalkSpots(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/walk-spots?${params}`);
  }
  async createWalkSpot(data) {
    return this.request('/walk-spots', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================
  // WoofFood
  // ============================================================
  async getMealPlan(dogId) {
    return this.request(`/food/meals/${dogId}`);
  }
  async createMeal(data) {
    return this.request('/food/meals', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateMeal(mealId, data) {
    return this.request(`/food/meals/${mealId}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteMeal(mealId) {
    return this.request(`/food/meals/${mealId}`, { method: 'DELETE' });
  }
  async getFoodProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/food/products?${params}`);
  }

  // ============================================================
  // WoofSitter
  // ============================================================
  async getSitters(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/sitters?${params}`);
  }
  async getSitter(sitterId) {
    return this.request(`/sitters/${sitterId}`);
  }
  async createSitterProfile(data) {
    return this.request('/sitters/profile', { method: 'POST', body: JSON.stringify(data) });
  }
  async bookSitter(data) {
    return this.request('/sitters/book', { method: 'POST', body: JSON.stringify(data) });
  }
  async getMyBookings() {
    return this.request('/sitters/bookings/mine');
  }
  async getBookingRequests() {
    return this.request('/sitters/bookings/requests');
  }
  async updateBookingStatus(bookingId, status) {
    return this.request(`/sitters/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  async reviewSitter(data) {
    return this.request('/sitters/reviews', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================
  // WoofSocial
  // ============================================================
  async getSocialFeed(skip = 0, limit = 20) {
    return this.request(`/social/feed?skip=${skip}&limit=${limit}`);
  }
  async createPost(data) {
    return this.request('/social/posts', { method: 'POST', body: JSON.stringify(data) });
  }
  async getPost(postId) {
    return this.request(`/social/posts/${postId}`);
  }
  async deletePost(postId) {
    return this.request(`/social/posts/${postId}`, { method: 'DELETE' });
  }
  async toggleLike(postId) {
    return this.request(`/social/posts/${postId}/like`, { method: 'POST' });
  }
  async addComment(postId, content) {
    return this.request(`/social/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content }) });
  }
  async toggleFollow(userId) {
    return this.request(`/social/follow/${userId}`, { method: 'POST' });
  }
  async getSocialProfile(userId) {
    return this.request(`/social/profile/${userId}`);
  }

  // ============================================================
  // WoofShop
  // ============================================================
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/shop/products?${params}`);
  }
  async getProduct(productId) {
    return this.request(`/shop/products/${productId}`);
  }
  async getCart() {
    return this.request('/shop/cart');
  }
  async addToCart(productId, quantity = 1) {
    return this.request('/shop/cart', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) });
  }
  async updateCartItem(itemId, quantity) {
    return this.request(`/shop/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
  }
  async removeCartItem(itemId) {
    return this.request(`/shop/cart/${itemId}`, { method: 'DELETE' });
  }
  async createOrder(shippingAddress) {
    return this.request('/shop/orders', { method: 'POST', body: JSON.stringify({ shipping_address: shippingAddress }) });
  }
  async getOrders() {
    return this.request('/shop/orders');
  }

  // ============================================================
  // WoofTrain
  // ============================================================
  async getTrainingPrograms(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/training/programs?${params}`);
  }
  async getTrainingProgram(programId) {
    return this.request(`/training/programs/${programId}`);
  }
  async startTraining(dogId, programId) {
    return this.request('/training/start', { method: 'POST', body: JSON.stringify({ dog_id: dogId, program_id: programId }) });
  }
  async getTrainingProgress(dogId) {
    return this.request(`/training/progress/${dogId}`);
  }
  async advanceTraining(progressId) {
    return this.request(`/training/progress/${progressId}/advance`, { method: 'PUT' });
  }
  async abandonTraining(progressId) {
    return this.request(`/training/progress/${progressId}`, { method: 'DELETE' });
  }

  // ============================================================
  // WoofAdopt
  // ============================================================
  async getAdoptionListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/adopt/listings?${params}`);
  }
  async getAdoptionListing(listingId) {
    return this.request(`/adopt/listings/${listingId}`);
  }
  async getShelters(city) {
    const params = city ? `?city=${city}` : '';
    return this.request(`/adopt/shelters${params}`);
  }
  async getShelter(shelterId) {
    return this.request(`/adopt/shelters/${shelterId}`);
  }
  async submitAdoptionRequest(data) {
    return this.request('/adopt/request', { method: 'POST', body: JSON.stringify(data) });
  }
  async getMyAdoptionRequests() {
    return this.request('/adopt/my-requests');
  }

  // ============================================================
  // WoofTravel
  // ============================================================
  async getPetFriendlyPlaces(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/travel/places?${params}`);
  }
  async createPlace(data) {
    return this.request('/travel/places', { method: 'POST', body: JSON.stringify(data) });
  }
  async getChecklists() {
    return this.request('/travel/checklists');
  }
  async createChecklist(data) {
    return this.request('/travel/checklists', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateChecklist(checklistId, data) {
    return this.request(`/travel/checklists/${checklistId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // ============================================================
  // WoofInsure
  // ============================================================
  async getInsurancePlans() {
    return this.request('/insurance/plans');
  }
  async getInsuranceClaims() {
    return this.request('/insurance/claims');
  }
  async submitClaim(data) {
    return this.request('/insurance/claims', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================
  // WoofID
  // ============================================================
  async createPetTag(dogId) {
    return this.request('/id/tags', { method: 'POST', body: JSON.stringify({ dog_id: dogId }) });
  }
  async getDogTags(dogId) {
    return this.request(`/id/tags/dog/${dogId}`);
  }
  async scanTag(tagCode) {
    return this.request(`/id/tags/scan/${tagCode}`);
  }
  async reportLostPet(data) {
    return this.request('/id/lost', { method: 'POST', body: JSON.stringify(data) });
  }
  async getLostPetAlerts() {
    return this.request('/id/lost');
  }
  async getLostPetAlert(alertId) {
    return this.request(`/id/lost/${alertId}`);
  }
  async updateLostPetStatus(alertId, status) {
    return this.request(`/id/lost/${alertId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  async reportSighting(data) {
    return this.request('/id/sightings', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================
  // WoofBreed
  // ============================================================
  async getBreeders(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/breed/breeders?${params}`);
  }
  async getBreeder(breederId) {
    return this.request(`/breed/breeders/${breederId}`);
  }
  async createBreederProfile(data) {
    return this.request('/breed/breeders/profile', { method: 'POST', body: JSON.stringify(data) });
  }
  async getLitters(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return this.request(`/breed/litters?${params}`);
  }
  async createLitter(data) {
    return this.request('/breed/litters', { method: 'POST', body: JSON.stringify(data) });
  }
  async getPedigree(dogId) {
    return this.request(`/breed/pedigree/${dogId}`);
  }
  async addPedigreeEntry(data) {
    return this.request('/breed/pedigree', { method: 'POST', body: JSON.stringify(data) });
  }
}

const api = new ApiService();
export default api;
