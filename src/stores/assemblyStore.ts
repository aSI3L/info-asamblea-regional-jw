import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { AssemblyInfo } from "@/types"

interface AssemblyState {
  assemblyInfo: AssemblyInfo | null
  isLoading: boolean
  error: string | null

  // Actions
  setAssemblyInfo: (info: AssemblyInfo) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAssemblyStore = create<AssemblyState>()(
  devtools(
    persist(
      (set) => ({
        assemblyInfo: null,
        isLoading: false,
        error: null,

        setAssemblyInfo: (info) => set({ assemblyInfo: info }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: "assembly-store",
      },
    ),
    {
      name: "assembly-store",
    },
  ),
)
