'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <div className="mx-4 max-w-2xl flex-1 lg:mx-8">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
        <Input
          placeholder="Search in Dopple"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-slate-700 bg-slate-800 pl-10 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>
    </div>
  )
}
