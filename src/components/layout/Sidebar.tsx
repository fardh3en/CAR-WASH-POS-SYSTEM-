import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  Receipt,
  Sparkles,
  Tag,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Vehicles', path: '/admin/vehicles', icon: Car },
  { label: 'Transactions', path: '/admin/transactions', icon: Receipt },
  { label: 'Services', path: '/admin/services', icon: Sparkles },
  { label: 'Pricing', path: '/admin/pricing', icon: Tag },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          Admin Management (Placeholder)
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rounded-md bg-[hsl(var(--secondary))] p-3 text-xs text-[hsl(var(--muted-foreground))] space-y-1">
        <p className="font-semibold text-[hsl(var(--foreground))]">Admin Portal</p>
        <p className="text-[11px]">Desktop-first navigation placeholder for future UI/UX design phase.</p>
      </div>
    </aside>
  )
}
