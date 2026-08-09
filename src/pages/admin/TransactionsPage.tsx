import { useState, useEffect } from 'react'
import type { Transaction } from '@/types/transaction.types'
import { transactionService } from '@/services/transaction.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, Search, Eye, Filter } from 'lucide-react'

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Selected Transaction for Drawer / Modal View
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

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

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
      return false
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
        <h1 className="text-2xl font-bold tracking-tight">Sales Records Foundation</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          View immutable sales transaction records and historical snapshots
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
                <option value="OPEN">OPEN</option>
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
            Transactions Log ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>
            Immutable transaction snapshots preserved independently from live data modifications.
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
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold">Created At</th>
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
                            tx.status === 'OPEN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
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

      {/* Snapshot Drawer Modal */}
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
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    selectedTx.status === 'OPEN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedTx.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Vehicle Snapshot */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Vehicle Snapshot
                </span>
                <p className="font-mono font-bold text-sm">{selectedTx.vehicleSnapshot.displayRegistrationNumber}</p>
                <p>
                  Category: {selectedTx.vehicleSnapshot.categoryName} {selectedTx.vehicleSnapshot.variant ? `(${selectedTx.vehicleSnapshot.variant})` : ''}
                </p>
                {selectedTx.vehicleSnapshot.model && <p>Model: {selectedTx.vehicleSnapshot.model}</p>}
              </div>

              {/* Customer Snapshot */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Customer Snapshot
                </span>
                {selectedTx.customerSnapshot.name || selectedTx.customerSnapshot.phoneNumber ? (
                  <>
                    <p className="font-semibold">{selectedTx.customerSnapshot.name || 'Unnamed Customer'}</p>
                    <p>Phone: {selectedTx.customerSnapshot.phoneNumber || 'N/A'}</p>
                  </>
                ) : (
                  <p className="italic text-[hsl(var(--muted-foreground))]">No customer details linked (customerId = null)</p>
                )}
              </div>

              {/* Service & Pricing Snapshot */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Service & Pricing Snapshot
                </span>
                <p className="font-bold text-sm">{selectedTx.servicePackageSnapshot.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Standard Price:</span> ₹{selectedTx.pricingSnapshot.standardPrice}
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Charged Price:</span> <span className="font-extrabold text-[hsl(var(--primary))]">₹{selectedTx.pricingSnapshot.actualPrice}</span>
                  </div>
                </div>
                {selectedTx.pricingSnapshot.adjustmentReason && (
                  <p className="italic text-[hsl(var(--muted-foreground))]">
                    Adjustment Reason: {selectedTx.pricingSnapshot.adjustmentReason}
                  </p>
                )}
                <div>
                  <span className="font-semibold block mb-1">Included Activities:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedTx.servicePackageSnapshot.activities.map((act) => (
                      <li key={act}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Staff & Metadata */}
              <div className="p-3 rounded bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                  Staff Attribution & Timestamps
                </span>
                <p>Created by: {selectedTx.staffSnapshot.staffName} ({selectedTx.staffSnapshot.staffEmail})</p>
                <p>Vehicle Arrived At: {new Date(selectedTx.vehicleArrivedAt).toLocaleString()}</p>
                {selectedTx.expectedPickupAt && (
                  <p>Expected Pickup At: {new Date(selectedTx.expectedPickupAt).toLocaleString()}</p>
                )}
                {selectedTx.status === 'CANCELLED' && selectedTx.cancellationReason && (
                  <p className="text-red-700 font-semibold pt-1">
                    Cancellation Reason: {selectedTx.cancellationReason}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  Close Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
