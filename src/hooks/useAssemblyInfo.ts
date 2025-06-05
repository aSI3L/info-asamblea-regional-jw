"use client"

import { useEffect } from "react"
import { useAssemblyStore } from "@/stores/assemblyStore"
import { FirebaseService } from "@/services/firebase"
import { AssemblyAdapter } from "@/adapters/assemblyAdapter"

export const useAssemblyInfo = () => {
  const { assemblyInfo, isLoading, error, setAssemblyInfo, setLoading, setError, clearError } = useAssemblyStore()

  const fetchAssemblyInfo = async () => {
    try {
      setLoading(true)
      clearError()

      const firebaseAssembly = await FirebaseService.getAssemblyInfo()
      const adaptedAssembly = AssemblyAdapter.fromFirebase(firebaseAssembly)

      setAssemblyInfo(adaptedAssembly)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchAssemblyInfo()
  }

  useEffect(() => {
    if (!assemblyInfo) {
      fetchAssemblyInfo()
    }
  }, [])

  return {
    assemblyInfo,
    isLoading,
    error,
    refetch,
  }
}
