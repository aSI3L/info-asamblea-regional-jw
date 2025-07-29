"use client"

import { useState } from "react"
import { GoogleMapsService } from "@/services/googleMaps"
import { SEARCH_CONFIG } from "@/constants/search"
import type { GoogleMapsLocation } from "@/types"

export const useGoogleMaps = () => {
  const [locations, setLocations] = useState<GoogleMapsLocation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actualRadius, setActualRadius] = useState<number | null>(null) // Radio efectivo usado

  const searchPlaces = async (
    query: string, 
    location?: { lat: number; lng: number }, 
    radius: number = SEARCH_CONFIG.DEFAULT_RADIUS
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      setActualRadius(null)

      // Si no tenemos ubicación, hacer búsqueda general
      if (!location) {
        const results = await GoogleMapsService.searchPlaces(query)
        setLocations(results)
        return { results, radius: null }
      }

      // Búsqueda progresiva con radios incrementales
      for (const searchRadius of SEARCH_CONFIG.PROGRESSIVE_RADII) {
        // Solo buscar en radios >= al solicitado
        if (searchRadius < radius) continue
        
        const results = await GoogleMapsService.searchPlaces(query, location, searchRadius)
        
        if (results.length > 0) {
          setLocations(results)
          setActualRadius(searchRadius)
          return { results, radius: searchRadius }
        }
      }

      // Si no se encontró nada en ningún radio
      setLocations([])
      setActualRadius(SEARCH_CONFIG.MAX_RADIUS)
      return { results: [], radius: SEARCH_CONFIG.MAX_RADIUS }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      return { results: [], radius: null }
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
    actualRadius,
    searchPlaces,
    getPlaceDetails,
  }
}
