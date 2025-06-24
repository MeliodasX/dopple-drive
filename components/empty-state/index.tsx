'use client'

import React from 'react'

import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Cloud,
  FileX,
  FolderOpen,
  Inbox,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'folder' | 'files' | 'inbox' | 'error'
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function isCloneableWithClassName(
  element: React.ReactNode
): element is React.ReactElement<{ className?: string }> {
  return React.isValidElement(element) && 'className' in (element as any).props
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className,
  size = 'md'
}: EmptyStateProps) {
  const getVariantContent = () => {
    switch (variant) {
      case 'search':
        return {
          icon: <Search className="h-16 w-16 text-slate-600" />,
          title: 'No results found',
          description: 'Try adjusting your search terms or filters'
        }
      case 'folder':
        return {
          icon: <FolderOpen className="h-16 w-16 text-slate-600" />,
          title: 'This folder is empty',
          description: 'Upload files or create folders to get started'
        }
      case 'files':
        return {
          icon: <FileX className="h-16 w-16 text-slate-600" />,
          title: 'No files yet',
          description: 'Your files will appear here once you upload them'
        }
      case 'inbox':
        return {
          icon: <Inbox className="h-16 w-16 text-slate-600" />,
          title: 'All caught up',
          description: 'No new items to review'
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-500" />,
          title: 'Something went wrong',
          description: "We couldn't load your content. Please try again."
        }
      default:
        return {
          icon: <Cloud className="h-16 w-16 text-slate-600" />,
          title: 'Nothing to Show',
          description: "There's no content available at the moment"
        }
    }
  }

  const variantContent = getVariantContent()
  const finalTitle = title || variantContent.title
  const finalDescription = description || variantContent.description
  const finalIcon = icon || variantContent.icon

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'py-8',
      icon: 'mb-3',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-2'
    },
    md: {
      container: 'py-12',
      icon: 'mb-4',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-3'
    },
    lg: {
      container: 'py-16',
      icon: 'mb-6',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-4'
    }
  }

  const config = sizeConfig[size]

  return (
    <div
      className={cn(
        'flex h-full min-h-[200px] w-full flex-col items-center justify-center text-center',
        config.container,
        className
      )}
    >
      <div className={cn('flex flex-col items-center', config.spacing)}>
        <div className={cn('flex items-center justify-center', config.icon)}>
          {isCloneableWithClassName(finalIcon)
            ? React.cloneElement(finalIcon, {
                className: cn(
                  finalIcon.props.className,
                  size === 'sm'
                    ? 'h-12 w-12'
                    : size === 'lg'
                      ? 'h-20 w-20'
                      : 'h-16 w-16'
                )
              })
            : finalIcon}
        </div>

        <div className={config.spacing}>
          <h3 className={cn('font-semibold text-slate-300', config.title)}>
            {finalTitle}
          </h3>
          {finalDescription && (
            <p
              className={cn(
                'mx-auto max-w-md text-slate-500',
                config.description
              )}
            >
              {finalDescription}
            </p>
          )}
        </div>

        {action && (
          <div className="mt-6">
            <Button
              onClick={action.onClick}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
