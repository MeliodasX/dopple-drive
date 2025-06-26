import { createStore } from 'zustand/vanilla'

export type DoppleState = {
  currentDirectoryId: number | null
  disableDropzone: boolean
}

export type DoppleActions = {
  setCurrentDirectoryId: (id: number | null) => void
  setDisableDropzone: (disableDropzone: boolean) => void
}

export type DoppleStore = DoppleState & DoppleActions

export const defaultInitState: DoppleState = {
  currentDirectoryId: null,
  disableDropzone: false
}

export const createDoppleStore = (
  initState: DoppleState = defaultInitState
) => {
  return createStore<DoppleStore>()((set) => ({
    ...initState,
    setCurrentDirectoryId: (id: number | null) =>
      set(() => ({ currentDirectoryId: id })),
    setDisableDropzone: (disableDropzone: boolean) =>
      set(() => ({ disableDropzone }))
  }))
}
