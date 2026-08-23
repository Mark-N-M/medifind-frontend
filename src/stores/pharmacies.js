import { defineStore } from 'pinia'

export const usePharmaciesStore = defineStore('pharmacies', {
  state: () => {
    const pharmacies = {
      0: {
        id: 1,
        name: "Goodlife Pharmacy - Kilimani",
        location: "Kilimani, Nairobi",
        area: "Kilimani",
        verified: true
      },
      1: {
        id: 2,
        name: "MyDawa Chemist - CBD",
        location: "Nairobi CBD",
        area: "CBD",
        verified: true
      }
    }
    return { pharmacies }
  }
})