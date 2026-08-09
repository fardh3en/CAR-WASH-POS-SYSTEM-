import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Transaction } from '@/types/transaction.types'
import { transactionService } from '@/services/transaction.service'
import { VehicleSearch } from '@/components/vehicle/VehicleSearch'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { History, RefreshCw, AlertCircle, Ban, CreditCard } from 'lucide-react'

export function StaffHistoryPage() {
  const { user, userProfile } = useAuth()

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [searching, setSearching] = useState<boolean>(false)

  // Payment Modal state
  const [payingTx, setPayingTx] = useState<Transaction | null>(null)

  // Cancel order modal state
  const [cancellingTx, setCancellingTx] = useState<Transaction | null>(null)
  const [cancellationReason, setCancellationReason] = useState<string>('')
  const [cancelling, setCancelling] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadRecent()
  }, [])

  async function loadRecent() {
    setLoading(true)
    try {
      const list = await transactionService.getRecentTransactions(20)
      setRecentTransactions(list)
    } catch (err) {
      console.error('Failed to load recent transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSearch = async (normalizedReg: string) => {
    setSearching(true)
    setErrorMessage(null)
    try {
      const results = await transactionService.getTransactionsByVehicle(normalizedReg)
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
      setErrorMessage('Failed to search vehicle history.')
    } finally {
      setSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchResults(null)
    setErrorMessage(null)
  }

  const handleExecuteCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingTx) return
    const reason = cancellationReason.trim()
    if (!reason) {
      setErrorMessage('A mandatory cancellation reason must be provided.')
      return
    }

    setCancelling(true)
    setErrorMessage(null)

    try {
      await transactionService.cancelTransaction(cancellingTx.id, reason)
      setCancellingTx(null)
      setCancellationReason('')
      await loadRecent()
      if (searchResults !== null && cancellingTx.vehicleSnapshot.registrationNumber) {
        await handleVehicleSearch(cancellingTx.vehicleSnapshot.registrationNumber)
      }
    } catch (err) {
      console.error('Failed to cancel transaction:', err)
      setErrorMessage('Failed to cancel order. Ensures order is OPEN.')
    } finally {
      setCancelling(false)
    }
  }

  const displayedList = searchResults !== null ? searchResults : recentTransactions

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Service History & Vehicle Lookup</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Lookup past transactions by vehicle registration number, collect pending payments, or view shift activity
        </p>
      </div>

      {/* Vehicle Registration History Lookup */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-[hsl(var(--primary))]" />
              Vehicle History Search
            </span>
            {searchResults !== null && (
              <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Clear Search
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleSearch onSearchSubmit={handleVehicleSearch} loading={searching} />
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transactions List */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {searchResults !== null ? `Vehicle History (${searchResults.length})` : 'Recent Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-6">
              Loading transactions...
            </p>
          ) : displayedList.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-6 italic">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-3">
              {displayedList.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[hsl(var(--border))] pb-2">
                    <div>
                      <span className="text-sm font-mono font-extrabold text-[hsl(var(--primary))] block">
                        {tx.transactionNumber}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        Arrived: {new Date(tx.vehicleArrivedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tx.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tx.paymentStatus === 'PAID' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {tx.paymentStatus || 'UNPAID'}
                      </span>

                      {/* Payment Collection Action for OPEN orders */}
                      {tx.status === 'OPEN' && tx.paymentStatus !== 'PAID' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setPayingTx(tx)}
                          className="h-7 text-xs bg-green-600 hover:bg-green-700 font-bold"
                        >
                          <CreditCard className="h-3 w-3 mr-1" /> Pay ₹{tx.pricingSnapshot.actualPrice}
                        </Button>
                      )}

                      {/* Cancel Order Action */}
                      {tx.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCancellingTx(tx)
                            setCancellationReason('')
                          }}
                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))] block">Vehicle</span>
                      <span className="font-bold font-mono">
                        {tx.vehicleSnapshot.displayRegistrationNumber}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] block text-[11px]">
                        {tx.vehicleSnapshot.categoryName} {tx.vehicleSnapshot.variant ? `(${tx.vehicleSnapshot.variant})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))] block">Service Package</span>
                      <span className="font-semibold text-sm">
                        {tx.servicePackageSnapshot.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))] block">Charged Amount</span>
                      <span className="font-extrabold text-sm text-[hsl(var(--primary))]">
                        ₹{tx.pricingSnapshot.actualPrice}
                      </span>
                      {tx.paymentMethod && (
                        <span className="text-[11px] font-semibold text-green-700 block">
                          Paid via {tx.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  {tx.status === 'CANCELLED' && tx.cancellationReason && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-800">
                      <span className="font-bold">Cancellation Reason:</span> {tx.cancellationReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {payingTx && user && userProfile && (
        <PaymentModal
          transaction={payingTx}
          staffId={user.uid}
          staffName={userProfile.displayName || user.email || 'Staff Member'}
          onPaymentSuccess={async () => {
            setPayingTx(null)
            await loadRecent()
            if (searchResults !== null && payingTx.vehicleSnapshot.registrationNumber) {
              await handleVehicleSearch(payingTx.vehicleSnapshot.registrationNumber)
            }
          }}
          onClose={() => setPayingTx(null)}
        />
      )}

      {/* Controlled Cancellation Modal */}
      {cancellingTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-xl border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <Ban className="h-5 w-5" /> Cancel Sales Order
              </CardTitle>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Order <span className="font-bold font-mono text-[hsl(var(--foreground))]">{cancellingTx.transactionNumber}</span> ({cancellingTx.vehicleSnapshot.displayRegistrationNumber})
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecuteCancel} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="cancellationReasonInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                    Mandatory Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="cancellationReasonInput"
                    type="text"
                    placeholder="e.g. Customer left before service, duplicate entry..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    A mandatory non-empty reason is required to cancel an open order.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCancellingTx(null)
                      setCancellationReason('')
                    }}
                    disabled={cancelling}
                  >
                    Close
                  </Button>
                  <Button type="submit" variant="destructive" disabled={cancelling || !cancellationReason.trim()}>
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
