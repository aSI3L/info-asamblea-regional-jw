import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore"
// import type { FirebaseCategory, FirebaseAssemblyInfo } from "@/types/firebase"
import { env } from "@/lib/env"


const firebaseConfig = {
  apiKey: "AIzaSyCxCVx1lt3LKAXNb30sA1G-I00PLzaXjTA",
  authDomain: "asamblea-4440d.firebaseapp.com",
  projectId: "asamblea-4440d",
  storageBucket: "asamblea-4440d.firebasestorage.app",
  messagingSenderId: "949414428847",
  appId: "1:949414428847:web:30b9c77889a7a221bd145a"
};

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
