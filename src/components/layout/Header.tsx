import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Header() {
  const { userProfile, logout } = useAuth()

  return (
    <header className="border-b-2 border-[#0E120A] bg-[#F4F5EF] px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#D3FA2E] border border-[#0E120A] shrink-0" />
          <div>
            <span className="font-editorial text-xl font-black text-[#0E120A] tracking-tighter block leading-none">
              MR. WASH POS
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#312B22]">
              Operations Center
            </span>
          </div>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-[#312B22]">
                {userProfile.displayName || userProfile.email}
              </span>
              <span className="px-2 py-0.5 bg-[#0E120A] text-[#D3FA2E] text-[10px] font-black uppercase tracking-widest border border-[#0E120A]">
                {userProfile.role}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void logout()}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
