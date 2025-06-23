'use client'

import type React from 'react'

import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  XCircle
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
}

export interface LoadingToastOptions extends Omit<ToastOptions, 'action'> {
  loadingText?: string
}

const variantStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
  loading: 'text-slate-400'
}

const ToastContent = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium text-slate-100">{message}</span>
    </div>
  )
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(<ToastContent message={message} />, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick
          }
        : undefined,
      position: options?.position,
      className: 'border-green-500/50 bg-green-950/90 backdrop-blur-sm',
      icon: (
        <span className={variantStyles['success']}>
          {<CheckCircle className="h-5 w-5" />}
        </span>
      )
    })
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(<ToastContent message={message} />, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick
          }
        : undefined,
      position: options?.position,
      className: 'border-red-500/50 bg-red-950/90 backdrop-blur-sm',
      icon: (
        <span className={variantStyles['error']}>
          {<XCircle className="h-5 w-5" />}
        </span>
      )
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(<ToastContent message={message} />, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick
          }
        : undefined,
      position: options?.position,
      className: 'border-yellow-500/50 bg-yellow-950/90 backdrop-blur-sm',
      icon: (
        <span className={variantStyles['warning']}>
          {<AlertTriangle className="h-5 w-5" />}
        </span>
      )
    })
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(<ToastContent message={message} />, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick
          }
        : undefined,
      position: options?.position,
      className: 'border-blue-500/50 bg-blue-950/90 backdrop-blur-sm',
      icon: (
        <span className={variantStyles['info']}>
          {<Info className="h-5 w-5" />}
        </span>
      )
    })
  },

  loading: (message: string, options?: LoadingToastOptions) => {
    return sonnerToast.loading(
      <ToastContent message={options?.loadingText || message} />,
      {
        description: options?.description,
        duration: options?.persistent
          ? Number.POSITIVE_INFINITY
          : options?.duration || Number.POSITIVE_INFINITY,
        position: options?.position,
        className: 'border-slate-600/50 bg-slate-800/90 backdrop-blur-sm',
        icon: (
          <span className={variantStyles['loading']}>
            {<Loader2 className="h-5 w-5 animate-spin" />}
          </span>
        )
      }
    )
  }
}

export { sonnerToast }
