'use client'

import type React from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  className?: string
}

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  showCloseButton = true
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className={cn(
        className,
        'fixed inset-0 z-50 flex items-center justify-center p-4'
      )}
    >
      <div
        className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} animate-in zoom-in-95 fade-in flex max-h-[90vh] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-100">
            {title}
          </h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close modal</span>
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export const ModalBody = ({ children, className = '' }: ModalBodyProps) => {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export const ModalFooter = ({ children, className = '' }: ModalFooterProps) => {
  return (
    <div
      className={`flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/50 p-6 ${className}`}
    >
      {children}
    </div>
  )
}
