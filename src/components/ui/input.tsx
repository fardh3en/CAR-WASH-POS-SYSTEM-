import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full border border-[#0E120A] bg-[#F4F5EF] px-4 py-2 text-sm font-semibold text-[#0E120A] placeholder:text-[#987E63] placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3FA2E] focus-visible:border-[#0E120A] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
