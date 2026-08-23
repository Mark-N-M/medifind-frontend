import { defineStore } from 'pinia'

export const useStockStore = defineStore('stock', {
  state: () => {
    const stock = {
      0: { id: 1, pharmacy_id: 1, medicine_id: 1, price: 150, available: true, stock_count: 24 },
      1: { id: 2, pharmacy_id: 2, medicine_id: 1, price: 120, available: true, stock_count: 10 },
      2: { id: 3, pharmacy_id: 1, medicine_id: 2, price: 300, available: false, stock_count: 0 },
    }
    return { stock }
  }
})