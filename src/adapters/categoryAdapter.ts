import type { Category } from "@/types"
import type { FirebaseCategory } from "@/types/firebase"

export class CategoryAdapter {
  static fromFirebase(firebaseCategory: FirebaseCategory): Category {
    return {
      id: firebaseCategory.id,
      title: firebaseCategory.title,
      description: firebaseCategory.description,
      backgroundImage: firebaseCategory.backgroundImage,
      slug: firebaseCategory.slug,
      createdAt: firebaseCategory.createdAt?.toDate() || new Date(),
      updatedAt: firebaseCategory.updatedAt?.toDate() || new Date(),
    }
  }

  static fromFirebaseArray(firebaseCategories: FirebaseCategory[]): Category[] {
    return firebaseCategories.filter((category) => category.isActive).map(this.fromFirebase)
  }
}
