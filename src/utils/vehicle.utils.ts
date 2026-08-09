/**
 * Normalize vehicle registration number to uppercase alphanumeric string without spaces or hyphens.
 * Example: "kl-01 ab 1234" -> "KL01AB1234"
 */
export function normalizeRegistrationNumber(input: string): string {
  if (!input) return ''
  return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

/**
 * Format normalized registration number into readable space-separated display string.
 * Example: "KL01AB1234" -> "KL 01 AB 1234"
 */
export function formatRegistrationNumber(normalized: string): string {
  const clean = normalizeRegistrationNumber(normalized)
  if (!clean) return ''
  
  // Standard Indian vehicle registration format: State(2) + District(2) + Series(1-2) + Number(4)
  const match = clean.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }
  
  return clean
}

/**
 * Validate basic vehicle registration number presence and format
 */
export function isValidRegistrationNumber(input: string): boolean {
  const normalized = normalizeRegistrationNumber(input)
  return normalized.length >= 4 && normalized.length <= 13
}
