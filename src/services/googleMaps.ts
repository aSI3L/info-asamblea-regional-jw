import type { GoogleMapsLocation } from "@/types"

export class GoogleMapsService {
  static async searchPlaces(query: string): Promise<GoogleMapsLocation[]> {
    try {
      const response = await fetch(
        `/api/places/search?query=${encodeURIComponent(query)}`
      )

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
