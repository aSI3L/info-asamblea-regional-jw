"use client"

import { useEffect } from "react"
import { useCategoryStore } from "@/stores/categoryStore"
import { FirebaseService } from "@/services/firebase"
import { CategoryAdapter } from "@/adapters/categoryAdapter"

export const useCategories = () => {
  const { categories, isLoading, error, setCategories, setLoading, setError, clearError } = useCategoryStore()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      clearError()

      const firebaseCategories = await FirebaseService.getCategories()
      const adaptedCategories = CategoryAdapter.fromFirebaseArray(firebaseCategories)

      setCategories(adaptedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchCategories()
  }

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [])

  return {
    categories,
    isLoading,
    error,
    refetch,
  }
}
