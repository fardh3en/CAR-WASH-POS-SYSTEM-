import { NavLink } from 'react-router-dom'
import { PlusCircle, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const staffNavItems = [
  { label: 'New Transaction', path: '/staff/new-transaction', icon: PlusCircle },
  { label: 'History', path: '/staff/history', icon: History },
  { label: 'Settings', path: '/staff/settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-2 flex items-center justify-around z-50 md:hidden">
      {staffNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center min-h-[48px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full',
              isActive
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
            )
          }
        >
          <item.icon className="h-5 w-5 mb-0.5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
