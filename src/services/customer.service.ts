import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Customer } from '@/types/customer.types'

const COLLECTION_NAME = 'customers'

export const customerService = {
  /**
   * Fetch customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return null
      return { id: snap.id, ...snap.data() } as Customer
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error)
      throw error
    }
  },

  /**
   * Find customer by phone number
   */
  async findCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
    if (!phoneNumber) return null
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
      const q = query(collection(db, COLLECTION_NAME), where('phoneNumber', '==', cleanPhone))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const firstDoc = snap.docs[0]
      return { id: firstDoc.id, ...firstDoc.data() } as Customer
    } catch (error) {
      console.error('Error finding customer by phone:', error)
      return null
    }
  },

  /**
   * Create new customer document in Firestore
   */
  async createCustomer(data: { name?: string; phoneNumber?: string; vehicleId?: string }): Promise<Customer> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME))
      const now = new Date().toISOString()
      const newCustomer: Customer = {
        id: docRef.id,
        name: data.name?.trim() || undefined,
        phoneNumber: data.phoneNumber?.replace(/[^0-9+]/g, '') || undefined,
        vehicleIds: data.vehicleId ? [data.vehicleId] : [],
        createdAt: now,
        updatedAt: now,
      }

      await setDoc(docRef, newCustomer)
      return newCustomer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  },

  /**
   * Update customer record fields (name, phone)
   */
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error)
      throw error
    }
  },

  /**
   * Link a vehicle to an existing customer
   */
  async linkVehicleToCustomer(customerId: string, vehicleId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, customerId)
      await updateDoc(docRef, {
        vehicleIds: arrayUnion(vehicleId),
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error linking vehicle ${vehicleId} to customer ${customerId}:`, error)
      throw error
    }
  },
}
