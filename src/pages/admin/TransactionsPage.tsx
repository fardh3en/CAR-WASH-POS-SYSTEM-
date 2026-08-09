import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction Management</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          All business transactions & history (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions Module</CardTitle>
          <CardDescription>Transaction management will be added in Phase 5.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Placeholder screen for Admin Transaction view.</p>
        </CardContent>
      </Card>
    </div>
  )
}
