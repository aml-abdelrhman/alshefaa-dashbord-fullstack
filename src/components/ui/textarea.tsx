import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label as ShadLabel } from '@/components/ui/label'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  label?: string
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

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      startContent,
      label,
      endContent,
      isLoading,
      description,
      required,
      animatedLabel = true,
      classNames,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('rtl:text-right w-full', classNames?.main)}>
        {label && !animatedLabel && (
          <ShadLabel className={cn('text-sm', classNames?.label)}>
            {label} {required && <span className="text-red-600">*</span>}
          </ShadLabel>
        )}
        <div
          className={cn(
            'flex items-center relative bg-background rounded-xl',
            classNames?.wrapper,
            label ? 'mt-2' : '',
            props?.['aria-invalid'] && 'border-destructive',
          )}
        >
          {startContent && (
            <div
              className={cn('flex items-center ms-3', classNames?.startContent)}
            >
              {startContent}
              <div className="h-7 w-px bg-gray-300 ms-3" />
            </div>
          )}
          <textarea
            ref={ref}
            data-slot="textarea"
            className={cn(
              'border-input placeholder:text-muted-foreground/70 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-19.5 w-full rounded-xl bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
              className,
              animatedLabel &&
                'peer placeholder:text-transparent focus:placeholder:text-muted-foreground/70 !pt-5',
            )}
            {...props}
          />
          {label && animatedLabel && (
            <ShadLabel
              htmlFor="animated"
              className={cn(
                'text-xs absolute start-3 top-3 transition-all peer-placeholder-shown:top-[35%] peer-focus:top-[5%]',
                classNames?.label,
                (startContent || endContent) && 'start-15',
                'peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-sm',
                props?.['aria-invalid']
                  ? 'text-destructive animate-pulse'
                  : 'text-[#A7A7A7] dark:text-[#666666]',
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
              className={cn('flex items-center me-3', classNames?.endContent)}
            >
              {endContent}
            </div>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
