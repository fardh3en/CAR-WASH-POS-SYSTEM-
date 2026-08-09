import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { LoginCredentials } from '@/types/auth.types'

export const authService = {
  /**
   * Authenticate user with Email and Password via Firebase Authentication
   */
  async loginWithEmail(credentials: LoginCredentials): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
    } catch (error) {
      console.error('Firebase Auth Login error:', error)
      throw error
    }
  },

  /**
   * Sign out current authenticated user
   */
  async logoutUser(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Firebase Auth Logout error:', error)
      throw error
    }
  },

  /**
   * Subscribe to Firebase Authentication state changes
   */
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  },
}
