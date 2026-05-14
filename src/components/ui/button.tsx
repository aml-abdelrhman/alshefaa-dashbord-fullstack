import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: {
    startContent?: string
    endContent?: string
  }
  to?: string
}

const buttonVariants = cva(
  "inline-flex items-center min-h-11 justify-center gap-1.5 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow] duration-300 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        'outline-danger':
          'bg-card border border-destructive-foreground shadow-none hover:bg-destructive/70',
        'outline-primary':
          'bg-transparent border border-primary text-primary shadow-none hover:bg-main-100',
        default:
          'bg-primary text-background shadow-none shadow-black/5 hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-none hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-input bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground',
        flat: 'bg-muted shadow-none hover:text-primary',
        secondary: 'bg-card text-primary shadow-none hover:bg-card/80',
        // "bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80",
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary-foreground border-none p-0! rounded-sm underline border-primary-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-7 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-10 text-lg',
        xl: 'h-14 px-12 text-lg',
        icon: 'h-9 w-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  startContent,
  endContent,
  disabled,
  asChild,
  classNames,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin me-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {!isLoading && startContent && (
        <span
          className={cn('size-5 flex items-center', classNames?.startContent)}
        >
          {startContent}
        </span>
      )}
      {children}
      {!isLoading && endContent && (
        <span
          className={cn('size-5 flex items-center', classNames?.endContent)}
        >
          {endContent}
        </span>
      )}
    </Comp>
  )
}

Button.displayName = 'Button'

export { Button, buttonVariants }
