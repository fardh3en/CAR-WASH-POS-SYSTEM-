import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Packages</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Manage Body Wash, Body & Vacuum, Full Wash (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Services Module</CardTitle>
          <CardDescription>Service package management will be added in Phase 4.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Services view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
