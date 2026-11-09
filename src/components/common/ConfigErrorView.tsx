import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertTriangle, KeyRound } from 'lucide-react'
import { BACKEND_PROVIDER } from '@/config/backend'

export function ConfigErrorView() {
  const providerName = BACKEND_PROVIDER === 'supabase' ? 'Supabase' : 'Firebase'
  const requiredVariables = BACKEND_PROVIDER === 'supabase'
    ? 'VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key'
    : 'VITE_FIREBASE_API_KEY=your_api_key\nVITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=your_project_id\nVITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com\nVITE_FIREBASE_MESSAGING_SENDER_ID=your_id\nVITE_FIREBASE_APP_ID=your_app_id'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="max-w-lg w-full border-[hsl(var(--destructive))] shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl text-[hsl(var(--foreground))]">
            {providerName} Configuration Missing
          </CardTitle>
          <CardDescription className="text-sm">
            Configure the selected backend for Mr. Wash POS authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            Authentication and protected access require the selected backend's configuration in <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded text-xs">.env.local</code>.
          </p>

          <div className="rounded-md bg-[hsl(var(--secondary))] p-3 space-y-2 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 font-semibold text-xs text-[hsl(var(--foreground))] uppercase tracking-wider">
              <KeyRound className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              Required Environment Variables
            </div>
            <pre className="text-xs overflow-x-auto text-[hsl(var(--foreground))] font-mono">{requiredVariables}</pre>
          </div>

          <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
            Set <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded">VITE_BACKEND_PROVIDER=supabase</code> to select Supabase, or <code className="bg-[hsl(var(--muted))] px-1 py-0.5 rounded">firebase</code> for the retained Firebase backend.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
