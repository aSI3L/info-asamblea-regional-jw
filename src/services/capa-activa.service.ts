import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

// Obtiene la capa activa de un nivel
export async function getCapaActivaDeNivel(edificioId: string, nivel: string): Promise<string> {
  // El id del documento suele ser `${edificioId}_${nivel}`
  const docRef = doc(db, "mapas", `${edificioId}_${nivel}`);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    return data.capaActiva || "Capa 1";
  }
  return "Capa 1";
}
