import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function StaffNewTransactionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Transaction</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Staff Front-Desk Customer & Service Entry (Phase 2 Placeholder)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Operational Interface</CardTitle>
          <CardDescription>
            Mobile-first registration and fast service selection will be implemented in Phases 3-5.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Authenticated with STAFF role. Mobile layout placeholder active.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
