import { collection, getDocs, doc, setDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { VehicleCategory } from '@/types/vehicle.types'

const COLLECTION_NAME = 'vehicleCategories'

export const DEFAULT_BUSINESS_CATEGORIES = [
  { name: 'Hatchback Car', displayOrder: 1, isActive: true },
  { name: 'Sedan Car', displayOrder: 2, isActive: true },
  { name: 'Compact SUV', displayOrder: 3, isActive: true },
  { name: 'SUV', displayOrder: 4, isActive: true },
  { name: 'Premium SUV', displayOrder: 5, isActive: true },
  { name: 'Scooter', displayOrder: 6, isActive: true },
  { name: 'Bike', displayOrder: 7, isActive: true },
  { name: 'Bullet', displayOrder: 8, isActive: true },
  { name: 'Superbike', displayOrder: 9, isActive: true },
  { name: 'Auto', displayOrder: 10, isActive: true },
  { name: 'Traveller', displayOrder: 11, isActive: true, variants: ['10 Seat', '14 Seat', '17 Seat'] },
  { name: 'Pickup', displayOrder: 12, isActive: true, variants: ['Ordinary', 'Long Chassis'] },
  { name: 'Dost', displayOrder: 13, isActive: true, variants: ['Ordinary', 'Bada Dost'] },
  { name: 'TATA ACE', displayOrder: 14, isActive: true },
  { name: 'Super ACE', displayOrder: 15, isActive: true },
]

export const vehicleCategoryService = {
  /**
   * Fetch active vehicle categories sorted by displayOrder
   */
  async getVehicleCategories(): Promise<VehicleCategory[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      )
      const snapshot = await getDocs(q)
      
      // If collection is empty, trigger seed and re-fetch
      if (snapshot.empty) {
        await this.seedDefaultCategories()
        const retrySnapshot = await getDocs(q)
        return retrySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as VehicleCategory[]
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as VehicleCategory[]
    } catch (error) {
      console.error('Error fetching vehicle categories:', error)
      throw error
    }
  },

  /**
   * Seed default practical business categories if collection is empty
   */
  async seedDefaultCategories(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME))
      if (!snapshot.empty) return

      const now = new Date().toISOString()
      for (const cat of DEFAULT_BUSINESS_CATEGORIES) {
        const categoryId = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const docRef = doc(db, COLLECTION_NAME, categoryId)
        await setDoc(docRef, {
          ...cat,
          createdAt: now,
          updatedAt: now,
        })
      }
    } catch (error) {
      console.error('Error seeding vehicle categories:', error)
    }
  },
}
