import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Transaction, PaymentRecord } from '@/types/transaction.types'
import { transactionService } from '@/services/transaction.service'
import { paymentService } from '@/services/payment.service'
import { ReceiptModal } from '@/components/receipt/ReceiptModal'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, Search, Eye, Filter, RotateCcw, AlertCircle, Printer } from 'lucide-react'

export function AdminTransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Selected Transaction & Associated Payment Record for Modal View
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [associatedPayment, setAssociatedPayment] = useState<PaymentRecord | null>(null)
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false)

  // Admin Payment Reversal Modal State
  const [reversingPayment, setReversingPayment] = useState<boolean>(false)
  const [reversalReasonInput, setReversalReasonInput] = useState<string>('')
  const [executingReversal, setExecutingReversal] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Phase 7: Receipt Modal State
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null)

  useEffect(() => {
    void loadTransactions()
  }, [])

  async function loadTransactions() {
    setLoading(true)
    try {
      const list = await transactionService.getRecentTransactions(50)
      setTransactions(list)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTransaction = async (tx: Transaction) => {
    setSelectedTx(tx)
    setAssociatedPayment(null)
    setReversingPayment(false)
    setReversalReasonInput('')
    setErrorMessage(null)

    if (tx.paymentStatus === 'PAID' || tx.status === 'COMPLETED') {
      setLoadingPayment(true)
      try {
        const pm = await paymentService.getPaymentForTransaction(tx.id)
        setAssociatedPayment(pm)
      } catch (err) {
        console.error('Failed to load associated payment:', err)
      } finally {
        setLoadingPayment(false)
      }
    }
  }

  const handleExecuteReversal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTx || !associatedPayment || !user) return
    const reason = reversalReasonInput.trim()
    if (!reason) {
      setErrorMessage('A mandatory reversal reason must be provided.')
      return
    }

    setExecutingReversal(true)
    setErrorMessage(null)

    try {
      await paymentService.reversePayment({
        paymentId: associatedPayment.id,
        reversalReason: reason,
        adminId: user.uid,
      })

      setReversingPayment(false)
      setSelectedTx(null)
      setAssociatedPayment(null)
      await loadTransactions()
    } catch (err: unknown) {
      console.error('Failed to reverse payment:', err)
      const msg = err instanceof Error ? err.message : 'Failed to reverse payment.'
      setErrorMessage(msg)
    } finally {
      setExecutingReversal(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OPEN' && tx.status !== 'OPEN') return false
      if (statusFilter === 'COMPLETED' && tx.status !== 'COMPLETED') return false
      if (statusFilter === 'CANCELLED' && tx.status !== 'CANCELLED') return false
      if (statusFilter === 'PAID' && tx.paymentStatus !== 'PAID') return false
      if (statusFilter === 'UNPAID' && tx.paymentStatus !== 'UNPAID') return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const matchTxNum = tx.transactionNumber.toLowerCase().includes(q)
      const matchReg = tx.vehicleSnapshot.registrationNumber.toLowerCase().includes(q)
      const matchCust = tx.customerSnapshot.name?.toLowerCase().includes(q) || tx.customerSnapshot.phoneNumber?.includes(q)
      return matchTxNum || matchReg || matchCust
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales & Payment Records</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          View transaction records, payment statuses, and execute controlled Admin payment reversals
        </p>
      </div>

      {/* Filter Controls */}
      <Card className="border-[hsl(var(--border))]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="text"
                placeholder="Search transaction # or vehicle number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <select
                className="h-9 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-xs font-semibold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN (Unpaid)</option>
                <option value="COMPLETED">COMPLETED (Paid)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
            Transactions & Payments Log ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>
            Immutable transaction snapshots and payment audit records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
              Loading transaction records...
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6 italic">
              No matching transactions found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-xs uppercase tracking-wider text-[hsl(var(--foreground))]">
                    <th className="p-3 font-bold">Transaction #</th>
                    <th className="p-3 font-bold">Vehicle</th>
                    <th className="p-3 font-bold">Service Package</th>
                    <th className="p-3 font-bold text-right">Charged Price</th>
                    <th className="p-3 font-bold text-center">Payment Status</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[hsl(var(--accent))]/40">
                      <td className="p-3 font-mono font-bold text-[hsl(var(--primary))]">{tx.transactionNumber}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold block">{tx.vehicleSnapshot.displayRegistrationNumber}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {tx.vehicleSnapshot.categoryName} {tx.vehicleSnapshot.variant ? `(${tx.vehicleSnapshot.variant})` : ''}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{tx.servicePackageSnapshot.name}</td>
                      <td className="p-3 font-extrabold text-right text-[hsl(var(--primary))]">₹{tx.pricingSnapshot.actualPrice}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            tx.paymentStatus === 'PAID' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {tx.paymentStatus || 'UNPAID'} {tx.paymentMethod ? `(${tx.paymentMethod})` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            tx.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleSelectTransaction(tx)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Snapshot & Payment Details Drawer Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full shadow-2xl border-[hsl(var(--border))] max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold font-mono text-[hsl(var(--primary))]">
                    {selectedTx.transactionNumber}
                  </CardTitle>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Created: {new Date(selectedTx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedTx.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : selectedTx.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedTx.status}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedTx.paymentStatus === 'PAID' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {selectedTx.paymentStatus || 'UNPAID'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Payment Details Section */}
              <div className="p-4 rounded-lg bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--primary))] block">
                  Payment Audit Record
                </span>
                {loadingPayment ? (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Loading payment record...</p>
                ) : associatedPayment ? (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))] block">Payment Method</span>
                        <span className="font-bold text-sm">{associatedPayment.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))] block">Paid Amount</span>
                        <span className="font-extrabold text-sm text-[hsl(var(--primary))]">₹{associatedPayment.amount}</span>
                      </div>
                    </div>
                    {associatedPayment.upiReferenceNumber && (
                      <p>UPI Ref ID: <span className="font-mono font-semibold">{associatedPayment.upiReferenceNumber}</span></p>
                    )}
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Recorded by: {associatedPayment.recordedByStaffName} on {new Date(associatedPayment.recordedAt).toLocaleString()}
                    </p>
                    {associatedPayment.isReversed && (
                      <div className="p-2 rounded bg-red-50 border border-red-200 text-red-800 font-semibold space-y-0.5">
                        <p>Status: REVERSED by Admin on {associatedPayment.reversedAt ? new Date(associatedPayment.reversedAt).toLocaleString() : ''}</p>
                        <p className="text-[11px] font-normal">Reason: {associatedPayment.reversalReason}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="italic text-[hsl(var(--muted-foreground))]">No payment recorded yet (Status: UNPAID)</p>
                )}
              </div>

              {/* Vehicle Snapshot */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Vehicle Snapshot
                </span>
                <p className="font-mono font-bold text-sm">{selectedTx.vehicleSnapshot.displayRegistrationNumber}</p>
                <p>
                  Category: {selectedTx.vehicleSnapshot.categoryName} {selectedTx.vehicleSnapshot.variant ? `(${selectedTx.vehicleSnapshot.variant})` : ''}
                </p>
              </div>

              {/* Service & Pricing Snapshot */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Service & Pricing Snapshot
                </span>
                <p className="font-bold text-sm">{selectedTx.servicePackageSnapshot.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[hsl(var(--muted-foreground))]">Standard Price:</span> ₹{selectedTx.pricingSnapshot.standardPrice}</div>
                  <div><span className="text-[hsl(var(--muted-foreground))]">Actual Price:</span> <span className="font-bold text-[hsl(var(--primary))]">₹{selectedTx.pricingSnapshot.actualPrice}</span></div>
                </div>
              </div>

              {/* Admin Reversal Action */}
              {selectedTx.status === 'COMPLETED' && selectedTx.paymentStatus === 'PAID' && associatedPayment && !associatedPayment.isReversed && (
                <div className="pt-2 border-t border-[hsl(var(--border))]">
                  {!reversingPayment ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReversingPayment(true)}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Admin Reverse Payment
                    </Button>
                  ) : (
                    <form onSubmit={handleExecuteReversal} className="p-3 rounded bg-red-50/50 border border-red-200 space-y-3">
                      <span className="font-bold text-xs text-red-700 block">
                        Execute Atomic Admin Payment Reversal
                      </span>
                      <Input
                        type="text"
                        placeholder="Mandatory reversal reason..."
                        value={reversalReasonInput}
                        onChange={(e) => setReversalReasonInput(e.target.value)}
                        autoFocus
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setReversingPayment(false)} disabled={executingReversal}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="destructive" size="sm" disabled={executingReversal || !reversalReasonInput.trim()}>
                          {executingReversal ? 'Reversing...' : 'Confirm Reversal'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Phase 7: Print Receipt / Print Order Summary — adapts to status (Refinement 2) */}
              {selectedTx.status !== 'CANCELLED' && (
                <div className="pt-2 border-t border-[hsl(var(--border))] mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReceiptTx(selectedTx)}
                    className="gap-1.5 text-xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    {selectedTx.status === 'COMPLETED' ? 'Print Receipt' : 'Print Order Summary'}
                  </Button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  Close Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 7: Receipt Modal */}
      {receiptTx && (
        <ReceiptModal
          transaction={receiptTx}
          onClose={() => setReceiptTx(null)}
        />
      )}
    </div>
  )
}
