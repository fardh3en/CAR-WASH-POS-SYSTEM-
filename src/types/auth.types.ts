import type { UserProfile, UserRole } from './user.types'

/** Provider-neutral user identity used by the existing UI. */
export interface AuthUser {
  uid: string
  email: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextType {
  user: AuthUser | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  isConfigured: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isStaff: boolean
  hasRole: (role: UserRole) => boolean
}
