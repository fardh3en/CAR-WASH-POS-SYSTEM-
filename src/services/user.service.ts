import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { UserProfile } from '@/types/user.types'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

const USERS_COLLECTION = 'users'

export const userService = {
  /**
   * Get user profile by UID from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return {
        uid: data.id,
        email: data.email,
        role: data.role as UserProfile['role'],
        displayName: data.display_name,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    }
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid)
      const userSnapshot = await getDoc(userDocRef)

      if (!userSnapshot.exists()) {
        return null
      }

      return userSnapshot.data() as UserProfile
    } catch (error) {
      console.error(`Failed to fetch profile for user ${uid}:`, error)
      throw error
    }
  },

  /**
   * Create or initialize user profile in Firestore
   */
  async createUserProfile(profile: UserProfile): Promise<void> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { error } = await getSupabaseClient().from('profiles').insert({
        id: profile.uid,
        email: profile.email,
        role: profile.role,
        display_name: profile.displayName,
        is_active: profile.isActive,
        created_at: profile.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      return
    }
    try {
      const userDocRef = doc(db, USERS_COLLECTION, profile.uid)
      await setDoc(userDocRef, {
        ...profile,
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Failed to create profile for user ${profile.uid}:`, error)
      throw error
    }
  },

  /**
   * Update active status or displayName of user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (BACKEND_PROVIDER === 'supabase') {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (updates.email !== undefined) payload.email = updates.email
      if (updates.displayName !== undefined) payload.display_name = updates.displayName
      if (updates.isActive !== undefined) payload.is_active = updates.isActive
      if (updates.role !== undefined) payload.role = updates.role
      const { error } = await getSupabaseClient().from('profiles').update(payload).eq('id', uid)
      if (error) throw error
      return
    }
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid)
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Failed to update profile for user ${uid}:`, error)
      throw error
    }
  },
}
