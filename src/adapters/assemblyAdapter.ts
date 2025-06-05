import type { AssemblyInfo, Location } from "@/types"
import type { FirebaseAssemblyInfo } from "@/types/firebase"

export class AssemblyAdapter {
  static fromFirebase(firebaseAssembly: FirebaseAssemblyInfo): AssemblyInfo {
    const location: Location = {
      id: "main-location",
      name: firebaseAssembly.location.name,
      address: firebaseAssembly.location.address,
      coordinates: {
        lat: firebaseAssembly.location.lat,
        lng: firebaseAssembly.location.lng,
      },
      city: firebaseAssembly.location.city,
      country: firebaseAssembly.location.country,
    }

    return {
      title: firebaseAssembly.title,
      subtitle: firebaseAssembly.subtitle,
      year: firebaseAssembly.year,
      description: firebaseAssembly.description,
      location,
      dates: {
        startDate: firebaseAssembly.startDate?.toDate() || new Date(),
        endDate: firebaseAssembly.endDate?.toDate() || new Date(),
      },
    }
  }
}
