import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Vehicle } from '@/types/vehicle.types'
import { normalizeRegistrationNumber, formatRegistrationNumber } from '@/utils/vehicle.utils'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

const COLLECTION_NAME = 'vehicles'

export const vehicleService = {
  /**
   * Exact-match single query lookup by normalized registration number.
   * Executed ONLY when Staff submits search (Enter / Search Click).
   */
  async getVehicleByRegistration(rawRegNumber: string): Promise<Vehicle | null> {
    const normalized = normalizeRegistrationNumber(rawRegNumber)
    if (!normalized) return null

    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('vehicles')
        .select('*')
        .eq('registration_number', normalized)
        .maybeSingle()
      if (error) throw error
      return data ? mapSupabaseVehicle(data) : null
    }

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

    if (BACKEND_PROVIDER === 'supabase') {
      const now = new Date().toISOString()
      const { data: row, error } = await getSupabaseClient()
        .from('vehicles')
        .insert({
          registration_number: normalized,
          display_registration_number: formatRegistrationNumber(normalized),
          category_id: data.categoryId,
          variant: data.variant?.trim() || null,
          model: data.model?.trim() || null,
          customer_id: data.customerId || null,
          created_at: now,
          updated_at: now,
        })
        .select('*')
        .single()
      if (error) throw error
      return mapSupabaseVehicle(row)
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
    if (BACKEND_PROVIDER === 'supabase') {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (updates.registrationNumber !== undefined) {
        const normalized = normalizeRegistrationNumber(updates.registrationNumber)
        payload.registration_number = normalized
        payload.display_registration_number = formatRegistrationNumber(normalized)
      }
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId
      if (updates.variant !== undefined) payload.variant = updates.variant?.trim() || null
      if (updates.model !== undefined) payload.model = updates.model?.trim() || null
      if (updates.customerId !== undefined) payload.customer_id = updates.customerId
      const { error } = await getSupabaseClient().from('vehicles').update(payload).eq('id', id)
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
      console.error(`Error updating vehicle ${id}:`, error)
      throw error
    }
  },
}

function mapSupabaseVehicle(row: {
  id: string
  registration_number: string
  display_registration_number: string
  category_id: string
  variant: string | null
  model: string | null
  customer_id: string | null
  created_at: string
  updated_at: string
}): Vehicle {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    displayRegistrationNumber: row.display_registration_number,
    categoryId: row.category_id,
    variant: row.variant ?? undefined,
    model: row.model ?? undefined,
    customerId: row.customer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
