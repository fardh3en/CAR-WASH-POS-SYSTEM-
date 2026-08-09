import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/user.types'
import { LoadingSpinner } from './LoadingSpinner'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { userProfile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner label="Verifying role permissions..." />
  }

  if (!userProfile || !userProfile.isActive) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(userProfile.role)) {
    // Redirect authorized users to their respective main dashboard
    if (userProfile.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (userProfile.role === 'STAFF') {
      return <Navigate to="/staff/new-transaction" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
