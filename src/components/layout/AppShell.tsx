import * as React from 'react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-lg">
              W
            </div>
            <span className="text-lg font-bold tracking-tight">Mr. Wash POS</span>
          </div>
          <span className="text-xs rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-[hsl(var(--secondary-foreground))] font-medium">
            Phase 1 Foundation
          </span>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Mr. Wash POS &copy; {new Date().getFullYear()} &mdash; Technical Foundation Established
      </footer>
    </div>
  )
}
