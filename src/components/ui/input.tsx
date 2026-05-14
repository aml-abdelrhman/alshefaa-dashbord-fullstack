import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label as ShadLabel } from '@/components/ui/label'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  type?: string
  label?: string
  showContentDivider?: boolean
  animatedLabel?: boolean
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  description?: React.ReactNode
  required?: boolean
  isLoading?: boolean
  classNames?: {
    startContent?: string
    endContent?: string
    description?: string
    label?: string
    wrapper?: string
    main?: string
  }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      startContent,
      label,
      endContent,
      isLoading,
      description,
      required,
      // alignToRight,
      animatedLabel = false,
      showContentDivider = true,
      classNames,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('rtl:text-right w-full', classNames?.main)}>
        {label && !animatedLabel && (
          <ShadLabel className={cn('text-base text-muted-foreground', classNames?.label, props?.['aria-invalid'] && 'text-destructive')}>
            {label} {required && <span className="text-red-600">*</span>}
          </ShadLabel>
        )}
        <div
          className={cn(
            'flex items-center relative border-b border-border bg-background rounded-full px-2',
            classNames?.wrapper,
            label ? 'mt-3' : '',
            props?.['aria-invalid'] && 'border-destructive',
          )}
        >
          {startContent && (
            <div
              className={cn('flex items-center ms-3', classNames?.startContent)}
            >
              {startContent}
              {showContentDivider && (
                <div className="h-7 w-px bg-gray-300 ms-3" />
              )}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            id="animated"
            data-slot="input"
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground/50 flex h-13 focus:border-main-500 focus:ring-main-500 w-full min-w-0 rounded-full bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              // 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              type === 'search' &&
                '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
              type === 'file' &&
                'text-muted-foreground/70 file:text-foreground p-0 pe-3 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic',
              className,
              animatedLabel &&
                'peer placeholder:text-transparent focus:placeholder:text-muted-foreground/50 pt-3.5!',
            )}
            {...props}
          />{' '}
          {label && animatedLabel && (
            <ShadLabel
              htmlFor="animated"
              className={cn(
                props?.['aria-invalid']
                  ? 'text-destructive animate-pulse'
                  : 'text-[#A7A7A7] dark:text-[#666666]',
                'text-xs absolute start-3 top-3 transition-all peer-placeholder-shown:top-[35%] peer-focus:top-[5%]',
                classNames?.label,
                (startContent || endContent) && 'start-15',
                'peer-[&:not(:placeholder-shown)]:top-0.5 peer-[&:not(:placeholder-shown)]:text-sm',
              )}
            >
              {label} {required && <span className="text-red-600">*</span>}
            </ShadLabel>
          )}
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
          {!isLoading && endContent && (
            <div
              className={cn('flex items-center me-3 text-muted-foreground', classNames?.endContent)}
            >
              {endContent}
            </div>
          )}
        </div>
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
