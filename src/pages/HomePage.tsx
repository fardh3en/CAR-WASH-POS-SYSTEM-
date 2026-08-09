import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/config/constants'
import { app } from '@/config/firebase'

export function HomePage() {
  const firebaseInitialized = Boolean(app.name)

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {APP_CONFIG.APP_NAME}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Project Foundation &mdash; Phase 1 Technical Readiness
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status & Technical Verification</CardTitle>
            <CardDescription>
              All foundational dependencies, configurations, and core tooling are active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                  Framework & Language
                </span>
                <span className="text-sm font-medium">React 19 + TypeScript + Vite 8</span>
              </div>
              <div className="p-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                  Styling & UI
                </span>
                <span className="text-sm font-medium">Tailwind CSS v4 + shadcn/ui</span>
              </div>
              <div className="p-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                  Backend & Database
                </span>
                <span className="text-sm font-medium">
                  {firebaseInitialized ? 'Firebase SDK Initialized' : 'Firebase Pending Config'}
                </span>
              </div>
              <div className="p-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider block">
                  Timezone & Locale
                </span>
                <span className="text-sm font-medium">
                  {APP_CONFIG.TIMEZONE} ({APP_CONFIG.CURRENCY_SYMBOL} {APP_CONFIG.CURRENCY_CODE})
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Button variant="default">Foundation Ready</Button>
              <Button variant="outline">Docs Preserved</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
