import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleGuard } from '@/components/common/RoleGuard'

// Layouts
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StaffLayout } from '@/components/layout/StaffLayout'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminCustomersPage } from '@/pages/admin/CustomersPage'
import { AdminVehiclesPage } from '@/pages/admin/VehiclesPage'
import { AdminTransactionsPage } from '@/pages/admin/TransactionsPage'
import { AdminServicesPage } from '@/pages/admin/ServicesPage'
import { AdminPricingPage } from '@/pages/admin/PricingPage'
import { AdminReportsPage } from '@/pages/admin/ReportsPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'

import { StaffNewTransactionPage } from '@/pages/staff/NewTransactionPage'
import { StaffHistoryPage } from '@/pages/staff/HistoryPage'
import { StaffSettingsPage } from '@/pages/staff/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  )
}
