import { defineStore } from 'pinia'

export const usePharmaciesStore = defineStore('pharmacies', {
  state: () => {
    const pharmacies = {
      0: {
        id: 1,
        name: "Goodlife Pharmacy - Kilimani",
        location: "Kilimani, Nairobi",
        verified: true
      },
      1: {
        id: 2,
        name: "MyDawa Chemist - CBD",
        location: "Nairobi CBD",
        verified: true
      }
    }
    return { pharmacies }
  }
})