import type { Transaction } from '@/types/transaction.types'

interface ReceiptViewProps {
  transaction: Transaction
}

/**
 * Printable digital receipt / order summary component.
 *
 * Terminology (Business Specification compliance — Refinement 4):
 * - Standard Price / Actual Price / Price Adjustment / Adjustment Reason
 * - The word "Discount" never appears anywhere in this component.
 *
 * Layout adapts to transaction status (Refinement 2):
 * - COMPLETED: Full receipt with payment section ("Transaction Receipt")
 * - OPEN: Order summary without payment section ("Order Summary")
 * - CANCELLED: Not rendered (caller must not mount for CANCELLED)
 *
 * Uses @media print CSS to hide sidebar, nav, modals, and buttons during printing.
 */
export function ReceiptView({ transaction }: ReceiptViewProps) {
  const { vehicleSnapshot, customerSnapshot, servicePackageSnapshot, pricingSnapshot, staffSnapshot } = transaction

  const arrivedAt = new Date(transaction.vehicleArrivedAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const paidAtStr = transaction.paidAt
    ? new Date(transaction.paidAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const isCompleted = transaction.status === 'COMPLETED'
  const hasAdjustment =
    pricingSnapshot.priceAdjustment !== 0 && !!pricingSnapshot.adjustmentReason

  return (
    <>
      {/* Print isolation styles — hides everything except the receipt during window.print() */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-printable, #receipt-printable * { visibility: visible !important; }
          #receipt-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 16px !important;
            background: white !important;
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div id="receipt-printable" className="font-mono text-xs bg-white text-black p-4 max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-3 border-b-2 border-dashed border-gray-400 pb-3">
          <div className="text-base font-extrabold uppercase tracking-widest">Mr. Wash</div>
          <div className="text-[11px] font-semibold">Car Wash & Detailing Studio</div>
          <div className="text-[10px] text-gray-600 mt-1">
            {isCompleted ? '— PAYMENT RECEIPT —' : '— ORDER SUMMARY —'}
          </div>
        </div>

        {/* Transaction Identity */}
        <div className="mb-3 space-y-0.5">
          <div className="flex justify-between">
            <span className="font-bold">Receipt No:</span>
            <span className="font-mono font-extrabold">{transaction.transactionNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Vehicle Arrived:</span>
            <span>{arrivedAt}</span>
          </div>
          {isCompleted && paidAtStr && (
            <div className="flex justify-between">
              <span>Paid At:</span>
              <span>{paidAtStr}</span>
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5">
          <div className="font-bold uppercase text-[10px] tracking-wider text-gray-500 mb-1">Vehicle</div>
          <div className="flex justify-between">
            <span>Reg No:</span>
            <span className="font-extrabold font-mono">{vehicleSnapshot.displayRegistrationNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span>
              {vehicleSnapshot.categoryName}
              {vehicleSnapshot.variant ? ` (${vehicleSnapshot.variant})` : ''}
            </span>
          </div>
          {vehicleSnapshot.model && (
            <div className="flex justify-between">
              <span>Model:</span>
              <span>{vehicleSnapshot.model}</span>
            </div>
          )}
        </div>

        {/* Customer Details (if available) */}
        {(customerSnapshot.name || customerSnapshot.phoneNumber) && (
          <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5">
            <div className="font-bold uppercase text-[10px] tracking-wider text-gray-500 mb-1">Customer</div>
            {customerSnapshot.name && (
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{customerSnapshot.name}</span>
              </div>
            )}
            {customerSnapshot.phoneNumber && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{customerSnapshot.phoneNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Service Package */}
        <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5">
          <div className="font-bold uppercase text-[10px] tracking-wider text-gray-500 mb-1">Service</div>
          <div className="font-bold">{servicePackageSnapshot.name}</div>
          {servicePackageSnapshot.activities.length > 0 && (
            <ul className="mt-1 space-y-0.5 pl-2">
              {servicePackageSnapshot.activities.map((activity) => (
                <li key={activity} className="text-[10px] text-gray-700">
                  • {activity}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pricing Section — Business Specification terminology only */}
        <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5">
          <div className="font-bold uppercase text-[10px] tracking-wider text-gray-500 mb-1">Pricing</div>
          <div className="flex justify-between">
            <span>Standard Price:</span>
            <span>₹{pricingSnapshot.standardPrice}</span>
          </div>
          {hasAdjustment && (
            <>
              <div className="flex justify-between">
                <span>Price Adjustment:</span>
                <span>
                  {pricingSnapshot.priceAdjustment < 0 ? '' : '+'}₹{pricingSnapshot.priceAdjustment}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Adjustment Reason:</span>
                <span className="text-right max-w-[55%]">{pricingSnapshot.adjustmentReason}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-extrabold border-t border-gray-300 pt-1 mt-1">
            <span>Actual Price:</span>
            <span>₹{pricingSnapshot.actualPrice}</span>
          </div>
        </div>

        {/* Payment Section — COMPLETED only */}
        {isCompleted && (
          <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5">
            <div className="font-bold uppercase text-[10px] tracking-wider text-gray-500 mb-1">Payment</div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-extrabold">PAID ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span>{transaction.paymentMethod || '—'}</span>
            </div>
            <div className="flex justify-between font-extrabold">
              <span>Amount Paid:</span>
              <span>₹{transaction.paidAmount}</span>
            </div>
          </div>
        )}

        {/* Staff Attribution */}
        <div className="mb-3 border-t border-dashed border-gray-300 pt-2 space-y-0.5 text-[10px] text-gray-500">
          <div>Served by: {staffSnapshot.staffName}</div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center text-[10px] text-gray-500 space-y-0.5">
          {isCompleted ? (
            <>
              <div className="font-bold text-xs text-black">Thank you for choosing Mr. Wash!</div>
              <div>Drive safe! 🚗💨</div>
            </>
          ) : (
            <>
              <div className="font-bold text-xs text-black">Order placed — Service in progress</div>
              <div>Please retain this summary.</div>
            </>
          )}
          <div className="mt-1">www.mrwash.in</div>
        </div>
      </div>
    </>
  )
}
