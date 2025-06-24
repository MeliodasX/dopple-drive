'use client'

import { createContext, type ReactNode, useContext, useRef } from 'react'
import { useStore } from 'zustand'

import { createDoppleStore, type DoppleStore } from '@/stores/dopple-store'

export type DoppleStoreApi = ReturnType<typeof createDoppleStore>

export const DoppleStoreContext = createContext<DoppleStoreApi | undefined>(
  undefined
)

export interface DoppleStoreProviderProps {
  children: ReactNode
}

export const DoppleStoreProvider = ({ children }: DoppleStoreProviderProps) => {
  const storeRef = useRef<DoppleStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createDoppleStore()
  }

  return (
    <DoppleStoreContext.Provider value={storeRef.current}>
      {children}
    </DoppleStoreContext.Provider>
  )
}

export const useDoppleStore = <T,>(selector: (store: DoppleStore) => T): T => {
  const doppleStoreContext = useContext(DoppleStoreContext)

  if (!doppleStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`)
  }

  return useStore(doppleStoreContext, selector)
}
