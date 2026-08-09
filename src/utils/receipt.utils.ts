import type { Transaction } from '@/types/transaction.types'

/**
 * Validate and format an Indian mobile phone number stored in DDDDD-DDDDD format
 * (e.g. "98765-43210") into the WhatsApp international format "91XXXXXXXXXX".
 *
 * Validation rules (Refinement 3):
 * 1. Input must match exactly DDDDD-DDDDD (5 digits, hyphen, 5 digits).
 * 2. Stripping the hyphen must yield exactly 10 digits.
 * 3. The first digit must be one of [6, 7, 8, 9] (valid Indian mobile prefix per TRAI).
 * 4. Returns null for any validation failure — never produces a malformed URL.
 */
export function formatPhoneForWhatsApp(phone: string | undefined | null): string | null {
  if (!phone) return null

  // Accept only DDDDD-DDDDD format
  const pattern = /^\d{5}-\d{5}$/
  if (!pattern.test(phone.trim())) return null

  // Strip hyphen
  const digits = phone.replace('-', '')

  // Must be exactly 10 digits (already guaranteed by regex but explicit guard)
  if (digits.length !== 10) return null

  // First digit must be 6, 7, 8, or 9
  const firstDigit = parseInt(digits[0], 10)
  if (![6, 7, 8, 9].includes(firstDigit)) return null

  return `91${digits}`
}

/**
 * Build the pre-filled WhatsApp e-bill message text for a COMPLETED + PAID transaction.
 * Uses Business Specification terminology exclusively:
 * Standard Price / Actual Price / Price Adjustment / Adjustment Reason
 * The word "Discount" is never used.
 */
export function buildWhatsAppMessage(transaction: Transaction): string {
  const { vehicleSnapshot, servicePackageSnapshot, pricingSnapshot, paymentMethod, paidAt, paidAmount, transactionNumber } = transaction

  const dateStr = paidAt
    ? new Date(paidAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(transaction.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  const vehicleLine = vehicleSnapshot.displayRegistrationNumber
  const categoryLine = [vehicleSnapshot.categoryName, vehicleSnapshot.variant]
    .filter(Boolean)
    .join(' — ')

  const activitiesLine = servicePackageSnapshot.activities.join(' · ')

  const standardPrice = pricingSnapshot.standardPrice
  const actualPrice = pricingSnapshot.actualPrice
  const adjustment = pricingSnapshot.priceAdjustment // negative means reduction

  let pricingSection = `Standard Price: ₹${standardPrice}\nActual Price: ₹${actualPrice}`
  if (adjustment !== 0 && pricingSnapshot.adjustmentReason) {
    const sign = adjustment < 0 ? '' : '+'
    pricingSection += `\nPrice Adjustment: ${sign}₹${adjustment}`
    pricingSection += `\nAdjustment Reason: ${pricingSnapshot.adjustmentReason}`
  }

  const message = [
    `✨ *Mr. Wash — Car Wash & Detailing Studio* ✨`,
    ``,
    `📋 *Receipt No:* ${transactionNumber}`,
    `📅 *Date:* ${dateStr}`,
    ``,
    `🚗 *Vehicle Details*`,
    `Reg No: ${vehicleLine}`,
    `Category: ${categoryLine}`,
    ``,
    `🧼 *Service:* ${servicePackageSnapshot.name}`,
    `Activities: ${activitiesLine}`,
    ``,
    `💰 *Pricing*`,
    pricingSection,
    ``,
    `💳 *Payment*`,
    `Amount Paid: ₹${paidAmount}`,
    `Method: ${paymentMethod || 'N/A'}`,
    `Status: PAID ✅`,
    ``,
    `Thank you for choosing Mr. Wash! 🚗💨`,
    `We look forward to seeing you again.`,
  ].join('\n')

  return message
}

/**
 * Generate a WhatsApp deep link URL from an already-validated international phone number
 * and a pre-formatted message string.
 * Never called with raw phone input — always receives the result of formatPhoneForWhatsApp().
 */
export function generateWhatsAppUrl(internationalPhone: string, message: string): string {
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
}
