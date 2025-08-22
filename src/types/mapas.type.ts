// AUTHOR: Agustin Terrero

export interface Node {
  x: number;
  y: number;
  node: string;
}

export interface PointOfInterest extends Node {
  name: string;
  level?: number;
}

export interface Vector {
  origen: string;
  destino: string;
  distancia: number;
  tipo?: string;
  nivel_origen?: number;
  nivel_destino?: number;
}

export interface Building {
  id?: string;
  nombre: string;
  planos: Record<string, string>;
}

export interface Level {
  id: string;
  nombre: string;
  numero: number;
}

export interface Layer {
  id: string;
  nombre: string;
}

export interface StairConnection {
  nivelOrigen: number;
  nivelDestino: number;
  escaleraOrigen: string;
  escaleraDestino: string;
} 

// Types for Google Maps integration
export interface GoogleMapsLocation {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address?: string;
  vicinity?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  [key: string]: any;
}

// Generic Dijkstra route return type
export interface DijkstraRoute {
  path: Array<string | Node>;
  distance: number;
  nodes?: Node[];
  edges?: Vector[];
  [key: string]: any;
}