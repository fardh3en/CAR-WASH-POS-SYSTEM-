import React, { useState } from 'react'
import type { Transaction, PaymentMethod } from '@/types/transaction.types'
import { paymentService } from '@/services/payment.service'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, Banknote, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PaymentModalProps {
  transaction: Transaction
  staffId: string
  staffName: string
  onPaymentSuccess: () => void
  onClose: () => void
}

export function PaymentModal({
  transaction,
  staffId,
  staffName,
  onPaymentSuccess,
  onClose,
}: PaymentModalProps) {
  const actualPrice = transaction.pricingSnapshot.actualPrice
  const [method, setMethod] = useState<PaymentMethod>('CASH')

  // Cash Tendered State
  const [cashTendered, setCashTendered] = useState<string>('')
  
  // UPI Reference Number State
  const [upiRef, setUpiRef] = useState<string>('')
  
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate Cash Change Due
  const parsedTendered = parseInt(cashTendered, 10) || 0
  const changeDue = parsedTendered > actualPrice ? parsedTendered - actualPrice : 0

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (method === 'CASH' && cashTendered !== '' && parsedTendered < actualPrice) {
      setErrorMessage(`Tendered cash (₹${parsedTendered}) is less than amount due (₹${actualPrice}).`)
      return
    }

    setSubmitting(true)

    try {
      await paymentService.processPayment({
        transactionId: transaction.id,
        paymentMethod: method,
        amount: actualPrice,
        upiReferenceNumber: method === 'UPI' ? upiRef.trim() || undefined : undefined,
        staffId,
        staffName,
      })

      onPaymentSuccess()
    } catch (err: unknown) {
      console.error('Payment processing failed:', err)
      const msg = err instanceof Error ? err.message : 'Failed to record payment.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full shadow-2xl border-[hsl(var(--border))]">
        <CardHeader className="pb-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
              Collect Payment
            </CardTitle>
            <span className="text-xs font-mono font-bold bg-[hsl(var(--secondary))] px-2.5 py-1 rounded border border-[hsl(var(--border))]">
              {transaction.transactionNumber}
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Vehicle: <span className="font-bold text-[hsl(var(--foreground))]">{transaction.vehicleSnapshot.displayRegistrationNumber}</span> &mdash; {transaction.servicePackageSnapshot.name}
          </p>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Amount Due Display */}
          <div className="p-4 rounded-lg bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Amount Due
            </span>
            <span className="text-2xl font-extrabold text-[hsl(var(--primary))]">₹{actualPrice}</span>
          </div>

          {/* Payment Method Selector (CASH / UPI) */}
          <form onSubmit={handleCollectPayment} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all ${
                    method === 'CASH'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 font-bold'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  <Banknote className="h-6 w-6 text-green-600" />
                  <span className="text-xs">CASH</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all ${
                    method === 'UPI'
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 font-bold'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  <QrCode className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">UPI (QR / App)</span>
                </button>
              </div>
            </div>

            {/* CASH Option details */}
            {method === 'CASH' && (
              <div className="p-3 rounded-md bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-2">
                <label htmlFor="tenderedInput" className="text-xs font-semibold text-[hsl(var(--foreground))] block">
                  Tendered Cash Amount (₹) <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">(Calculator)</span>
                </label>
                <Input
                  id="tenderedInput"
                  type="number"
                  min="0"
                  placeholder={`e.g. ${actualPrice}`}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                />
                {parsedTendered > 0 && (
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[hsl(var(--muted-foreground))]">Change Due:</span>
                    <span className={`font-bold ${changeDue >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      ₹{changeDue}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* UPI Option details */}
            {method === 'UPI' && (
              <div className="p-3 rounded-md bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] space-y-2">
                <label htmlFor="upiRefInput" className="text-xs font-semibold text-[hsl(var(--foreground))] block">
                  UPI Reference Number / Txn ID <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">(Optional)</span>
                </label>
                <Input
                  id="upiRefInput"
                  type="text"
                  placeholder="e.g. 320518928472"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={submitting} className="font-bold">
                {submitting ? (
                  'Recording Payment...'
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm ₹{actualPrice} ({method})
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
