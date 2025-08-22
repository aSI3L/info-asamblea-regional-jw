import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '2000' // 5km por defecto
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  // Use server-only API key to avoid exposing it to the client.
  // Expect a variable named GOOGLE_MAPS_API_KEY (not prefixed with NEXT_PUBLIC_)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured on the server' },
      { status: 500 }
    )
  }

  try {
    let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    
    // Si tenemos coordenadas, usamos búsqueda por ubicación con radio
    if (lat && lng) {
      // Para categorías predefinidas (tipos específicos de Google Places), usar nearbysearch
      const predefinedTypes = ['restaurant', 'lodging', 'gas_station', 'hospital', 'pharmacy', 'bank', 'atm', 'store', 'shopping_mall']
      
      if (predefinedTypes.includes(query)) {
        // Usar nearbysearch para tipos predefinidos
        apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(query)}&key=${apiKey}`
      } else {
        // Para búsquedas de texto personalizadas, usar textsearch con ubicación y radio
        apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`
      }
    }

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Maps API')
    }

    const data = await response.json()
    
    // Normalizar los datos para asegurar que siempre tengamos dirección
    if (data.results) {
      data.results = data.results.map((place: any) => ({
        ...place,
        formatted_address: place.formatted_address || place.vicinity || 'Dirección no disponible'
      }))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching places:', error)
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    )
  }
}
