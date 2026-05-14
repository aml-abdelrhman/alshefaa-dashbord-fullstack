import * as React from 'react'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
} from '@hugeicons/core-free-icons'
import { type LinkProps } from '@tanstack/react-router'
import Link from '@/components/common/link'

function Breadcrumb({
  className,
  children,
  ...props
}: React.ComponentProps<'nav'>) {
  const childrenArray = React.Children.toArray(children).filter(
    (child) => child !== null && child !== undefined,
  )

  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    >
      <BreadcrumbList>
        {childrenArray.map((child, index) => {
          const isLast = index === childrenArray.length - 1

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem
                className={cn(
                  isLast ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {child}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </nav>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-muted-foreground gap-1.5 text-sm flex flex-wrap items-center wrap-break-word',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('gap-1 inline-flex items-center', className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> &
  LinkProps & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : Link

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={2}
          className="rtl:rotate-180"
        />
      )}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'size-5 [&>svg]:size-4 flex items-center justify-center',
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
