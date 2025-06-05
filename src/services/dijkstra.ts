import type { DijkstraRoute } from "@/types"

export class DijkstraService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_DIJKSTRA_API_URL

  static async calculateRoute(origin: string, destination: string): Promise<DijkstraRoute> {
    try {
      const response = await fetch(`${this.BASE_URL}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate route")
      }

      const data = await response.json()
      return data as DijkstraRoute
    } catch (error) {
      console.error("Error calculating route:", error)
      throw new Error("Failed to calculate route")
    }
  }
}
