// Tipos específicos para Firebase
export interface FirebaseCategory {
  id: string
  title: string
  description: string
  backgroundImage: string
  slug: string
  createdAt: any // Firestore Timestamp
  updatedAt: any // Firestore Timestamp
  isActive: boolean
}

export interface FirebaseAssemblyInfo {
  title: string
  subtitle: string
  year: number
  description: string
  location: {
    name: string
    address: string
    lat: number
    lng: number
    city: string
    country: string
  }
  startDate: any // Firestore Timestamp
  endDate: any // Firestore Timestamp
}
