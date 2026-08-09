import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Vehicle } from '@/types/vehicle.types'
import { normalizeRegistrationNumber, formatRegistrationNumber } from '@/utils/vehicle.utils'

const COLLECTION_NAME = 'vehicles'

export const vehicleService = {
  /**
   * Exact-match single query lookup by normalized registration number.
   * Executed ONLY when Staff submits search (Enter / Search Click).
   */
  async getVehicleByRegistration(rawRegNumber: string): Promise<Vehicle | null> {
    const normalized = normalizeRegistrationNumber(rawRegNumber)
    if (!normalized) return null

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('registrationNumber', '==', normalized)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return null
      }

      const docSnap = snapshot.docs[0]
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Vehicle
    } catch (error) {
      console.error(`Error querying vehicle by registration ${normalized}:`, error)
      throw error
    }
  },

  /**
   * Create a new vehicle record in Firestore.
   * Stored with categoryId reference (no redundant categoryName stored on vehicle).
   * customerId is set to string or null if no customer info provided.
   */
  async createVehicle(data: {
    registrationNumber: string
    categoryId: string
    variant?: string
    model?: string
    customerId?: string | null
  }): Promise<Vehicle> {
    const normalized = normalizeRegistrationNumber(data.registrationNumber)
    if (!normalized) {
      throw new Error('Registration number is mandatory')
    }

    try {
      const docRef = doc(collection(db, COLLECTION_NAME))
      const now = new Date().toISOString()
      const newVehicle: Vehicle = {
        id: docRef.id,
        registrationNumber: normalized,
        displayRegistrationNumber: formatRegistrationNumber(normalized),
        categoryId: data.categoryId,
        variant: data.variant?.trim() || undefined,
        model: data.model?.trim() || undefined,
        customerId: data.customerId || null,
        createdAt: now,
        updatedAt: now,
      }

      await setDoc(docRef, newVehicle)
      return newVehicle
    } catch (error) {
      console.error('Error creating vehicle:', error)
      throw error
    }
  },

  /**
   * Update an existing vehicle record (e.g. assign customer ID, update category/model)
   */
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error)
      throw error
    }
  },
}
