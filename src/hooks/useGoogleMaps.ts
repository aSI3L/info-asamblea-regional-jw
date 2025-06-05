"use client"

import { useState } from "react"
import { GoogleMapsService } from "@/services/googleMaps"
import type { GoogleMapsLocation } from "@/types"

export const useGoogleMaps = () => {
  const [locations, setLocations] = useState<GoogleMapsLocation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPlaces = async (query: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const results = await GoogleMapsService.searchPlaces(query)
      setLocations(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getPlaceDetails = async (placeId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const details = await GoogleMapsService.getPlaceDetails(placeId)
      return details
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    locations,
    isLoading,
    error,
    searchPlaces,
    getPlaceDetails,
  }
}
