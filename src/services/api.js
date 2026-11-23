const API_BASE = '/api';

// Helper générique fetch avec gestion robuste des erreurs
async function request(endpoint, options = {}) {
  const geminiKey = localStorage.getItem('nutrivision_gemini_key') || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(geminiKey ? { 'x-gemini-key': geminiKey } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur serveur (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Requête ${endpoint} échouée :`, error.message);
    throw error;
  }
}

export const api = {
  // PROFIL & PHYSIOLOGIE
  async getProfile() {
    return request('/profile');
  },

  async saveProfile(profileData) {
    return request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  // JOURNAL DES REPAS
  async getMeals(dateStr) {
    return request(`/meals?date=${encodeURIComponent(dateStr)}`);
  },

  async addMeal(mealData) {
    return request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData)
    });
  },

  async deleteMeal(mealId) {
    return request(`/meals/${encodeURIComponent(mealId)}`, {
      method: 'DELETE'
    });
  },

  // SUIVI EAU & POIDS
  async updateWater(dateStr, amountMl) {
    return request('/daily/water', {
      method: 'POST',
      body: JSON.stringify({ date: dateStr, amountMl })
    });
  },

  async updateWeight(dateStr, weightKg) {
    return request('/daily/weight', {
      method: 'POST',
      body: JSON.stringify({ date: dateStr, weightKg })
    });
  },

  async updateActivity(dateStr, burnedCalories) {
    return request('/daily/activity', {
      method: 'POST',
      body: JSON.stringify({ date: dateStr, burnedCalories })
    });
  },

  // SCAN VLM & DÉTECTION IA
  async scanMeal(imageDataUrl, userComment = '', customApiKey = '') {
    const apiKey = customApiKey || localStorage.getItem('nutrivision_gemini_key') || '';
    return request('/scan', {
      method: 'POST',
      body: JSON.stringify({
        imageDataUrl,
        userComment,
        apiKey
      })
    });
  },

  // BOUCLE DE FEEDBACK IA (HUMAN-IN-THE-LOOP)
  async submitFeedback(feedbackList) {
    if (!feedbackList || feedbackList.length === 0) return { recordedCount: 0 };
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedbackList })
    });
  },

  // HISTORIQUE & TENDANCES
  async getHistory(periodDays = 30) {
    return request(`/history?period=${periodDays}`);
  },

  // SUPERVISION ADMIN
  async getAdminMetrics() {
    return request('/admin/metrics');
  },

  // CATALOGUE CIQUAL
  async searchCiqual(term = '') {
    return request(`/ciqual/search?q=${encodeURIComponent(term)}`);
  }
};
