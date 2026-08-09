import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          System overview and business intelligence (Phase 2 Placeholder)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Portal Ready</CardTitle>
          <CardDescription>
            Authenticated with ADMIN role permissions. Business management modules will be built in future phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Role-based routing, desktop layout, and authorization guards are active.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
