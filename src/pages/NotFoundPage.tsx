import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription>Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            The requested page does not exist or you do not have permission to view it.
          </p>
          <Link to="/login">
            <Button variant="default">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
