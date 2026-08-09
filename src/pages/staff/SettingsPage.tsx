import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function StaffSettingsPage() {
  const { userProfile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Profile</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Staff account details (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Info</CardTitle>
          <CardDescription>Current authenticated staff account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="font-semibold">Email:</span> {userProfile?.email}</div>
          <div><span className="font-semibold">Role:</span> {userProfile?.role}</div>
          <div><span className="font-semibold">Name:</span> {userProfile?.displayName}</div>
          <div><span className="font-semibold">Status:</span> {userProfile?.isActive ? 'Active' : 'Inactive'}</div>
        </CardContent>
      </Card>
    </div>
  )
}
