import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Configuration</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Vehicle Category + Service Package Pricing (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pricing Module</CardTitle>
          <CardDescription>Pricing configuration will be added in Phase 4.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Pricing view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
