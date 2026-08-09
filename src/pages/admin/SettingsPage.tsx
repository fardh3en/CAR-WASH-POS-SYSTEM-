import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function AdminSettingsPage() {
  const { userProfile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          System and user profile configuration (Phase 2 Placeholder)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Current authenticated administrator profile</CardDescription>
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
