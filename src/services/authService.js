import api from './api'

export const authService = {
  // Login call
  async login(credentials) {
    const response = await api.post('/login', credentials)
    return response.data
  },

  // Register call
  async register(userData) {
    const response = await api.post('/register', userData)
    return response.data
  },

  // Fetch authenticated user profile (using the ID reference)
  async getUser() {
    const response = await api.get('/user')
    return response.data
  },

  // Logout call
  async logout() {
    const response = await api.post('/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return response.data
  },
}