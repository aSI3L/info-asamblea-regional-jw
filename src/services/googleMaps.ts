import type { GoogleMapsLocation } from "@/types"

export class GoogleMapsService {
  static async searchPlaces(
    query: string, 
    location?: { lat: number; lng: number }, 
    radius: number = 5000 // 5km por defecto
  ): Promise<GoogleMapsLocation[]> {
    try {
      let apiUrl = `/api/places/search?query=${encodeURIComponent(query)}`
      
      // Agregar parámetros de ubicación y radio si están disponibles
      if (location) {
        apiUrl += `&lat=${location.lat}&lng=${location.lng}&radius=${radius}`
      }
      
      console.log(`[Service] URL de búsqueda: ${apiUrl}`)
      
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error("Failed to search places")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data.results as GoogleMapsLocation[]
    } catch (error) {
      console.error("Error searching places:", error)
      throw new Error("Failed to search places")
    }
  }

  static async getPlaceDetails(placeId: string): Promise<GoogleMapsLocation> {
    try {
      const response = await fetch(`/api/places/details?place_id=${placeId}`)

      if (!response.ok) {
        throw new Error("Failed to get place details")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      return data.result as GoogleMapsLocation
    } catch (error) {
      console.error("Error getting place details:", error)
      throw new Error("Failed to get place details")
    }
  }
}
