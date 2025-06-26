import { createStore } from 'zustand/vanilla'

export type DoppleState = {
  currentDirectoryId: number | null
  disableDropzone: boolean
  selectedItemId: number | null
}

export type DoppleActions = {
  setCurrentDirectoryId: (id: number | null) => void
  setDisableDropzone: (disableDropzone: boolean) => void
  setSelectedItemId: (id: number | null) => void
}

export type DoppleStore = DoppleState & DoppleActions

export const defaultInitState: DoppleState = {
  currentDirectoryId: null,
  disableDropzone: false,
  selectedItemId: null
}

export const createDoppleStore = (
  initState: DoppleState = defaultInitState
) => {
  return createStore<DoppleStore>()((set) => ({
    ...initState,
    setCurrentDirectoryId: (id: number | null) =>
      set(() => ({ currentDirectoryId: id })),
    setDisableDropzone: (disableDropzone: boolean) =>
      set(() => ({ disableDropzone })),
    setSelectedItemId: (id: number | null) =>
      set(() => ({ selectedItemId: id }))
  }))
}
