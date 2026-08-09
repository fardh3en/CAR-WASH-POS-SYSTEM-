import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'

export function Header() {
  const { userProfile, logout } = useAuth()

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-lg">
            W
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-none">
              Mr. Wash POS
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">
              Car Wash POS & Management
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-[hsl(var(--muted-foreground))]">
            <UserIcon className="h-3.5 w-3.5" />
            <span>{userProfile?.displayName || userProfile?.email}</span>
            <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--secondary-foreground))]">
              {userProfile?.role}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void logout()}
            className="flex items-center gap-1.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
