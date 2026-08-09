import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { PricingRule } from '@/types/service.types'

const COLLECTION_NAME = 'pricingRules'

/**
 * Generate unique rule ID for category + variant + servicePackage combination
 */
export function generatePricingRuleId(
  categoryId: string,
  servicePackageId: string,
  variant?: string
): string {
  const cleanCat = categoryId.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cleanPkg = servicePackageId.toLowerCase().replace(/[^a-z0-9]/g, '_')
  if (variant && variant.trim()) {
    const cleanVar = variant.toLowerCase().replace(/[^a-z0-9]/g, '_')
    return `${cleanCat}_${cleanVar}_${cleanPkg}`
  }
  return `${cleanCat}_${cleanPkg}`
}

export const pricingService = {
  /**
   * Fetch all active pricing rules
   */
  async getAllPricingRules(): Promise<PricingRule[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as PricingRule[]
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
      throw error
    }
  },

  /**
   * Look up exact standard price rule for (categoryId, variant, servicePackageId).
   * Returns price in whole rupees or NULL if unconfigured.
   * NEVER returns 0 or fake fallbacks for unconfigured rules.
   */
  async getStandardPriceRule(
    categoryId: string,
    servicePackageId: string,
    variant?: string
  ): Promise<number | null> {
    try {
      const ruleId = generatePricingRuleId(categoryId, servicePackageId, variant)
      const rules = await this.getAllPricingRules()
      const match = rules.find((r) => r.id === ruleId)

      if (match && typeof match.price === 'number' && match.price >= 0) {
        return Math.round(match.price)
      }

      // If category has no variant or exact variant match wasn't found, try base category rule
      if (variant) {
        const baseRuleId = generatePricingRuleId(categoryId, servicePackageId)
        const baseMatch = rules.find((r) => r.id === baseRuleId)
        if (baseMatch && typeof baseMatch.price === 'number' && baseMatch.price >= 0) {
          return Math.round(baseMatch.price)
        }
      }

      // Price is unconfigured
      return null
    } catch (error) {
      console.error('Error querying standard price rule:', error)
      return null
    }
  },

  /**
   * Create or update standard price rule in whole rupees (Admin only).
   * Changes apply ONLY to future transactions.
   */
  async setStandardPriceRule(
    categoryId: string,
    servicePackageId: string,
    price: number,
    variant?: string
  ): Promise<void> {
    const wholeRupees = Math.max(0, Math.round(price))
    const ruleId = generatePricingRuleId(categoryId, servicePackageId, variant)
    const docRef = doc(db, COLLECTION_NAME, ruleId)

    const now = new Date().toISOString()
    const ruleData: PricingRule = {
      id: ruleId,
      vehicleCategoryId: categoryId,
      servicePackageId,
      variant: variant?.trim() || undefined,
      price: wholeRupees,
      isActive: true,
      effectiveFrom: now,
      createdAt: now,
      updatedAt: now,
    }

    try {
      await setDoc(docRef, ruleData)
    } catch (error) {
      console.error(`Error saving pricing rule ${ruleId}:`, error)
      throw error
    }
  },
}
