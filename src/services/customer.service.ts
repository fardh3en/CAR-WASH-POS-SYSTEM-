import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Customer } from '@/types/customer.types'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

const COLLECTION_NAME = 'customers'

async function mapSupabaseCustomer(row: {
  id: string
  name: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}): Promise<Customer> {
  const { data, error } = await getSupabaseClient()
    .from('vehicles')
    .select('id')
    .eq('customer_id', row.id)
  if (error) throw error
  return {
    id: row.id,
    name: row.name ?? undefined,
    phoneNumber: row.phone_number ?? undefined,
    vehicleIds: (data ?? []).map((vehicle) => vehicle.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const customerService = {
  /**
   * Fetch customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data ? mapSupabaseCustomer(data) : null
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      try {
        const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
        const { data, error } = await getSupabaseClient()
          .from('customers')
          .select('*')
          .eq('phone_number', cleanPhone)
          .limit(1)
          .maybeSingle()
        if (error) throw error
        return data ? await mapSupabaseCustomer(data) : null
      } catch (error) {
        console.error('Error finding customer by phone:', error)
        return null
      }
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      const now = new Date().toISOString()
      const { data: row, error } = await getSupabaseClient()
        .from('customers')
        .insert({
          name: data.name?.trim() || null,
          phone_number: data.phoneNumber?.replace(/[^0-9+]/g, '') || null,
          created_at: now,
          updated_at: now,
        })
        .select('*')
        .single()
      if (error) throw error
      return {
        id: row.id,
        name: row.name ?? undefined,
        phoneNumber: row.phone_number ?? undefined,
        vehicleIds: data.vehicleId ? [data.vehicleId] : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (updates.name !== undefined) payload.name = updates.name?.trim() || null
      if (updates.phoneNumber !== undefined) {
        payload.phone_number = updates.phoneNumber?.replace(/[^0-9+]/g, '') || null
      }
      const { error } = await getSupabaseClient().from('customers').update(payload).eq('id', id)
      if (error) throw error
      return
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      const { error } = await getSupabaseClient()
        .from('vehicles')
        .update({ customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', vehicleId)
      if (error) throw error
      return
    }
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
