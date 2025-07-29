// Documentación de Búsqueda Progresiva implementada en ServiciosPage

/**
 * BÚSQUEDA PROGRESIVA CON RADIO EXPANDIBLE
 * 
 * Funcionalidad implementada para garantizar que siempre se encuentren lugares
 * relevantes, expandiendo automáticamente el radio de búsqueda cuando es necesario.
 * 
 * FLUJO DE BÚSQUEDA:
 * 1. Intenta buscar en 5km (radio inicial)
 * 2. Si no encuentra nada, expande a 10km
 * 3. Si no encuentra nada, expande a 20km  
 * 4. Si no encuentra nada, expande a 30km
 * 5. Si no encuentra nada, expande a 40km
 * 6. Si no encuentra nada, expande a 50km (máximo)
 * 
 * CONFIGURACIÓN:
 * - Radios progresivos: [5, 10, 20, 30, 40, 50] km
 * - Radio máximo: 50km
 * - Radio por defecto: 5km
 * 
 * EXPERIENCIA DEL USUARIO:
 * 
 * 1. FEEDBACK VISUAL:
 *    - Mensaje durante búsqueda: "Buscando lugares cercanos. Expandiendo radio si es necesario..."
 *    - Mensaje resultado: "Mostrando lugares en un radio de Xkm."
 *    - Header drawer: "Resultados (N • Xkm)"
 *    - Notificación expandida: "Se expandió la búsqueda a Xkm para encontrar más lugares"
 * 
 * 2. VISUALIZACIÓN EN MAPA:
 *    - Círculo azul: Precisión GPS (100m)
 *    - Círculo verde: Área de búsqueda efectiva (radio usado)
 *    - Auto-zoom según el radio efectivo
 * 
 * 3. CASOS DE USO:
 *    - Zona urbana densa: Probablemente encuentra en 5km
 *    - Zona suburbana: Puede expandir a 10-20km
 *    - Zona rural: Puede requerir hasta 50km
 *    - Sin ubicación: Búsqueda general sin límites
 * 
 * IMPLEMENTACIÓN TÉCNICA:
 * 
 * 1. Hook useGoogleMaps:
 *    - Devuelve `actualRadius`: Radio efectivo usado
 *    - Implementa lógica de búsqueda progresiva
 *    - Maneja casos sin resultados
 * 
 * 2. API Google Places:
 *    - Usa `nearbysearch` para búsquedas por ubicación
 *    - Usa `textsearch` para búsquedas generales
 *    - Parámetros: location, radius, type/query
 * 
 * 3. Estados del componente:
 *    - `searchRadius`: Radio configurado/inicial
 *    - `actualRadius`: Radio efectivo usado (del hook)
 *    - Feedback dinámico basado en estado actual
 * 
 * VENTAJAS:
 * ✅ Garantiza resultados relevantes
 * ✅ Transparencia total al usuario
 * ✅ Optimiza performance (busca desde cerca)
 * ✅ Maneja casos edge (zonas remotas)
 * ✅ UX mejorada con feedback claro
 */

export const PROGRESSIVE_SEARCH_INFO = {
  IMPLEMENTED: "✅ Búsqueda progresiva implementada",
  RADII: [5, 10, 20, 30, 40, 50],
  MAX_RADIUS: 50,
  FEATURES: [
    "Expansión automática de radio",
    "Feedback visual completo", 
    "Círculos en mapa dinámicos",
    "Contador con radio en drawer",
    "Notificación de expansión"
  ]
}
