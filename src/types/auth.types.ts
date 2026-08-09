import type { User } from 'firebase/auth'
import type { UserProfile, UserRole } from './user.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
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
