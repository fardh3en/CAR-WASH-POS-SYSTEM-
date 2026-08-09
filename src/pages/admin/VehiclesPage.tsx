import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminVehiclesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Management</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Vehicle records & category classifications (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Module</CardTitle>
          <CardDescription>Vehicle management features will be added in Phase 3.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Vehicle view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
