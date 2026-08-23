import { defineStore } from 'pinia'

export const usePharmaciesStore = defineStore('pharmacies', {
  state: () => {
    const pharmacies = {
      0: {
        id: 1,
        name: "Goodlife Pharmacy - Kilimani",
        location: "Kilimani, Nairobi",
        area: "Kilimani",
        address: "Kilimani Road, Nairobi",
        phone: "+254712345678",
        operatingHours: "8:00 AM - 9:00 PM",
        rating: 4.6,
        latitude: -1.2921,
        longitude: 36.7872,
        verified: true
      },
      1: {
        id: 2,
        name: "MyDawa Chemist - CBD",
        location: "Nairobi CBD",
        area: "CBD",
        address: "Kimathi Street, Nairobi CBD",
        phone: "+254798765432",
        operatingHours: "7:30 AM - 10:00 PM",
        rating: 4.3,
        latitude: -1.2833,
        longitude: 36.8167,
        verified: true
      }
    }
    return { pharmacies }
  }
})