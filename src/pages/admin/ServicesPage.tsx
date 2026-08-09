import { useState, useEffect } from 'react'
import type { ServicePackage } from '@/types/service.types'
import { servicePackageService } from '@/services/servicePackage.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export function AdminServicesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function load() {
      try {
        const pkgs = await servicePackageService.getServicePackages()
        setPackages(pkgs)
      } catch (err) {
        console.error('Failed to load service packages:', err)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Standard Service Packages</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Approved business service packages and included activity definitions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
            Loading service packages...
          </div>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col justify-between border-[hsl(var(--border))]">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                      {pkg.name}
                    </CardTitle>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <CardDescription className="text-xs">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                    Included Activities ({pkg.activities.length}):
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {pkg.activities.map((act) => (
                      <li key={act} className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
