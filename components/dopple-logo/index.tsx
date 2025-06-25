import { Cloud } from 'lucide-react'

export const DoppleLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Cloud className="h-8 w-8 text-blue-500" fill="currentColor" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-700 opacity-60" />
      </div>
      <h1 className="hidden text-xl font-semibold text-slate-100 sm:block">
        Dopple Drive
      </h1>
    </div>
  )
}
