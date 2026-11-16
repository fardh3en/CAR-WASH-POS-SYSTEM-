import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'lime'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-black uppercase tracking-wider transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
          {
            // Variants
            'bg-[#0E120A] text-[#D3FA2E] hover:bg-[#1a2014] border border-[#0E120A]': variant === 'default',
            'bg-white text-[#0E120A] border border-[#0E120A] hover:bg-[#0E120A] hover:text-[#D3FA2E]': variant === 'outline',
            'bg-transparent text-[#0E120A] hover:bg-[#F4F5EF] border-transparent': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 border border-red-600': variant === 'destructive',
            'bg-[#D3FA2E] text-[#0E120A] border-2 border-[#0E120A] hover:bg-[#c6f01a]': variant === 'lime',
            // Sizes
            'h-10 px-5 py-2 text-xs': size === 'default',
            'h-8 px-3 text-[11px]': size === 'sm',
            'h-12 px-8 text-sm': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
