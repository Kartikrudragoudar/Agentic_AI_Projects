import axios from 'axios'

// Use relative URL — routes through Vite proxy (see vite.config.js)
const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* =========================================================
   🔍 DEBUG INTERCEPTOR (TEMPORARY)
   This will show EXACT request URL in console
========================================================= */
apiClient.interceptors.request.use((config) => {
  console.log("🔥 REQUEST:", config.baseURL + config.url)
  return config
})

/* =========================================================
   MARKET API FUNCTIONS
========================================================= */
export const marketAPI = {
  getBrief: () => apiClient.get('/brief/today'),
  getScores: () => apiClient.get('/watchlist/scores'),
  getSentiment: () => apiClient.get('/watchlist/sentiment'),
  getPrices: () => apiClient.get('/watchlist/prices'),
  getAlerts: () => apiClient.get('/alerts'),
  healthCheck: () => apiClient.get('/health'),
  getDashboard: () => apiClient.get('/dashboard'),
}

export default apiClient