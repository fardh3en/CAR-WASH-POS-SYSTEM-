import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'
import type { AuthUser, LoginCredentials } from '@/types/auth.types'

export interface AuthLoginResult {
  user: AuthUser
}

function toFirebaseIdentity(user: FirebaseUser): AuthUser {
  return { uid: user.uid, email: user.email }
}

export const authService = {
  /** Authenticate against the explicitly selected identity provider. */
  async loginWithEmail(credentials: LoginCredentials): Promise<AuthLoginResult> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      if (error) throw error
      if (!data.user) throw new Error('Authentication returned no user.')
      return { user: { uid: data.user.id, email: data.user.email ?? null } }
    }

    if (!auth) throw new Error('Firebase Authentication is not configured.')
    try {
      const credential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      )
      return { user: toFirebaseIdentity(credential.user) }
    } catch (error) {
      console.error('Firebase Auth Login error:', error)
      throw error
    }
  },

  async logoutUser(): Promise<void> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) throw error
      return
    }
    if (!auth) throw new Error('Firebase Authentication is not configured.')
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Firebase Auth Logout error:', error)
      throw error
    }
  },

  /** Subscribe to auth changes and normalize provider IDs to the UI's `uid`. */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
        const user = session?.user
        const identity = user ? { uid: user.id, email: user.email ?? null } : null
        queueMicrotask(() => callback(identity))
      })
      return () => subscription.unsubscribe()
    }

    if (!auth) {
      callback(null)
      return () => undefined
    }
    return onAuthStateChanged(auth, (user) => callback(user ? toFirebaseIdentity(user) : null))
  },
}
