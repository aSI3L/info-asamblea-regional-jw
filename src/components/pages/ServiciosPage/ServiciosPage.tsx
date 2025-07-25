"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Utensils, Car, Bed, AlertCircle, X, Menu, ChevronDown } from "lucide-react"
import { useGoogleMaps } from "@/hooks/useGoogleMaps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { GoogleMapsLocation } from "@/types"
import styles from "./ServiciosPage.module.scss"

export function ServiciosPage() {
  const { locations, isLoading, error, searchPlaces, getPlaceDetails } = useGoogleMaps()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<GoogleMapsLocation | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const listItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Opciones de categorías
  const categories = [
    { value: "", label: "Seleccionar categoría", icon: Search },
    { value: "restaurant", label: "Restaurantes", icon: Utensils },
    { value: "lodging", label: "Hoteles", icon: Bed },
    { value: "gas_station", label: "Gasolineras", icon: Car },
    { value: "hospital", label: "Hospitales", icon: AlertCircle },
    { value: "pharmacy", label: "Farmacias", icon: AlertCircle },
    { value: "bank", label: "Bancos", icon: AlertCircle },
    { value: "atm", label: "Cajeros automáticos", icon: AlertCircle },
    { value: "shopping_mall", label: "Centros comerciales", icon: AlertCircle },
    { value: "supermarket", label: "Supermercados", icon: AlertCircle }
  ]

  // Función para obtener la ubicación del usuario
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada en este navegador")
      return
    }

    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        // Si el mapa ya está inicializado, agregar el marcador del usuario
        if (mapInstanceRef.current) {
          addUserMarkerToMap(latitude, longitude)
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Se denegó el acceso a la ubicación")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("La información de ubicación no está disponible")
            break
          case error.TIMEOUT:
            setLocationError("La solicitud de ubicación expiró")
            break
          default:
            setLocationError("Ocurrió un error desconocido al obtener la ubicación")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: Infinity, // Sin límite de tiempo
        maximumAge: Infinity // La ubicación nunca expira
      }
    )
  }

  // Función para agregar el marcador del usuario al mapa
  const addUserMarkerToMap = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return

    // Remover marcador anterior del usuario si existe
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }

    // Crear nuevo marcador para la ubicación del usuario
    userMarkerRef.current = new (window as any).google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: "Tu ubicación",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-pushpin.png",
        scaledSize: new (window as any).google.maps.Size(35, 35),
        labelOrigin: new (window as any).google.maps.Point(17, -8)
      },
      label: {
        text: "Tú",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "bold"
      },
      zIndex: 1000 // Asegurar que esté encima de otros marcadores
    })

    // Crear círculo de precisión alrededor del usuario
    new (window as any).google.maps.Circle({
      strokeColor: "#4285F4",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#4285F4",
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: 100 // 100 metros de radio
    })
  }
  
  // Solicitar geolocalización automáticamente al cargar el componente
  useEffect(() => {
    getUserLocation()
  }, [])
  
  useEffect(() => {
    if (hasSearched && locations.length > 0 && mapRef.current && !mapInstanceRef.current) {
      const initMap = () => {
        if (!mapRef.current) return
        
        // Crear el mapa centrado en el primer resultado o en la ubicación del usuario
        let center
        if (userLocation) {
          center = userLocation
        } else {
          const firstLocation = locations[0]
          center = {
            lat: firstLocation.geometry.location.lat,
            lng: firstLocation.geometry.location.lng
          }
        }
        
        mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
          zoom: 13,
          center,
          styles: [
            // Estilo personalizado para que se vea elegante
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#a2dae5" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry.fill",
              stylers: [{ color: "#f0fdf4" }]
            }
          ]
        })

        // Agregar marcador del usuario si existe la ubicación
        if (userLocation) {
          addUserMarkerToMap(userLocation.lat, userLocation.lng)
        }
        
        // Agregar marcadores para cada lugar
        locations.forEach((location, index) => {
          const marker = new (window as any).google.maps.Marker({
            position: {
              lat: location.geometry.location.lat,
              lng: location.geometry.location.lng
            },
            map: mapInstanceRef.current,
            title: location.name,
            label: {
              text: location.name.length > 20 ? location.name.substring(0, 17) + '...' : location.name,
              color: "#000",
              fontSize: "12px",
              fontWeight: "bold"
            },
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new (window as any).google.maps.Size(32, 32),
              labelOrigin: new (window as any).google.maps.Point(16, -10)
            }
          })
          
          // Agregar evento click al marcador
          marker.addListener("click", () => {
            // Actualizar el icono de todos los marcadores a normal
            markersRef.current.forEach((m, idx) => {
              const loc = locations[idx]
              m.setIcon({
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new (window as any).google.maps.Size(32, 32),
                labelOrigin: new (window as any).google.maps.Point(16, -10)
              })
              m.setLabel({
                text: loc.name.length > 20 ? loc.name.substring(0, 17) + '...' : loc.name,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold"
              })
            })
            
            // Destacar el marcador seleccionado
            marker.setIcon({
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new (window as any).google.maps.Size(40, 40),
              labelOrigin: new (window as any).google.maps.Point(20, -12)
            })
            marker.setLabel({
              text: location.name.length > 18 ? location.name.substring(0, 15) + '...' : location.name,
              color: "#000",
              fontSize: "14px",
              fontWeight: "bold"
            })
            
            // Seleccionar el lugar
            handlePlaceSelect(location)
            
            // Abrir el drawer inmediatamente
            setIsDrawerOpen(true)
          })
          
          markersRef.current.push(marker)
        })
      }
      
      // Verificar si Google Maps ya está cargado
      if ((window as any).google && (window as any).google.maps) {
        initMap()
      } else {
        // Cargar Google Maps API si no está disponible
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.onload = initMap
        document.head.appendChild(script)
      }
    }
  }, [hasSearched, locations, userLocation])

  // Limpiar marcadores cuando cambian las búsquedas
  useEffect(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
      userMarkerRef.current = null
    }
    mapInstanceRef.current = null
    listItemRefs.current = {}
    setSelectedPlace(null)
  }, [selectedCategory])

  const handleSearch = async (category: string) => {
    if (category) {
      setHasSearched(true)
      
      // Si tenemos la ubicación del usuario, buscar cerca de ella
      let searchQuery = category
      if (userLocation) {
        searchQuery = `${category} near ${userLocation.lat},${userLocation.lng}`
      }
      
      setSearchQuery(searchQuery)
      await searchPlaces(searchQuery)
      // Abrir el drawer cuando se obtienen resultados
      if (!isDrawerOpen) {
        setIsDrawerOpen(true)
      }
    }
  }

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    setSelectedCategory(newCategory)
    
    // Ejecutar búsqueda automáticamente si hay una categoría seleccionada
    if (newCategory) {
      await handleSearch(newCategory)
    }
  }

  const handlePlaceSelect = (place: GoogleMapsLocation) => {
    // Si ya está seleccionado el mismo lugar, no hacer nada
    if (selectedPlace?.place_id === place.place_id) {
      return
    }
    
    setSelectedPlace(place)
    
    // Scroll al elemento correspondiente en la lista si existe
    const listItem = listItemRefs.current[place.place_id]
    if (listItem) {
      listItem.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      })
    }
    
    // Actualizar marcadores en el mapa
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker, index) => {
        const location = locations[index]
        if (location && location.place_id === place.place_id) {
          // Destacar el marcador seleccionado
          marker.setIcon({
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new (window as any).google.maps.Size(40, 40),
            labelOrigin: new (window as any).google.maps.Point(20, -12)
          })
          marker.setLabel({
            text: location.name.length > 18 ? location.name.substring(0, 15) + '...' : location.name,
            color: "#000",
            fontSize: "14px",
            fontWeight: "bold"
          })
        } else {
          // Restaurar marcadores no seleccionados
          marker.setIcon({
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new (window as any).google.maps.Size(32, 32),
            labelOrigin: new (window as any).google.maps.Point(16, -10)
          })
          if (location) {
            marker.setLabel({
              text: location.name.length > 20 ? location.name.substring(0, 17) + '...' : location.name,
              color: "#000",
              fontSize: "12px",
              fontWeight: "bold"
            })
          }
        }
      })
    }
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  const getGoogleMapsUrl = (place: GoogleMapsLocation) => {
    const { lat, lng } = place.geometry.location
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`
  }

  return (
    <div className={styles["servicios-page"]}>
      {/* Background Image */}
      <div className={styles["servicios-page__background"]}>
        <div className={styles["servicios-page__background-overlay"]} />
      </div>

      {/* Fixed Search Section */}
      <div className={styles["servicios-page__search"]}>
        <div className={styles["servicios-page__search-container"]}>
          <div className={styles["servicios-page__select-container"]}>
            <Search className={styles["servicios-page__search-icon"]} />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles["servicios-page__select"]}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles["servicios-page__select-arrow"]} />
          </div>
        </div>
        
        {/* Mostrar error de ubicación si existe */}
        {/* {locationError && (
          <div className={styles["servicios-page__location-error"]}>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{locationError}</span>
          </div>
        )} */}
        
        {/* Mostrar confirmación de ubicación obtenida */}
        {userLocation && !locationError && (
          <div className={styles["servicios-page__location-success"]}>
            <MapPin className="w-4 h-4 mr-2" />
            <span>Ubicación obtenida. Las búsquedas mostrarán lugares cercanos a ti.</span>
          </div>
        )}
      </div>

      {/* Main Content - Mapa fullscreen */}
      <div className={styles["servicios-page__main"]}>
        {hasSearched && locations.length > 0 ? (
          <div
            ref={mapRef}
            className={styles["servicios-page__map-container"]}
          />
        ) : (
          <div className={styles["servicios-page__map-placeholder"]}>
            <div className={styles["servicios-page__map-placeholder-content"]}>
              <MapPin className={styles["servicios-page__map-placeholder-icon"]} />
              <h3 className={styles["servicios-page__map-placeholder-title"]}>
                Mapa de ubicaciones
              </h3>
              <p className={styles["servicios-page__map-placeholder-subtitle"]}>
                Los resultados de tu búsqueda aparecerán aquí en el mapa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toggle Button - Solo visible cuando hay resultados */}
      {hasSearched && locations.length > 0 && (
        <Button
          onClick={toggleDrawer}
          className={styles["servicios-page__drawer-toggle"]}
          variant="outline"
        >
          <Menu className="w-4 h-4 mr-2" />
          {isDrawerOpen ? "Ocultar" : "Ver resultados"}
        </Button>
      )}

      {/* Responsive Drawer Component */}
      <div className={`${styles["servicios-page__drawer"]} ${isDrawerOpen ? styles["servicios-page__drawer--open"] : ""}`}>
        {/* Drawer Header */}
        <div className={styles["servicios-page__drawer-header"]}>
          <h5 className={styles["servicios-page__drawer-title"]}>
            <Search className="w-4 h-4 mr-2" />
            Resultados de búsqueda
            {locations.length > 0 && (
              <span className={styles["servicios-page__drawer-count"]}>
                ({locations.length})
              </span>
            )}
          </h5>
          <button
            onClick={closeDrawer}
            className={styles["servicios-page__drawer-close"]}
            aria-label="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className={styles["servicios-page__drawer-content"]}>
          {/* Error Message */}
          {error && (
            <div className={styles["servicios-page__error-container"]}>
              <div className={styles["servicios-page__error-content"]}>
                <AlertCircle className={styles["servicios-page__error-icon"]} />
                <span className={styles["servicios-page__error-text"]}>{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className={styles["servicios-page__loading"]}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles["servicios-page__loading-item"]}>
                  <Skeleton className={styles["servicios-page__loading-avatar"]} />
                  <div className={styles["servicios-page__loading-info"]}>
                    <Skeleton className={styles["servicios-page__loading-line"]} />
                    <Skeleton className={styles["servicios-page__loading-line--short"]} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && locations.length > 0 && (
            <div className={styles["servicios-page__places-list"]}>
              {locations.map((place) => (
                <div 
                  key={place.place_id}
                  ref={(el) => {
                    listItemRefs.current[place.place_id] = el
                  }}
                  className={`${styles["servicios-page__place-item"]} ${
                    selectedPlace?.place_id === place.place_id 
                      ? styles["servicios-page__place-item--selected"]
                      : ""
                  }`}
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className={styles["servicios-page__place-item-content"]}>
                    <div className={styles["servicios-page__place-item-header"]}>
                      <div className={styles["servicios-page__place-item-icon"]}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className={styles["servicios-page__place-item-info"]}>
                        <h3 className={styles["servicios-page__place-item-name"]}>
                          {place.name}
                        </h3>
                        <p className={styles["servicios-page__place-item-address"]}>
                          {place.formatted_address}
                        </p>
                      </div>
                    </div>
                    
                    {selectedPlace?.place_id === place.place_id && (
                      <div className={styles["servicios-page__place-item-details"]}>
                        <div className={styles["servicios-page__place-item-actions"]}>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(getGoogleMapsUrl(place), '_blank')
                            }}
                            className={styles["servicios-page__place-item-button"]}
                            size="sm"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            Ver en Maps
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && locations.length === 0 && hasSearched && (
            <div className={styles["servicios-page__empty-state"]}>
              <div className={styles["servicios-page__empty-icon-wrapper"]}>
                <Search className={styles["servicios-page__empty-icon"]} />
              </div>
              <h3 className={styles["servicios-page__empty-title"]}>
                No se encontraron lugares
              </h3>
              <p className={styles["servicios-page__empty-description"]}>
                Intenta con otros términos de búsqueda como 'restaurante', 'hotel' o 'gasolinera'
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop para el drawer */}
      {isDrawerOpen && (
        <div 
          className={styles["servicios-page__drawer-backdrop"]}
          onClick={closeDrawer}
        />
      )}
    </div>
  )
}
