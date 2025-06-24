import { createStore } from 'zustand/vanilla'

export type DoppleState = {
  currentDirectoryId: number | null
}

export type DoppleActions = {
  setCurrentDirectoryId: (id: number | null) => void
}

export type DoppleStore = DoppleState & DoppleActions

export const defaultInitState: DoppleState = {
  currentDirectoryId: null
}

export const createDoppleStore = (
  initState: DoppleState = defaultInitState
) => {
  return createStore<DoppleStore>()((set) => ({
    ...initState,
    setCurrentDirectoryId: (id: number | null) =>
      set(() => ({ currentDirectoryId: id }))
  }))
}
