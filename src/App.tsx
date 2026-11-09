import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleGuard } from '@/components/common/RoleGuard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

// Layouts
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StaffLayout } from '@/components/layout/StaffLayout'

// Load route pages on demand so staff and admin sessions download only the pages they use.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((module) => ({ default: module.AdminDashboardPage })))
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage').then((module) => ({ default: module.AdminCustomersPage })))
const AdminVehiclesPage = lazy(() => import('@/pages/admin/VehiclesPage').then((module) => ({ default: module.AdminVehiclesPage })))
const AdminTransactionsPage = lazy(() => import('@/pages/admin/TransactionsPage').then((module) => ({ default: module.AdminTransactionsPage })))
const AdminServicesPage = lazy(() => import('@/pages/admin/ServicesPage').then((module) => ({ default: module.AdminServicesPage })))
const AdminPricingPage = lazy(() => import('@/pages/admin/PricingPage').then((module) => ({ default: module.AdminPricingPage })))
const AdminReportsPage = lazy(() => import('@/pages/admin/ReportsPage').then((module) => ({ default: module.AdminReportsPage })))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage').then((module) => ({ default: module.AdminAuditLogsPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then((module) => ({ default: module.AdminSettingsPage })))
const StaffNewTransactionPage = lazy(() => import('@/pages/staff/NewTransactionPage').then((module) => ({ default: module.StaffNewTransactionPage })))
const StaffHistoryPage = lazy(() => import('@/pages/staff/HistoryPage').then((module) => ({ default: module.StaffHistoryPage })))
const StaffSettingsPage = lazy(() => import('@/pages/staff/SettingsPage').then((module) => ({ default: module.StaffSettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner label="Loading page..." />}>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="vehicles" element={<AdminVehiclesPage />} />
                  <Route path="transactions" element={<AdminTransactionsPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="pricing" element={<AdminPricingPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="audit" element={<AdminAuditLogsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Protected Staff Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleGuard allowedRoles={['STAFF']} />}>
                <Route path="/staff" element={<StaffLayout />}>
                  <Route index element={<Navigate to="/staff/new-transaction" replace />} />
                  <Route path="new-transaction" element={<StaffNewTransactionPage />} />
                  <Route path="history" element={<StaffHistoryPage />} />
                  <Route path="settings" element={<StaffSettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
