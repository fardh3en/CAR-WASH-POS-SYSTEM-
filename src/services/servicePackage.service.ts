import { collection, getDocs, doc, setDoc, query, where, orderBy, runTransaction } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { ServicePackage } from '@/types/service.types'
import { auditService } from './audit.service'

const COLLECTION_NAME = 'servicePackages'

export const DEFAULT_SERVICE_PACKAGES = [
  {
    id: 'body_wash',
    name: 'Body Wash',
    description: 'Exterior pressure wash and tyre polishing',
    activities: ['Exterior pressure wash', 'Tyre polishing'],
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'body_vacuum',
    name: 'Body & Vacuum',
    description: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: [
      'Exterior body cleaning',
      'Interior vacuuming',
      'Dashboard polishing',
      'Tyre polishing',
    ],
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'full_wash',
    name: 'Full Wash',
    description: 'Complete comprehensive cleaning including underbody and engine room',
    activities: [
      'Exterior body cleaning',
      'Interior vacuuming',
      'Dashboard polishing',
      'Tyre polishing',
      'Underbody cleaning',
      'Engine room cleaning',
    ],
    displayOrder: 3,
    isActive: true,
  },
]

export const servicePackageService = {
  /**
   * Fetch active service packages ordered by displayOrder
   */
  async getServicePackages(): Promise<ServicePackage[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        await this.seedDefaultServicePackages()
        const retrySnapshot = await getDocs(q)
        return retrySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ServicePackage[]
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ServicePackage[]
    } catch (error) {
      console.error('Error fetching service packages:', error)
      throw error
    }
  },

  /**
   * Seed exact approved standard service packages if collection is empty
   */
  async seedDefaultServicePackages(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME))
      if (!snapshot.empty) return

      const now = new Date().toISOString()
      for (const pkg of DEFAULT_SERVICE_PACKAGES) {
        const docRef = doc(db, COLLECTION_NAME, pkg.id)
        await setDoc(docRef, {
          ...pkg,
          createdAt: now,
          updatedAt: now,
        })
      }
    } catch (error) {
      console.error('Error seeding service packages:', error)
    }
  },

  /**
   * Update service package information (Admin only).
   * Atomic runTransaction: updates service package and writes SERVICE_CONFIGURATION_CHANGED audit log.
   */
  async updateServicePackage(
    id: string,
    updates: Partial<ServicePackage>,
    performedBy?: { userId: string; userName: string; userRole: 'ADMIN' | 'STAFF' }
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const now = new Date().toISOString()

    try {
      await runTransaction(db, async (t) => {
        const snap = await t.get(docRef)
        if (!snap.exists()) {
          throw new Error('Service package not found.')
        }

        const pkgData = snap.data() as ServicePackage
        const updatedPackageData = {
          ...updates,
          updatedAt: now,
        }

        const { docRef: auditRef, record: auditRec } = auditService.prepareAuditRecord({
          eventType: 'SERVICE_CONFIGURATION_CHANGED',
          targetDocumentId: id,
          targetReference: pkgData.name || id,
          performedByUserId: performedBy?.userId || 'system_admin',
          performedByUserName: performedBy?.userName || 'Administrator',
          performedByUserRole: performedBy?.userRole || 'ADMIN',
          metadata: {
            packageName: pkgData.name,
            updatedFields: Object.keys(updates).join(', '),
          },
        })

        t.update(docRef, updatedPackageData)
        t.set(auditRef, auditRec)
      })
    } catch (error) {
      console.error(`Error updating service package ${id}:`, error)
      throw error
    }
  },
}
