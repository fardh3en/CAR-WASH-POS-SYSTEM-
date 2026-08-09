import { useState } from 'react'
import type { Customer } from '@/types/customer.types'
import { customerService } from '@/services/customer.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, Phone } from 'lucide-react'

export function AdminCustomersPage() {
  const [searchPhone, setSearchPhone] = useState('')
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchPhone.trim()) return
    setLoading(true)
    setSearched(false)

    try {
      const cust = await customerService.findCustomerByPhone(searchPhone.trim())
      setFoundCustomer(cust)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Records Foundation</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Lookup customer accounts by phone number (Phase 3 Foundation)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
            Customer Lookup (Supporting Capability)
          </CardTitle>
          <CardDescription>
            Supporting search capability for Admin reference. Vehicle registration number remains the primary Staff lookup mechanism.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="tel"
                placeholder="Enter phone number..."
                className="pl-9"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading || !searchPhone.trim()}>
              <Search className="h-4 w-4 mr-1" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {searched && (
            <div className="pt-2">
              {foundCustomer ? (
                <div className="p-4 rounded-md border border-green-200 bg-green-50/50 space-y-1">
                  <span className="font-bold text-sm text-green-900">
                    {foundCustomer.name || 'Unnamed Customer'}
                  </span>
                  <p className="text-xs text-green-700">Phone: {foundCustomer.phoneNumber || 'N/A'}</p>
                  <p className="text-xs text-green-700">Linked Vehicles: {foundCustomer.vehicleIds.length}</p>
                </div>
              ) : (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">
                  No customer found matching phone number "{searchPhone}".
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
