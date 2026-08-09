import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function StaffLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pb-16 md:pb-0">
      <Header />
      <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
