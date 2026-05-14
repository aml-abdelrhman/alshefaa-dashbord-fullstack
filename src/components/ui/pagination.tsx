import * as React from 'react'

import { cn } from '@/lib/utils'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li {...props} />
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden="true" className={cn(className)} {...props}>
      Previous
    </span>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden="true" className={cn(className)} {...props}>
      Next
    </span>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      ...
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
}
