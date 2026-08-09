export type UserRole = 'ADMIN' | 'STAFF'

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  displayName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
