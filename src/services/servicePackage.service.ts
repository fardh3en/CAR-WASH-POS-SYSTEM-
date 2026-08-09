import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { ServicePackage } from '@/types/service.types'

const COLLECTION_NAME = 'servicePackages'

export const DEFAULT_SERVICE_PACKAGES = [
  {
    id: 'body_wash',
    name: 'Body Wash',
    description: 'Exterior pressure wash and tyre polishing',
    activities: ['Exterior pressure wash', 'Tyre polishing'],
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'body_vacuum',
    name: 'Body & Vacuum',
    description: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: [
      'Exterior body cleaning',
      'Interior vacuuming',
      'Dashboard polishing',
      'Tyre polishing',
    ],
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'full_wash',
    name: 'Full Wash',
    description: 'Complete comprehensive cleaning including underbody and engine room',
    activities: [
      'Exterior body cleaning',
      'Interior vacuuming',
      'Dashboard polishing',
      'Tyre polishing',
      'Underbody cleaning',
      'Engine room cleaning',
    ],
    displayOrder: 3,
    isActive: true,
  },
]

export const servicePackageService = {
  /**
   * Fetch active service packages ordered by displayOrder
   */
  async getServicePackages(): Promise<ServicePackage[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        await this.seedDefaultServicePackages()
        const retrySnapshot = await getDocs(q)
        return retrySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ServicePackage[]
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ServicePackage[]
    } catch (error) {
      console.error('Error fetching service packages:', error)
      throw error
    }
  },

  /**
   * Seed exact approved standard service packages if collection is empty
   */
  async seedDefaultServicePackages(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME))
      if (!snapshot.empty) return

      const now = new Date().toISOString()
      for (const pkg of DEFAULT_SERVICE_PACKAGES) {
        const docRef = doc(db, COLLECTION_NAME, pkg.id)
        await setDoc(docRef, {
          ...pkg,
          createdAt: now,
          updatedAt: now,
        })
      }
    } catch (error) {
      console.error('Error seeding service packages:', error)
    }
  },

  /**
   * Update service package information (Admin only)
   */
  async updateServicePackage(id: string, updates: Partial<ServicePackage>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error updating service package ${id}:`, error)
      throw error
    }
  },
}
