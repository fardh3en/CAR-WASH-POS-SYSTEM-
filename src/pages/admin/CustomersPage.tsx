import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Customer database & records (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customers Module</CardTitle>
          <CardDescription>Customer registration and management features will be added in Phase 3.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Customer view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
