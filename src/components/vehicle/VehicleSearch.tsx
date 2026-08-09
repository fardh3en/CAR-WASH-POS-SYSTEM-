import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { normalizeRegistrationNumber, formatRegistrationNumber } from '@/utils/vehicle.utils'

interface VehicleSearchProps {
  onSearchSubmit: (normalizedRegNumber: string) => void
  loading?: boolean
}

export function VehicleSearch({ onSearchSubmit, loading }: VehicleSearchProps) {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Local input handling - NO database lookups while typing
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = normalizeRegistrationNumber(inputValue)
    if (!normalized) return

    // Format input text nicely in UI and trigger exactly ONE search query
    setInputValue(formatRegistrationNumber(normalized))
    onSearchSubmit(normalized)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="regInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
        Vehicle Registration Number <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            id="regInput"
            type="text"
            placeholder="e.g. KL 01 AB 1234"
            className="pl-9 text-base font-semibold tracking-wider uppercase h-11"
            value={inputValue}
            onChange={handleInputChange}
            disabled={loading}
            autoFocus
          />
        </div>
        <Button type="submit" variant="default" className="h-11 px-6 font-semibold" disabled={loading || !inputValue.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Enter vehicle number and tap Search to identify existing history or register a new vehicle.
      </p>
    </form>
  )
}
