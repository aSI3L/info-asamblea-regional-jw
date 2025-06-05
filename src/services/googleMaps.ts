import type { GoogleMapsLocation } from "@/types"

export class GoogleMapsService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  private static readonly BASE_URL = "https://maps.googleapis.com/maps/api"

  static async searchPlaces(query: string): Promise<GoogleMapsLocation[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("Failed to search places")
      }

      const data = await response.json()
      return data.results as GoogleMapsLocation[]
    } catch (error) {
      console.error("Error searching places:", error)
      throw new Error("Failed to search places")
    }
  }

  static async getPlaceDetails(placeId: string): Promise<GoogleMapsLocation> {
    try {
      const response = await fetch(`${this.BASE_URL}/place/details/json?place_id=${placeId}&key=${this.API_KEY}`)

      if (!response.ok) {
        throw new Error("Failed to get place details")
      }

      const data = await response.json()
      return data.result as GoogleMapsLocation
    } catch (error) {
      console.error("Error getting place details:", error)
      throw new Error("Failed to get place details")
    }
  }
}
