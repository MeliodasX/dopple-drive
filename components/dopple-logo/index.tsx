import React from 'react'
import { Cloud, FileText } from 'lucide-react'

export const DoppleLogo = ({
  size = 'large'
}: {
  size?: 'small' | 'medium' | 'large'
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Cloud
          className={`${sizeClasses[size]} fill-blue-100 text-blue-500`}
          strokeWidth={1.5}
        />
        <FileText
          className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform text-blue-700"
          strokeWidth={2}
        />
      </div>
      <div className="flex flex-row gap-x-1">
        <span
          className={`font-bold text-white ${textSizes[size]} leading-tight`}
        >
          Dopple
        </span>
        <span
          className={`font-semibold text-blue-500 ${textSizes[size]} leading-tight`}
        >
          Drive
        </span>
      </div>
    </div>
  )
}
