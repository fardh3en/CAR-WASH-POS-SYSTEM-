import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { UserProfile } from '@/types/user.types'

const USERS_COLLECTION = 'users'

export const userService = {
  /**
   * Get user profile by UID from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
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
