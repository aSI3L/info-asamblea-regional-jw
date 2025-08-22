import { collection, getDocs, doc, getDoc } from "firebase/firestore"
// Use the centralized config which already reads environment variables
import { db as firestoreDb } from "@/config/firebase"

export const db = firestoreDb

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
