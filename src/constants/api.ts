export const API_ENDPOINTS = {
  GOOGLE_MAPS: {
    PLACES_SEARCH: "/place/textsearch/json",
    PLACE_DETAILS: "/place/details/json",
  },
  DIJKSTRA: {
    ROUTE: "/route",
  },
} as const

export const API_ERRORS = {
  NETWORK_ERROR: "Error de conexión. Verifique su conexión a internet.",
  NOT_FOUND: "La información solicitada no fue encontrada.",
  SERVER_ERROR: "Error del servidor. Intente nuevamente más tarde.",
  UNKNOWN_ERROR: "Ha ocurrido un error inesperado.",
} as const
