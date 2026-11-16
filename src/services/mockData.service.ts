/**
 * Mock Data Service for Mr. Wash POS
 *
 * Generates realistic operational demo transactions across all Mr. Wash
 * vehicle classifications, service packages, and payment methods.
 * Operates through the authenticated application service layer, adhering to
 * all RLS policies, immutable snapshot standards, and pricing rules.
 */

import { customerService } from './customer.service'
import { vehicleService } from './vehicle.service'
import { transactionService } from './transaction.service'
import { paymentService } from './payment.service'
import type { PaymentMethod } from '@/types/transaction.types'

export interface MockTransactionSpec {
  regNumber: string
  displayReg: string
  categoryId: string
  categoryName: string
  variant?: string
  model: string
  customerName: string
  customerPhone: string
  servicePackageId: string
  servicePackageName: string
  packageDescription: string
  activities: string[]
  standardPrice: number
  actualPrice: number
  priceAdjustment: number
  adjustmentReason?: string
  paymentMethod: PaymentMethod
  upiRef?: string
}

export const DEMO_TRANSACTION_SPECS: MockTransactionSpec[] = [
  // 1. Hatchback - Swift (Full Wash - UPI)
  {
    regNumber: 'KL07CD4589',
    displayReg: 'KL 07 CD 4589',
    categoryId: 'hatchback_car',
    categoryName: 'Hatchback Car',
    model: 'Maruti Suzuki Swift',
    customerName: 'Anand Verma',
    customerPhone: '9847123456',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 550,
    actualPrice: 550,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-948102384910',
  },
  // 2. Bike - Pulsar (Full Wash - Cash)
  {
    regNumber: 'KL01AB9988',
    displayReg: 'KL 01 AB 9988',
    categoryId: 'bike',
    categoryName: 'Bike',
    model: 'Bajaj Pulsar 150',
    customerName: 'Suresh Kumar',
    customerPhone: '9847234567',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Tyre polishing', 'Engine room cleaning'],
    standardPrice: 250,
    actualPrice: 250,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 3. Auto - 3-Wheeler (Full Wash - UPI)
  {
    regNumber: 'KL07BB3311',
    displayReg: 'KL 07 BB 3311',
    categoryId: 'auto',
    categoryName: 'Auto',
    model: 'Bajaj Compact Auto',
    customerName: 'Manoj K',
    customerPhone: '9847345678',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Tyre polishing'],
    standardPrice: 600,
    actualPrice: 600,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-849201948201',
  },
  // 4. Sedan - City (Body & Vacuum - UPI)
  {
    regNumber: 'KL08CE1024',
    displayReg: 'KL 08 CE 1024',
    categoryId: 'sedan_car',
    categoryName: 'Sedan Car',
    model: 'Honda City',
    customerName: 'Deepa Nair',
    customerPhone: '9847456789',
    servicePackageId: 'body_vacuum',
    servicePackageName: 'Body & Vacuum',
    packageDescription: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing'],
    standardPrice: 450,
    actualPrice: 450,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-748291039482',
  },
  // 5. Compact SUV - Creta (Full Wash - UPI)
  {
    regNumber: 'KL01AZ7777',
    displayReg: 'KL 01 AZ 7777',
    categoryId: 'compact_suv',
    categoryName: 'Compact SUV',
    model: 'Hyundai Creta',
    customerName: 'Vishnu Prasad',
    customerPhone: '9847567890',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 700,
    actualPrice: 700,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-639102948273',
  },
  // 6. Premium SUV - Fortuner (Full Wash - Cash)
  {
    regNumber: 'KL07CK2020',
    displayReg: 'KL 07 CK 2020',
    categoryId: 'premium_suv',
    categoryName: 'Premium SUV',
    model: 'Toyota Fortuner',
    customerName: 'George Joseph',
    customerPhone: '9847678901',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 900,
    actualPrice: 900,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 7. Bullet - Classic 350 (Full Wash - Cash)
  {
    regNumber: 'KL07BK5544',
    displayReg: 'KL 07 BK 5544',
    categoryId: 'bullet',
    categoryName: 'Bullet',
    model: 'Royal Enfield Classic 350',
    customerName: 'Akhil Raj',
    customerPhone: '9847789012',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Tyre polishing', 'Engine room cleaning'],
    standardPrice: 300,
    actualPrice: 300,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 8. Scooter - Activa (Full Wash - UPI)
  {
    regNumber: 'KL01CA8899',
    displayReg: 'KL 01 CA 8899',
    categoryId: 'scooter',
    categoryName: 'Scooter',
    model: 'Honda Activa 6G',
    customerName: 'Neha Pillai',
    customerPhone: '9847890123',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Tyre polishing'],
    standardPrice: 200,
    actualPrice: 200,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-528192039485',
  },
  // 9. Hatchback - i20 (Body Wash - Cash)
  {
    regNumber: 'KL07CD1122',
    displayReg: 'KL 07 CD 1122',
    categoryId: 'hatchback_car',
    categoryName: 'Hatchback Car',
    model: 'Hyundai i20',
    customerName: 'Arun V',
    customerPhone: '9847901234',
    servicePackageId: 'body_wash',
    servicePackageName: 'Body Wash',
    packageDescription: 'Exterior pressure wash and tyre polishing',
    activities: ['Exterior pressure wash', 'Tyre polishing'],
    standardPrice: 200,
    actualPrice: 200,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 10. Sedan - Verna (Full Wash - UPI)
  {
    regNumber: 'KL08DA3456',
    displayReg: 'KL 08 DA 3456',
    categoryId: 'sedan_car',
    categoryName: 'Sedan Car',
    model: 'Hyundai Verna',
    customerName: 'Harish M',
    customerPhone: '9847012345',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 650,
    actualPrice: 650,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-417283940192',
  },
  // 11. Traveller - 10 Seat (Full Wash - UPI)
  {
    regNumber: 'KL07CN9001',
    displayReg: 'KL 07 CN 9001',
    categoryId: 'traveller',
    categoryName: 'Traveller',
    variant: '10 Seat',
    model: 'Force Traveller 10S',
    customerName: 'Kochi Tours',
    customerPhone: '9847112233',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 1200,
    actualPrice: 1200,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-318294019283',
  },
  // 12. Pickup - Ordinary (Body & Vacuum - Cash)
  {
    regNumber: 'KL01BV6789',
    displayReg: 'KL 01 BV 6789',
    categoryId: 'pickup',
    categoryName: 'Pickup',
    variant: 'Ordinary',
    model: 'Mahindra Bolero Maxi Truck',
    customerName: 'Sabu Thomas',
    customerPhone: '9847223344',
    servicePackageId: 'body_vacuum',
    servicePackageName: 'Body & Vacuum',
    packageDescription: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing'],
    standardPrice: 500,
    actualPrice: 500,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 13. Dost - Bada Dost (Full Wash - UPI)
  {
    regNumber: 'KL07CS4433',
    displayReg: 'KL 07 CS 4433',
    categoryId: 'dost',
    categoryName: 'Dost',
    variant: 'Bada Dost',
    model: 'Ashok Leyland Bada Dost',
    customerName: 'Express Logistics',
    customerPhone: '9847334455',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning'],
    standardPrice: 800,
    actualPrice: 800,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-219384019284',
  },
  // 14. TATA ACE (Full Wash - Cash)
  {
    regNumber: 'KL08EQ5566',
    displayReg: 'KL 08 EQ 5566',
    categoryId: 'tata_ace',
    categoryName: 'TATA ACE',
    model: 'Tata Ace Gold',
    customerName: 'Prakash P',
    customerPhone: '9847445566',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning'],
    standardPrice: 700,
    actualPrice: 700,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 15. Compact SUV - Brezza (Body & Vacuum - UPI)
  {
    regNumber: 'KL07CZ7890',
    displayReg: 'KL 07 CZ 7890',
    categoryId: 'compact_suv',
    categoryName: 'Compact SUV',
    model: 'Maruti Suzuki Brezza',
    customerName: 'Priya Menon',
    customerPhone: '9847556677',
    servicePackageId: 'body_vacuum',
    servicePackageName: 'Body & Vacuum',
    packageDescription: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing'],
    standardPrice: 450,
    actualPrice: 450,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-129485019285',
  },
  // 16. Sedan - Dzire (Body Wash - Cash)
  {
    regNumber: 'KL01CC1234',
    displayReg: 'KL 01 CC 1234',
    categoryId: 'sedan_car',
    categoryName: 'Sedan Car',
    model: 'Maruti Suzuki Dzire',
    customerName: 'Ramesh K',
    customerPhone: '9847667788',
    servicePackageId: 'body_wash',
    servicePackageName: 'Body Wash',
    packageDescription: 'Exterior pressure wash and tyre polishing',
    activities: ['Exterior pressure wash', 'Tyre polishing'],
    standardPrice: 250,
    actualPrice: 250,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 17. Premium SUV - Endeavour (Body & Vacuum - UPI)
  {
    regNumber: 'KL07CX9900',
    displayReg: 'KL 07 CX 9900',
    categoryId: 'premium_suv',
    categoryName: 'Premium SUV',
    model: 'Ford Endeavour',
    customerName: 'Dr. Varghese',
    customerPhone: '9847778899',
    servicePackageId: 'body_vacuum',
    servicePackageName: 'Body & Vacuum',
    packageDescription: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing'],
    standardPrice: 650,
    actualPrice: 650,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-019283746501',
  },
  // 18. Super ACE (Full Wash - Cash)
  {
    regNumber: 'KL08DD4411',
    displayReg: 'KL 08 DD 4411',
    categoryId: 'super_ace',
    categoryName: 'Super ACE',
    model: 'Tata Super Ace Mint',
    customerName: 'Modern Traders',
    customerPhone: '9847889900',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning'],
    standardPrice: 750,
    actualPrice: 750,
    priceAdjustment: 0,
    paymentMethod: 'CASH',
  },
  // 19. Traveller - 14 Seat (Full Wash - UPI)
  {
    regNumber: 'KL07CW8822',
    displayReg: 'KL 07 CW 8822',
    categoryId: 'traveller',
    categoryName: 'Traveller',
    variant: '14 Seat',
    model: 'Force Traveller 14S Luxury',
    customerName: 'Kerala Holidays',
    customerPhone: '9847990011',
    servicePackageId: 'full_wash',
    servicePackageName: 'Full Wash',
    packageDescription: 'Complete comprehensive cleaning including underbody and engine room',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing', 'Underbody cleaning', 'Engine room cleaning'],
    standardPrice: 1500,
    actualPrice: 1500,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-908172635412',
  },
  // 20. Hatchback - Baleno (Body & Vacuum - UPI)
  {
    regNumber: 'KL01CD5500',
    displayReg: 'KL 01 CD 5500',
    categoryId: 'hatchback_car',
    categoryName: 'Hatchback Car',
    model: 'Maruti Suzuki Baleno',
    customerName: 'Santhosh R',
    customerPhone: '9847001122',
    servicePackageId: 'body_vacuum',
    servicePackageName: 'Body & Vacuum',
    packageDescription: 'Exterior body cleaning, interior vacuuming, dashboard and tyre polishing',
    activities: ['Exterior body cleaning', 'Interior vacuuming', 'Dashboard polishing', 'Tyre polishing'],
    standardPrice: 350,
    actualPrice: 350,
    priceAdjustment: 0,
    paymentMethod: 'UPI',
    upiRef: 'UPI-807162534123',
  },
]

export const mockDataService = {
  /**
   * Generates 20 completed transactions for today with realistic customer,
   * vehicle, pricing, and payment records.
   */
  async generateDemoSalesData(
    staff: { staffId: string; staffName: string; staffEmail: string },
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: boolean; createdCount: number; totalSales: number; message: string }> {
    const total = DEMO_TRANSACTION_SPECS.length
    let createdCount = 0
    let totalSales = 0

    for (let i = 0; i < total; i++) {
      const spec = DEMO_TRANSACTION_SPECS[i]
      if (onProgress) onProgress(i + 1, total)

      try {
        // 1. Ensure Customer exists
        let customer = await customerService.findCustomerByPhone(spec.customerPhone)
        if (!customer) {
          customer = await customerService.createCustomer({
            name: spec.customerName,
            phoneNumber: spec.customerPhone,
          })
        }

        // 2. Ensure Vehicle exists
        let vehicle = await vehicleService.getVehicleByRegistration(spec.regNumber)
        if (!vehicle) {
          vehicle = await vehicleService.createVehicle({
            registrationNumber: spec.regNumber,
            categoryId: spec.categoryId,
            variant: spec.variant,
            model: spec.model,
            customerId: customer.id,
          })
        } else if (vehicle.customerId !== customer.id) {
          await vehicleService.updateVehicle(vehicle.id, { customerId: customer.id })
        }

        // 3. Create Transaction with authoritative snapshots
        const tx = await transactionService.createTransaction({
          vehicleSnapshot: {
            vehicleId: vehicle.id,
            registrationNumber: vehicle.registrationNumber,
            displayRegistrationNumber: vehicle.displayRegistrationNumber,
            categoryId: vehicle.categoryId,
            categoryName: spec.categoryName,
            variant: vehicle.variant,
            model: vehicle.model,
          },
          customerSnapshot: {
            customerId: customer.id,
            name: customer.name,
            phoneNumber: customer.phoneNumber,
          },
          servicePackageSnapshot: {
            servicePackageId: spec.servicePackageId,
            name: spec.servicePackageName,
            description: spec.packageDescription,
            activities: spec.activities,
          },
          pricingSnapshot: {
            standardPrice: spec.standardPrice,
            actualPrice: spec.actualPrice,
            priceAdjustment: spec.priceAdjustment,
            adjustmentReason: spec.adjustmentReason,
          },
          staffSnapshot: {
            staffId: staff.staffId,
            staffName: staff.staffName,
            staffEmail: staff.staffEmail,
          },
        })

        // 4. Complete Payment atomically
        await paymentService.processPayment({
          transactionId: tx.id,
          paymentMethod: spec.paymentMethod,
          amount: spec.actualPrice,
          upiReferenceNumber: spec.upiRef,
          staffId: staff.staffId,
          staffName: staff.staffName,
        })

        createdCount++
        totalSales += spec.actualPrice
      } catch (err) {
        console.warn(`Failed creating mock item #${i + 1} (${spec.regNumber}):`, err)
      }
    }

    return {
      success: createdCount > 0,
      createdCount,
      totalSales,
      message: `Successfully generated ${createdCount} completed transactions totaling ₹${totalSales.toLocaleString('en-IN')}`,
    }
  },
}
