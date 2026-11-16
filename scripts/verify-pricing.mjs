// Independent verification script for Mr. Wash Official Pricing Matrix
const categories = [
  { id: 'hatchback_car', name: 'Hatchback Car' },
  { id: 'sedan_car', name: 'Sedan Car' },
  { id: 'compact_suv', name: 'Compact SUV' },
  { id: 'suv', name: 'SUV' }, // Unconfigured
  { id: 'premium_suv', name: 'Premium SUV' },
  { id: 'scooter', name: 'Scooter' },
  { id: 'bike', name: 'Bike' },
  { id: 'bullet', name: 'Bullet' },
  { id: 'superbike', name: 'Superbike' }, // Unconfigured
  { id: 'auto', name: 'Auto' },
  { id: 'traveller', name: 'Traveller', variants: ['10 Seat', '14 Seat', '17 Seat'] },
  { id: 'pickup', name: 'Pickup', variants: ['Ordinary', 'Long Chassis'] },
  { id: 'dost', name: 'Dost', variants: ['Ordinary', 'Bada Dost'] },
  { id: 'tata_ace', name: 'TATA ACE' },
  { id: 'super_ace', name: 'Super ACE' },
];

const packages = [
  { id: 'body_wash', name: 'Body Wash' },
  { id: 'body_vacuum', name: 'Body & Vacuum' },
  { id: 'full_wash', name: 'Full Wash' },
];

function generatePricingRuleId(categoryId, servicePackageId, variant) {
  const cleanCat = categoryId.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanPkg = servicePackageId.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (variant && variant.trim() !== '') {
    const cleanVar = variant.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${cleanCat}_${cleanVar}_${cleanPkg}`;
  }
  return `${cleanCat}_${cleanPkg}`;
}

const OFFICIAL_MR_WASH_PRICING = [
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

  // 5. Scooter
  { categoryId: 'scooter', servicePackageId: 'full_wash', price: 200 },

  // 6. Bike
  { categoryId: 'bike', servicePackageId: 'full_wash', price: 250 },

  // 7. Bullet
  { categoryId: 'bullet', servicePackageId: 'full_wash', price: 300 },

  // 8. Auto
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
];

// Build all 19 rows
const rows = [];
categories.forEach(cat => {
  if (cat.variants && cat.variants.length > 0) {
    cat.variants.forEach(v => {
      rows.push({
        categoryId: cat.id,
        categoryName: cat.name,
        variant: v,
        displayName: `${cat.name} (${v})`
      });
    });
  } else {
    rows.push({
      categoryId: cat.id,
      categoryName: cat.name,
      displayName: cat.name
    });
  }
});

console.log(`Total matrix rows: ${rows.length} (Expected: 19)`);
console.log(`Total packages: ${packages.length} (Expected: 3)`);
console.log(`Total combinations: ${rows.length * packages.length} (Expected: 57)`);

const ruleMap = new Map();
for (const item of OFFICIAL_MR_WASH_PRICING) {
  const ruleId = generatePricingRuleId(item.categoryId, item.servicePackageId, item.variant);
  ruleMap.set(ruleId, item.price);
}

console.log(`\nConfigured rules count: ${ruleMap.size} (Expected: 43)`);

const configuredList = [];
const unavailableList = [];

for (const row of rows) {
  for (const pkg of packages) {
    const ruleId = generatePricingRuleId(row.categoryId, pkg.id, row.variant);
    if (ruleMap.has(ruleId)) {
      configuredList.push({
        displayName: row.displayName,
        package: pkg.name,
        ruleId,
        price: ruleMap.get(ruleId)
      });
    } else {
      unavailableList.push({
        displayName: row.displayName,
        package: pkg.name,
        ruleId,
        isExplicitUnconfiguredCategory: row.categoryId === 'suv' || row.categoryId === 'superbike'
      });
    }
  }
}

console.log(`\n--- Verification Results ---`);
console.log(`Configured combinations: ${configuredList.length} (Expected: 43)`);
console.log(`Unavailable combinations: ${unavailableList.length} (Expected: 14)`);

const suvRules = configuredList.filter(r => r.ruleId.startsWith('suv_'));
const superbikeRules = configuredList.filter(r => r.ruleId.startsWith('superbike_'));
console.log(`SUV configured rules: ${suvRules.length} (Expected: 0)`);
console.log(`Superbike configured rules: ${superbikeRules.length} (Expected: 0)`);

const zeroPriceRules = configuredList.filter(r => r.price <= 0);
console.log(`Zero or negative price rules: ${zeroPriceRules.length} (Expected: 0)`);

console.log('\n--- Unavailable Combinations Detail (14 total) ---');
unavailableList.forEach((u, i) => {
  console.log(`${i+1}. ${u.displayName} -> ${u.package} (ruleId: ${u.ruleId}) [${u.isExplicitUnconfiguredCategory ? 'Explicit Unconfigured Category' : 'Unavailable Service'}]`);
});
