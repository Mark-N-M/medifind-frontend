import api from './api'

export const adminService = {
  async getPendingPharmacists() {
    const response = await api.get('/admin/pending-pharmacists')
    return response.data
  },
  async approvePharmacist(id) {
    const response = await api.patch(`/admin/approve-pharmacist/${id}`)
    return response.data
  },
  async rejectPharmacist(id) {
    const response = await api.patch(`/admin/reject-pharmacist/${id}`)
    return response.data
  }
}