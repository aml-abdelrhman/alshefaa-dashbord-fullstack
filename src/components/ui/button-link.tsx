import * as React from 'react'
import { createLink } from '@tanstack/react-router'
import { Slot } from 'radix-ui'
import { buttonVariants } from './button'
import type { LinkComponent } from '@tanstack/react-router'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * ButtonLink Props Interface
 * Combines all Button props with TanStack Router Link capabilities
 */
export interface ButtonLinkProps
  extends
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a child component using Radix Slot
   * @default false
   */
  asChild?: boolean

  /**
   * Show loading state with spinner
   * @default false
   */
  isLoading?: boolean

  /**
   * Content to display at the start of the button (left in LTR, right in RTL)
   */
  startContent?: React.ReactNode

  /**
   * Content to display at the end of the button (right in LTR, left in RTL)
   */
  endContent?: React.ReactNode

  /**
   * Custom class names for different parts of the button
   */
  classNames?: {
    startContent?: string
    endContent?: string
  }

  /**
   * Disable the button and prevent navigation
   * @default false
   */
  disabled?: boolean
}

/**
 * Base ButtonLink Component
 * Internal component that provides the button styling and behavior
 */
function ButtonLinkComponent({
  className,
  children,
  variant = "default",
  size = "default",
  isLoading = false,
  startContent,
  endContent,
  disabled,
  asChild,
  classNames,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> &
  ButtonLinkProps) {
  const Comp = asChild ? Slot.Root : "button";
    // Handle disabled state by preventing navigation
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      onClick?.(event)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          'pointer-events-none opacity-50': disabled || isLoading,
        })}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        onClick={handleClick}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin me-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
  );
}

ButtonLinkComponent.displayName = 'ButtonLinkComponent'

/**
 * Create the enhanced ButtonLink component with TanStack Router capabilities
 */
const CreatedButtonLink = createLink(ButtonLinkComponent)

/**
 * ButtonLink Component
 *
 * A button component that combines the styling and functionality of the Button component
 * with the routing capabilities of TanStack Router's Link component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ButtonLink to="/profile">Go to Profile</ButtonLink>
 *
 * // With route parameters
 * <ButtonLink
 *   to="/bio-pages/$id"
 *   params={{ id: "123" }}
 *   variant="outline"
 * >
 *   View Bio Page
 * </ButtonLink>
 *
 * // With search parameters
 * <ButtonLink
 *   to="/dashboard"
 *   search={{ tab: "analytics" }}
 *   size="lg"
 * >
 *   Dashboard
 * </ButtonLink>
 *
 * // With loading state
 * <ButtonLink
 *   to="/save"
 *   isLoading={isSaving}
 *   disabled={!canSave}
 * >
 *   Save Changes
 * </ButtonLink>
 *
 * // With start and end content
 * <ButtonLink
 *   to="/create"
 *   startContent={<PlusIcon />}
 *   endContent={<ArrowRightIcon />}
 * >
 *   Create New
 * </ButtonLink>
 * ```
 *
 * @features
 * - ✅ Full TanStack Router Link functionality (to, params, search, etc.)
 * - ✅ All Button component styling and variants
 * - ✅ Loading states with spinner
 * - ✅ Start and end content support
 * - ✅ RTL (Right-to-Left) language support
 * - ✅ Accessibility features (ARIA attributes, keyboard navigation)
 * - ✅ TypeScript type safety for routes and parameters
 * - ✅ Disabled state handling
 * - ✅ Custom styling with Tailwind CSS classes
 *
 * @props
 * - All TanStack Router Link props (to, params, search, hash, state, etc.)
 * - All Button component props (variant, size, isLoading, startContent, endContent, etc.)
 * - Standard HTML anchor element props (className, onClick, etc.)
 */
export const ButtonLink: LinkComponent<typeof ButtonLinkComponent> = (
  props,
) => {
  return (
    <CreatedButtonLink
      preload="intent"
      viewTransition={{ types: ['slide-out-left'] }}
      {...props}
    />
  )
}

// Export the component variants for external use
export { buttonVariants }
