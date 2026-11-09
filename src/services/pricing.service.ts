import { collection, getDocs, doc, query, where, runTransaction } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { PricingRule } from '@/types/service.types'
import { auditService } from './audit.service'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

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

export interface OfficialPriceItem {
  categoryId: string
  servicePackageId: string
  variant?: string
  price: number
}

/**
 * Confirmed Official Mr. Wash Standard Pricing Table (43 Configured Combinations)
 * Note: SUV and Superbike have no separate prices and remain unconfigured.
 */
export const OFFICIAL_MR_WASH_PRICING: OfficialPriceItem[] = [
  // 1. Hatchback Car
  { categoryId: 'hatchback_car', servicePackageId: 'body_wash', price: 200 },
  { categoryId: 'hatchback_car', servicePackageId: 'body_vacuum', price: 350 },
  { categoryId: 'hatchback_car', servicePackageId: 'full_wash', price: 550 },

  // 2. Sedan Car
  { categoryId: 'sedan_car', servicePackageId: 'body_wash', price: 250 },
  { categoryId: 'sedan_car', servicePackageId: 'body_vacuum', price: 450 },
  { categoryId: 'sedan_car', servicePackageId: 'full_wash', price: 650 },

  // 3. Compact SUV
  { categoryId: 'compact_suv', servicePackageId: 'body_wash', price: 250 },
  { categoryId: 'compact_suv', servicePackageId: 'body_vacuum', price: 450 },
  { categoryId: 'compact_suv', servicePackageId: 'full_wash', price: 700 },

  // 4. Premium SUV
  { categoryId: 'premium_suv', servicePackageId: 'body_wash', price: 400 },
  { categoryId: 'premium_suv', servicePackageId: 'body_vacuum', price: 650 },
  { categoryId: 'premium_suv', servicePackageId: 'full_wash', price: 900 },

  // 5. Scooter (Body Wash & Body & Vacuum are unavailable)
  { categoryId: 'scooter', servicePackageId: 'full_wash', price: 200 },

  // 6. Bike (Body Wash & Body & Vacuum are unavailable)
  { categoryId: 'bike', servicePackageId: 'full_wash', price: 250 },

  // 7. Bullet (Body Wash & Body & Vacuum are unavailable)
  { categoryId: 'bullet', servicePackageId: 'full_wash', price: 300 },

  // 8. Auto (Body Wash & Body & Vacuum are unavailable)
  { categoryId: 'auto', servicePackageId: 'full_wash', price: 600 },

  // 9. Traveller — 10 Seat
  { categoryId: 'traveller', variant: '10 Seat', servicePackageId: 'body_wash', price: 450 },
  { categoryId: 'traveller', variant: '10 Seat', servicePackageId: 'body_vacuum', price: 700 },
  { categoryId: 'traveller', variant: '10 Seat', servicePackageId: 'full_wash', price: 1200 },

  // 10. Traveller — 14 Seat
  { categoryId: 'traveller', variant: '14 Seat', servicePackageId: 'body_wash', price: 550 },
  { categoryId: 'traveller', variant: '14 Seat', servicePackageId: 'body_vacuum', price: 800 },
  { categoryId: 'traveller', variant: '14 Seat', servicePackageId: 'full_wash', price: 1500 },

  // 11. Traveller — 17 Seat
  { categoryId: 'traveller', variant: '17 Seat', servicePackageId: 'body_wash', price: 600 },
  { categoryId: 'traveller', variant: '17 Seat', servicePackageId: 'body_vacuum', price: 850 },
  { categoryId: 'traveller', variant: '17 Seat', servicePackageId: 'full_wash', price: 1700 },

  // 12. Pickup — Ordinary
  { categoryId: 'pickup', variant: 'Ordinary', servicePackageId: 'body_wash', price: 300 },
  { categoryId: 'pickup', variant: 'Ordinary', servicePackageId: 'body_vacuum', price: 500 },
  { categoryId: 'pickup', variant: 'Ordinary', servicePackageId: 'full_wash', price: 750 },

  // 13. Pickup — Long Chassis
  { categoryId: 'pickup', variant: 'Long Chassis', servicePackageId: 'body_wash', price: 350 },
  { categoryId: 'pickup', variant: 'Long Chassis', servicePackageId: 'body_vacuum', price: 500 },
  { categoryId: 'pickup', variant: 'Long Chassis', servicePackageId: 'full_wash', price: 800 },

  // 14. Dost — Ordinary
  { categoryId: 'dost', variant: 'Ordinary', servicePackageId: 'body_wash', price: 300 },
  { categoryId: 'dost', variant: 'Ordinary', servicePackageId: 'body_vacuum', price: 500 },
  { categoryId: 'dost', variant: 'Ordinary', servicePackageId: 'full_wash', price: 750 },

  // 15. Dost — Bada Dost
  { categoryId: 'dost', variant: 'Bada Dost', servicePackageId: 'body_wash', price: 350 },
  { categoryId: 'dost', variant: 'Bada Dost', servicePackageId: 'body_vacuum', price: 500 },
  { categoryId: 'dost', variant: 'Bada Dost', servicePackageId: 'full_wash', price: 800 },

  // 16. TATA ACE
  { categoryId: 'tata_ace', servicePackageId: 'body_wash', price: 300 },
  { categoryId: 'tata_ace', servicePackageId: 'body_vacuum', price: 450 },
  { categoryId: 'tata_ace', servicePackageId: 'full_wash', price: 700 },

  // 17. Super ACE
  { categoryId: 'super_ace', servicePackageId: 'body_wash', price: 350 },
  { categoryId: 'super_ace', servicePackageId: 'body_vacuum', price: 450 },
  { categoryId: 'super_ace', servicePackageId: 'full_wash', price: 750 },
]

