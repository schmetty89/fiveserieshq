import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] active:scale-[0.98]': variant === 'primary',
            'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-[0.98]': variant === 'secondary',
            'bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-[0.98]': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]': variant === 'danger',
          },
          {
            'text-xs px-3 py-1.5': size === 'sm',
            'text-sm px-4 py-2': size === 'md',
            'text-base px-5 py-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
