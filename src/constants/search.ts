// Configuración de búsqueda de lugares
export const SEARCH_CONFIG = {
  // Radios de búsqueda en metros
  DEFAULT_RADIUS: 2000,        // 2km - radio por defecto
  PRECISION_RADIUS: 100,       // 100m - círculo de precisión del usuario
  MAX_RADIUS: 50000,          // 50km - radio máximo permitido
  MIN_RADIUS: 1000,           // 1km - radio mínimo permitido
  
  // Radios progresivos para búsqueda automática
  PROGRESSIVE_RADII: [2000, 10000, 20000, 30000, 40000, 50000], // 5km, 10km, 20km, 30km, 40km, 50km
  
  // Opciones de radio disponibles
  RADIUS_OPTIONS: [
    { value: 1000, label: "1 km" },
    { value: 2000, label: "2 km" },
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 20000, label: "20 km" },
    { value: 30000, label: "30 km" },
    { value: 40000, label: "40 km" },
    { value: 50000, label: "50 km" },
  ],
  
  // Zoom del mapa según el radio
  ZOOM_BY_RADIUS: {
    1000: 15,   // 1km -> zoom 15
    2000: 14,   // 2km -> zoom 14
    5000: 13,   // 5km -> zoom 13
    10000: 12,  // 10km -> zoom 12
    20000: 11,  // 20km -> zoom 11
    30000: 10,  // 30km -> zoom 10
    40000: 9,   // 40km -> zoom 9
    50000: 8,   // 50km -> zoom 8
  }
} as const

// Tipos de lugares para Google Places API
export const PLACE_TYPES = {
  restaurant: "restaurant",
  lodging: "lodging", 
  gas_station: "gas_station",
  hospital: "hospital",
  pharmacy: "pharmacy",
  bank: "bank",
  atm: "atm",
  supermarket: "supermarket",
  shopping_mall: "shopping_mall",
} as const
