import api from './api'

export const stockService = {
  // Fetch pharmacist-scoped stocks
  async getStocks() {
    const response = await api.get('/pharmacist/stocks')
    return response.data.data
  },

  // Fetch global medicines list for select dropdowns
  async getGlobalMedicines() {
    const response = await api.get('/medicines')
    return response.data
  },

  // Add new stock entry
  async addStock(payload) {
    const response = await api.post('/pharmacist/stocks', payload)
    return response.data
  },

  // Update existing stock entry
  async updateStock(id, payload) {
    const response = await api.put(`/pharmacist/stocks/${id}`, payload)
    return response.data
  },

  // Delete stock entry
  async deleteStock(id) {
    const response = await api.delete(`/pharmacist/stocks/${id}`)
    return response.data
  }
}