import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { ConfigErrorView } from '@/components/common/ConfigErrorView'

export function LoginPage() {
  const { login, user, userProfile, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isConfigured) return <ConfigErrorView />

  if (user && userProfile) {
    if (userProfile.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (userProfile.role === 'STAFF') return <Navigate to="/staff/new-transaction" replace />
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
      const errorStr = err instanceof Error ? err.message : String(err)
      if (
        errorStr.includes('invalid-credential') ||
        errorStr.includes('user-not-found') ||
        errorStr.includes('wrong-password') ||
        errorStr.includes('Invalid login credentials')
      ) {
        setErrorMessage('Invalid email or password.')
      } else {
        setErrorMessage(errorStr || 'Authentication failed. Please check your credentials.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5EF] p-4">
      <div className="w-full max-w-md">
        {/* Header Brand */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-[#D3FA2E] border border-[#0E120A]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#312B22]">
              Mr. Wash POS • Operations
            </span>
          </div>
          <h1 className="font-editorial text-4xl font-black text-[#0E120A] tracking-tighter">
            SIGN IN
          </h1>
          <p className="text-xs font-semibold text-[#312B22] mt-1">
            Front-desk or Management Portal access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#0E120A] p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-[#312B22] block">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@mrwash.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-[#312B22] block">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <Button
              type="submit"
              variant="lime"
              size="lg"
              className="w-full mt-2"
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : 'Sign In to POS'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#312B22] font-semibold mt-4">
          Mr. Wash POS • Secure Staff Access Only
        </p>
      </div>
    </div>
  )
}
