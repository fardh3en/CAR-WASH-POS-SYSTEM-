import React, { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import type { AuthContextType, LoginCredentials } from '@/types/auth.types'
import type { UserProfile, UserRole } from '@/types/user.types'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { isFirebaseConfigured } from '@/config/firebase'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setLoading(true)
      setError(null)
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const profile = await userService.getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (err) {
          console.error('Failed to load user profile:', err)
          setError('Failed to load user profile from Firestore.')
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase Authentication is not configured.')
    }
    setError(null)
    setLoading(true)
    try {
      const userCredential = await authService.loginWithEmail(credentials)
      const profile = await userService.getUserProfile(userCredential.user.uid)
      setUserProfile(profile)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      setLoading(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await authService.logoutUser()
      setUser(null)
      setUserProfile(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    }
  }

  const isAdmin = userProfile?.role === 'ADMIN' && userProfile?.isActive === true
  const isStaff = userProfile?.role === 'STAFF' && userProfile?.isActive === true

  const hasRole = (role: UserRole) => {
    return userProfile?.role === role && userProfile?.isActive === true
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    isConfigured: isFirebaseConfigured,
    login,
    logout,
    isAdmin,
    isStaff,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
