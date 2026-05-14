import React from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Alert01Icon } from '@hugeicons/core-free-icons'

import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useTranslation } from 'react-i18next'

interface ActionConfirmationDialogProps {
  title?: string
  description?: string
  action: () => void
  children: ReactNode
  asChild?: boolean
  className?: string
  confirmText?: string
  cancelText?: string
  icon?: IconSvgElement
}

const ActionConfirmationDialog: React.FC<ActionConfirmationDialogProps> = ({
  title = 'Are You sure',
  description = 'This action can not be undone',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = Alert01Icon,
  action,
  children,
  asChild,
  className,
}) => {
  const { t, i18n } = useTranslation()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild} className={className}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent
        className="p-6 sm:max-w-md! rounded-4xl border-none bg-muted"
        aria-describedby="action-confirmation-description"
      >
        <AlertDialogHeader
          className="gap-5 place-items-center! text-center"
          dir={i18n.dir()}
        >
          <div className="flex flex-col items-center gap-5">
            <AlertDialogMedia className="relative flex items-center justify-center size-17 sm:size-23 rounded-full bg-destructive text-white shadow-[0_0_0_6px_theme(colors.gray.800),0_0_0_12px_theme(colors.destructive)]">
              <HugeiconsIcon icon={icon} className="size-11 sm:size-15" />
            </AlertDialogMedia>
            <AlertDialogTitle>{t(title)}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription id="action-confirmation-description">
              {t(description)}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex! flex-col! gap-4 border-none">
          <AlertDialogAction size="lg" onClick={action} variant="destructive">
            {t(confirmText)}
          </AlertDialogAction>
          <AlertDialogCancel
            size="lg"
            variant="flat"
            className="border-none"
          >
            {t(cancelText)}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ActionConfirmationDialog
