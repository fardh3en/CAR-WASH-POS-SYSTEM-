import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function StaffHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recent History</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Staff recent shift transactions (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Staff History Module</CardTitle>
          <CardDescription>Shift history view will be added in Phase 6.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Staff Recent History.</p>
        </CardContent>
      </Card>
    </div>
  )
}
