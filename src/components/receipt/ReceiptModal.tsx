import type { Transaction } from '@/types/transaction.types'
import { ReceiptView } from './ReceiptView'
import { WhatsAppButton } from './WhatsAppButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, X } from 'lucide-react'

interface ReceiptModalProps {
  transaction: Transaction
  onClose: () => void
}

/**
 * Modal dialog containing ReceiptView (printable receipt) and WhatsAppButton.
 *
 * Header adapts to status (Refinement 2):
 * - OPEN: "Order Summary"
 * - COMPLETED: "Transaction Receipt"
 * - CANCELLED: Should not be mounted by callers.
 *
 * Print button label adapts (Refinement 2):
 * - OPEN: "Print Order Summary"
 * - COMPLETED: "Print Receipt"
 *
 * WhatsApp E-Bill (Refinement 1):
 * - Shown only for COMPLETED + PAID transactions.
 * - For OPEN transactions: WhatsApp section is completely absent.
 */
export function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const isCompleted = transaction.status === 'COMPLETED'

  const modalTitle = isCompleted ? 'Transaction Receipt' : 'Order Summary'
  const printLabel = isCompleted ? 'Print Receipt' : 'Print Order Summary'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-lg w-full shadow-2xl border-[hsl(var(--border))] max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <CardHeader className="pb-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{modalTitle}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 print:hidden"
              aria-label="Close receipt modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono font-bold">
            {transaction.transactionNumber} — {transaction.vehicleSnapshot.displayRegistrationNumber}
          </p>
        </CardHeader>

        {/* Receipt Content */}
        <CardContent className="pt-4 pb-4">
          <ReceiptView transaction={transaction} />

          {/* Action Buttons (hidden during print by ReceiptView's @media print rules) */}
          <div className="print:hidden mt-4 flex flex-col sm:flex-row gap-2 justify-end border-t border-[hsl(var(--border))] pt-4">
            {/* Print Action — label adapts to status */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              {printLabel}
            </Button>

            {/* WhatsApp E-Bill — ONLY for COMPLETED + PAID (Refinement 1) */}
            {isCompleted && (
              <WhatsAppButton transaction={transaction} />
            )}

            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
