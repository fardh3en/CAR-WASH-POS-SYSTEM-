import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertTriangle, KeyRound } from 'lucide-react'

export function ConfigErrorView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="max-w-lg w-full border-[hsl(var(--destructive))] shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl text-[hsl(var(--foreground))]">
            Firebase Authentication Not Configured
          </CardTitle>
          <CardDescription className="text-sm">
            Live Firebase credentials are required for Mr. Wash POS authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            Authentication and protected access require valid Firebase project configuration variables in your local environment file (<code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-xs">.env.local</code>).
          </p>

          <div className="rounded-md bg-[hsl(var(--secondary))] p-3 space-y-2 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 font-semibold text-xs text-[hsl(var(--foreground))] uppercase tracking-wider">
              <KeyRound className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              Required Environment Variables
            </div>
            <pre className="text-xs overflow-x-auto text-[hsl(var(--foreground))] font-mono">
              VITE_FIREBASE_API_KEY=your_api_key{'\n'}
              VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com{'\n'}
              VITE_FIREBASE_PROJECT_ID=your_project_id{'\n'}
              VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com{'\n'}
              VITE_FIREBASE_MESSAGING_SENDER_ID=your_id{'\n'}
              VITE_FIREBASE_APP_ID=your_app_id
            </pre>
          </div>

          <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
            Copy <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded">.env.example</code> to <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded">.env.local</code> and supply your Firebase project keys from the Firebase Console.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
