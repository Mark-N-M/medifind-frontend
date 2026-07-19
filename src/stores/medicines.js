import { defineStore } from 'pinia'

export const useMedicinesStore = defineStore('medicines', {
  state: () => {
    const medicines = {
      0: {
        id: 1,
        name: "Panadol",
        genericName: "Paracetamol",
        category: "Pain Relief"
      },
      1: {
        id: 2,
        name: "Amoxil",
        genericName: "Amoxicillin",
        category: "Antibiotic"
      },
      2: {
        id: 3,
        name: "Piriton",
        genericName: "Chlorphenamine",
        category: "Allergy"
      }
    }
    return { medicines }
  }
})