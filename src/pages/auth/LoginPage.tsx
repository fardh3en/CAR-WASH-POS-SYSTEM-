import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { ConfigErrorView } from '@/components/common/ConfigErrorView'

export function LoginPage() {
  const { login, user, userProfile, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isConfigured) {
    return <ConfigErrorView />
  }

  // Redirect if already authenticated
  if (user && userProfile) {
    if (userProfile.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (userProfile.role === 'STAFF') {
      return <Navigate to="/staff/new-transaction" replace />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
    } catch (err: unknown) {
      console.error('Login error:', err)
      const errorStr = err instanceof Error ? err.message : String(err)
      if (errorStr.includes('invalid-credential') || errorStr.includes('user-not-found') || errorStr.includes('wrong-password')) {
        setErrorMessage('Invalid email or password.')
      } else {
        setErrorMessage(errorStr || 'Authentication failed. Please check your credentials.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="w-full max-w-md shadow-lg border-[hsl(var(--border))]">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center font-bold text-2xl mb-2">
            W
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Mr. Wash POS</CardTitle>
          <CardDescription className="text-sm">
            Sign in to access front-desk operations or management portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@mrwash.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="default" className="w-full h-11" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