export const pricingService = {
  /**
   * Fetch all active pricing rules
   */
  async getAllPricingRules(): Promise<PricingRule[]> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        vehicleCategoryId: row.vehicle_category_id,
        servicePackageId: row.service_package_id,
        variant: row.variant ?? undefined,
        price: row.price,
        isActive: row.is_active,
        effectiveFrom: row.effective_from,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      const client = getSupabaseClient()
      const findRule = async (exactVariant: string | null) => {
        let query = client
          .from('pricing_rules')
          .select('price')
          .eq('vehicle_category_id', categoryId)
          .eq('service_package_id', servicePackageId)
          .eq('is_active', true)
        query = exactVariant === null ? query.is('variant', null) : query.eq('variant', exactVariant)
        const { data, error } = await query.maybeSingle()
        if (error) throw error
        return data?.price ?? null
      }
      const exactPrice = await findRule(variant?.trim() || null)
      if (exactPrice !== null) return Math.round(exactPrice)
      if (variant) {
        const basePrice = await findRule(null)
        return basePrice === null ? null : Math.round(basePrice)
      }
      return null
    }
    try {
      const ruleId = generatePricingRuleId(categoryId, servicePackageId, variant)
      const rules = await this.getAllPricingRules()
      const match = rules.find((r) => r.id === ruleId)

      if (match && typeof match.price === 'number' && match.price > 0) {
        return Math.round(match.price)
      }

      // If category has no variant or exact variant match wasn't found, try base category rule
      if (variant) {
        const baseRuleId = generatePricingRuleId(categoryId, servicePackageId)
        const baseMatch = rules.find((r) => r.id === baseRuleId)
        if (baseMatch && typeof baseMatch.price === 'number' && baseMatch.price > 0) {
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
   * Atomic runTransaction: writes pricing rule and PRICE_CHANGED audit log together.
   */
  async setStandardPriceRule(
    categoryId: string,
    servicePackageId: string,
    price: number,
    variant?: string,
    performedBy?: { userId: string; userName: string; userRole: 'ADMIN' | 'STAFF' }
  ): Promise<void> {
    if (!Number.isInteger(price) || price <= 0) {
      throw new Error('Standard price must be a positive whole rupee amount.')
    }
    const wholeRupees = price
    if (BACKEND_PROVIDER === 'supabase') {
      const { error } = await getSupabaseClient().rpc('rpc_set_price_rule', {
        p_category_id: categoryId,
        p_service_package_id: servicePackageId,
        p_price: wholeRupees,
        p_variant: variant?.trim() || null,
      })
      if (error) throw error
      return
    }
    const ruleId = generatePricingRuleId(categoryId, servicePackageId, variant)
    const docRef = doc(db, COLLECTION_NAME, ruleId)

    const now = new Date().toISOString()

    try {
      await runTransaction(db, async (t) => {
        const snap = await t.get(docRef)
        const oldPrice = snap.exists() ? (snap.data() as PricingRule).price : null

        const ruleData: PricingRule = {
          id: ruleId,
          vehicleCategoryId: categoryId,
          servicePackageId,
          variant: variant?.trim() || undefined,
          price: wholeRupees,
          isActive: true,
          effectiveFrom: now,
          createdAt: snap.exists() ? (snap.data() as PricingRule).createdAt : now,
          updatedAt: now,
        }

        const { docRef: auditRef, record: auditRec } = auditService.prepareAuditRecord({
          eventType: 'PRICE_CHANGED',
          targetDocumentId: ruleId,
          targetReference: `${categoryId} / ${servicePackageId}${variant ? ' (' + variant + ')' : ''}`,
          performedByUserId: performedBy?.userId || 'system_admin',
          performedByUserName: performedBy?.userName || 'Administrator',
          performedByUserRole: performedBy?.userRole || 'ADMIN',
          metadata: {
            vehicleCategoryId: categoryId,
            servicePackageId,
            variant: variant || '—',
            oldPrice: oldPrice !== null ? oldPrice : 'UNCONFIGURED',
            newPrice: wholeRupees,
          },
        })

        t.set(docRef, ruleData)
        t.set(auditRef, auditRec)
      })
    } catch (error) {
      console.error(`Error saving pricing rule ${ruleId}:`, error)
      throw error
    }
  },

  /**
   * Safe, repeatable seeding of the official 43 Mr. Wash pricing rules.
   * Atomically records PRICE_CHANGED audit record for each rule.
   * SUV and Superbike remain strictly unconfigured.
   */
  async seedOfficialPricing(
    performedBy?: { userId: string; userName: string; userRole: 'ADMIN' | 'STAFF' }
  ): Promise<{ success: boolean; configuredCount: number }> {
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient().rpc('rpc_seed_official_pricing', {
        p_rules: OFFICIAL_MR_WASH_PRICING,
      })
      if (error) throw error
      return { success: true, configuredCount: Number(data) }
    }
    for (const item of OFFICIAL_MR_WASH_PRICING) {
      await this.setStandardPriceRule(
        item.categoryId,
        item.servicePackageId,
        item.price,
        item.variant,
        performedBy
      )
    }
    return { success: true, configuredCount: OFFICIAL_MR_WASH_PRICING.length }
  },
}
