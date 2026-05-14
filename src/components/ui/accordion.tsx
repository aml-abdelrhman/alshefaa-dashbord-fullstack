import * as React from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { AddIcon, RemoveIcon } from '@hugeicons/core-free-icons'

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col my-3', className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'not-last:border-b data-open:bg-muted border-b border-border bg-background rounded-3xl px-5 py-3',
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground py-2.5 text-start font-medium hover:underline focus-visible:ring-3 **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative data-[state=open]:border-b-2 border-dashed border-b-muted-foreground/20 flex flex-1 items-center data-[state=closed]:gap-3 data-[state=open]:justify-between transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <div className="bg-muted size-9 rounded-full items-center justify-center flex shrink-0 group-aria-expanded/accordion-trigger:hidden">
          <HugeiconsIcon
            icon={AddIcon}
            strokeWidth={5}
            data-slot="accordion-trigger-icon"
            className="pointer-events-none shrink-0"
          />
        </div>

        {children}
        <div className="bg-primary size-9 rounded-full hidden shrink-0 group-aria-expanded/accordion-trigger:flex items-center justify-center">
          <HugeiconsIcon
            icon={RemoveIcon}
            strokeWidth={5}
            data-slot="accordion-trigger-icon"
            className="pointer-events-none text-background!"
          />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up text-sm overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          'py-6.5 [&_a]:hover:text-foreground h-(--radix-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
