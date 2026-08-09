import { useState, useEffect } from 'react'
import type { VehicleCategory } from '@/types/vehicle.types'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Car } from 'lucide-react'

export function AdminVehiclesPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await vehicleCategoryService.getVehicleCategories()
        setCategories(list)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Categories & Foundation</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Approved business vehicle classification seed list (Phase 3 Foundation)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-[hsl(var(--primary))]" />
            Practical Vehicle Categories ({categories.length})
          </CardTitle>
          <CardDescription>
            Configurable category seed data loaded from Firestore. Full Admin Category CRUD UI will be enabled in the configuration phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading categories...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{cat.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                      #{cat.displayOrder}
                    </span>
                  </div>
                  {cat.variants && cat.variants.length > 0 && (
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      Variants: {cat.variants.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
