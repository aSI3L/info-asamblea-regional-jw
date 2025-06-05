// Tipos principales de la aplicación
export interface Category {
  id: string
  title: string
  description: string
  backgroundImage: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface AssemblyInfo {
  title: string
  subtitle: string
  year: number
  description: string
  location: Location
  dates: {
    startDate: Date
    endDate: Date
  }
}

export interface Location {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  city: string
  country: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: Date
}

// Tipos para APIs externas
export interface GoogleMapsLocation {
  place_id: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  name: string
}

export interface DijkstraRoute {
  origin: string
  destination: string
  distance: number
  duration: number
  steps: RouteStep[]
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
}
