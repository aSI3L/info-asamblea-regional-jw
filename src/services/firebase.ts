import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore"
// import type { FirebaseCategory, FirebaseAssemblyInfo } from "@/types/firebase"
import { env } from "@/lib/env"


const firebaseConfig = {
  // Tu configuración de Firebase
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)

export class FirebaseService {
  static async getCategories() {
    try {
      const categoriesRef = collection(db, "categories")
      const snapshot = await getDocs(categoriesRef)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw new Error("Failed to fetch categories")
    }
  }

  static async getAssemblyInfo() {
    try {
      const assemblyRef = doc(db, "assembly", "info")
      const snapshot = await getDoc(assemblyRef)

      if (!snapshot.exists()) {
        throw new Error("Assembly info not found")
      }

  return snapshot.data()
    } catch (error) {
      console.error("Error fetching assembly info:", error)
      throw new Error("Failed to fetch assembly info")
    }
  }
}
