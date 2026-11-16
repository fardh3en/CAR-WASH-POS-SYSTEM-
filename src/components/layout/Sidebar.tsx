import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, Receipt, Sparkles,
  Tag, BarChart3, ShieldCheck, Settings,
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
  { label: 'Audit Trail', path: '/admin/audit', icon: ShieldCheck },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-60 border-r-2 border-[#0E120A] bg-[#F4F5EF] flex-col hidden md:flex min-h-[calc(100vh-57px)]">
      {/* Section Label */}
      <div className="px-5 pt-6 pb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#987E63]">
          Admin Management
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-wider transition-all',
                isActive
                  ? 'bg-[#0E120A] text-[#D3FA2E]'
                  : 'text-[#312B22] hover:bg-white hover:text-[#0E120A]'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer brand mark */}
      <div className="p-5 border-t border-[rgba(14,18,10,0.14)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D3FA2E] border border-[#0E120A]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#312B22]">Mr. Wash • v1.0</span>
        </div>
      </div>
    </aside>
  )
}
