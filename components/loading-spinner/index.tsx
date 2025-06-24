'use client'

import type React from 'react'

import { cn } from '@/lib/utils'
import { Cloud } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'cloud' | 'dots' | 'pulse'
  className?: string
  text?: string
}

export const LoadingSpinner = ({
  size = 'md',
  variant = 'cloud',
  className,
  text
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (variant === 'cloud') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="relative">
          {/* Outer rotating ring */}
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-slate-700 border-t-blue-500',
              sizeClasses[size]
            )}
          />
          {/* Inner cloud icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Cloud
              className={cn(
                'animate-pulse text-blue-400',
                size === 'sm'
                  ? 'h-2 w-2'
                  : size === 'md'
                    ? 'h-3 w-3'
                    : size === 'lg'
                      ? 'h-4 w-4'
                      : 'h-6 w-6'
              )}
              fill="currentColor"
            />
          </div>
        </div>
        {text && (
          <p
            className={cn(
              'animate-pulse font-medium text-slate-400',
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-bounce rounded-full bg-blue-500',
                size === 'sm'
                  ? 'h-2 w-2'
                  : size === 'md'
                    ? 'h-3 w-3'
                    : size === 'lg'
                      ? 'h-4 w-4'
                      : 'h-5 w-5'
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        {text && (
          <p
            className={cn('font-medium text-slate-400', textSizeClasses[size])}
          >
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="relative">
          {/* Pulsing circles */}
          <div
            className={cn(
              'absolute animate-ping rounded-full bg-blue-500/20',
              sizeClasses[size]
            )}
          />
          <div
            className={cn(
              'absolute animate-ping rounded-full bg-blue-500/40',
              sizeClasses[size]
            )}
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className={cn(
              'animate-pulse rounded-full bg-blue-500',
              sizeClasses[size]
            )}
          />
        </div>
        {text && (
          <p
            className={cn(
              'animate-pulse font-medium text-slate-400',
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-700 border-t-blue-500',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn('font-medium text-slate-400', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}
