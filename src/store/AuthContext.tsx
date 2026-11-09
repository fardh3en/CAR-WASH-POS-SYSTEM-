import React, { useState, useEffect } from 'react'
import type { AuthContextType, AuthUser, LoginCredentials } from '@/types/auth.types'
import type { UserProfile, UserRole } from '@/types/user.types'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { isBackendConfigured } from '@/config/backend'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isBackendConfigured) {
      setLoading(false)
      return
    }

    let profileRequest = 0
    const unsubscribe = authService.onAuthChange(async (authenticatedUser) => {
      const requestId = ++profileRequest
      setLoading(true)
      setError(null)
      setUser(authenticatedUser)

      if (authenticatedUser) {
        try {
          const profile = await userService.getUserProfile(authenticatedUser.uid)
          if (requestId === profileRequest) setUserProfile(profile)
        } catch (err) {
          console.error('Failed to load user profile:', err)
          if (requestId === profileRequest) {
            setError('Failed to load user profile from the selected backend.')
            setUserProfile(null)
          }
        }
      } else {
        setUserProfile(null)
      }

      if (requestId === profileRequest) setLoading(false)
    })

    return () => {
      profileRequest++
      unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    if (!isBackendConfigured) {
      throw new Error('The selected backend is not configured.')
    }
    setError(null)
    setLoading(true)
    try {
      const loginResult = await authService.loginWithEmail(credentials)
      setUser(loginResult.user)
      const profile = await userService.getUserProfile(loginResult.user.uid)
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
    isConfigured: isBackendConfigured,
    login,
    logout,
    isAdmin,
    isStaff,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
