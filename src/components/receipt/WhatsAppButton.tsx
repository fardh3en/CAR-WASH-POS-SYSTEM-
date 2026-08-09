import type { Transaction } from '@/types/transaction.types'
import { formatPhoneForWhatsApp, buildWhatsAppMessage, generateWhatsAppUrl } from '@/utils/receipt.utils'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  transaction: Transaction
  size?: 'sm' | 'default'
}

/**
 * WhatsApp E-Bill trigger button.
 *
 * Guards (Refinement 1):
 * - Renders as disabled unless transaction.status === 'COMPLETED' && paymentStatus === 'PAID'.
 * - Renders as disabled if customer phone is absent or fails DDDDD-DDDDD format validation.
 * - Never produces a malformed wa.me URL.
 *
 * Phone validation (Refinement 3):
 * - Calls formatPhoneForWhatsApp() which accepts only DDDDD-DDDDD format.
 * - Invalid or missing phone → null → disabled state with informative tooltip/title.
 */
export function WhatsAppButton({ transaction, size = 'default' }: WhatsAppButtonProps) {
  const isCompleted =
    transaction.status === 'COMPLETED' && transaction.paymentStatus === 'PAID'

  // Determine phone validity
  const validatedPhone = formatPhoneForWhatsApp(transaction.customerSnapshot.phoneNumber)
  const hasValidPhone = validatedPhone !== null

  // Determine disabled state and tooltip reason
  const isDisabled = !isCompleted || !hasValidPhone

  let disabledReason = ''
  if (!isCompleted) {
    disabledReason = 'WhatsApp e-bill available only after payment is completed'
  } else if (!hasValidPhone) {
    disabledReason = 'Customer phone number not provided or invalid (expected format: 98765-43210)'
  }

  const handleClick = () => {
    if (isDisabled || !validatedPhone) return
    const message = buildWhatsAppMessage(transaction)
    const url = generateWhatsAppUrl(validatedPhone, message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      type="button"
      variant={isDisabled ? 'outline' : 'default'}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      title={isDisabled ? disabledReason : 'Send WhatsApp E-Bill to customer'}
      className={
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 text-white font-semibold'
      }
    >
      <MessageCircle className="h-4 w-4 mr-1.5" />
      {isCompleted && hasValidPhone ? 'Send WhatsApp E-Bill' : 'WhatsApp E-Bill'}
    </Button>
  )
}
