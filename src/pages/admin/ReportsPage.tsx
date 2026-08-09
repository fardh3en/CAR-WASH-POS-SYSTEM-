import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Daily, Weekly, Monthly, Yearly sales & vehicle analytics (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reports Module</CardTitle>
          <CardDescription>Analytics & Excel reports will be added in Phases 8 and 9.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Reports view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
