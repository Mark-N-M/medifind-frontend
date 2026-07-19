import { defineStore } from 'pinia'

export const useStockStore = defineStore('stock', {
  state: () => {
    const stock = {
      0: { id: 1, pharmacy_id: 1, medicine_id: 1, price: 150, inStock: true },
      1: { id: 2, pharmacy_id: 2, medicine_id: 1, price: 120, inStock: true },
      2: { id: 3, pharmacy_id: 1, medicine_id: 2, price: 300, inStock: false }
    }
    return { stock }
  }
})