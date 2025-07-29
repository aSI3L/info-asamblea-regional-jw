"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Utensils, Car, Bed, AlertCircle, X, Menu, ChevronDown, Check, ChevronsUpDown } from "lucide-react"
import { useGoogleMaps } from "@/hooks/useGoogleMaps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import type { GoogleMapsLocation } from "@/types"
import { SEARCH_CONFIG } from "@/constants/search"
import { cn } from "@/lib/utils"
import styles from "./ServiciosPage.module.scss"

export function ServiciosPage() {
  const { locations, isLoading, error, actualRadius, searchPlaces, getPlaceDetails } = useGoogleMaps()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<GoogleMapsLocation | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ value: string; label: string; icon: any }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [searchingPlaces, setSearchingPlaces] = useState(false)
  const [isRefreshingWithLocation, setIsRefreshingWithLocation] = useState(false)
  const [searchRadius, setSearchRadius] = useState<number>(SEARCH_CONFIG.DEFAULT_RADIUS) // Radio inicial
  const [isLocationReady, setIsLocationReady] = useState(false) // Flag para saber si la geolocalización ya se procesó
  const [open, setOpen] = useState(false) // Para el popover del autocompletado
  const [inputValue, setInputValue] = useState("") // Para el valor del input de búsqueda
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const listItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Función para mapear nombres de iconos a componentes
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Search,
      Utensils,
      Bed,
      Car,
      AlertCircle,
      MapPin,
      Menu,
      ChevronDown,
      Check,
      ChevronsUpDown,
      X
    }
    return iconMap[iconName] || AlertCircle
  }

  // Función para cargar categorías desde la API
  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('https://3af90b44146341a5b809dfc47c15d752.api.mockbin.io/')
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      
      const data = await response.json()
      
      // Mapear los iconos de string a componentes
      const categoriesWithIcons = data.categories.map((category: any) => ({
        ...category,
        icon: getIconComponent(category.icon)
      }))
      
      setCategories(categoriesWithIcons)
      
      // Seleccionar automáticamente la primera categoría válida (que no sea vacía)
      const firstValidCategory = categoriesWithIcons.find((cat: any) => cat.value !== "")
      if (firstValidCategory && !selectedCategory) {
        setSelectedCategory(firstValidCategory.value)
        setInputValue(firstValidCategory.label) // Establecer el texto del input
        // NO ejecutar búsqueda aquí - esperar a que la geolocalización esté lista
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback a categorías por defecto en caso de error
      const fallbackCategories = [
        { value: "", label: "Seleccionar categoría", icon: Search },
        { value: "restaurant", label: "Restaurantes", icon: Utensils },
        { value: "lodging", label: "Hoteles", icon: Bed },
        { value: "gas_station", label: "Gasolineras", icon: Car },
      ]
      setCategories(fallbackCategories)
      
      // Seleccionar la primera categoría válida del fallback
      if (!selectedCategory) {
        setSelectedCategory("restaurant")
        setInputValue("Restaurantes") // Establecer el texto del input para el fallback
        // NO ejecutar búsqueda aquí - esperar a que la geolocalización esté lista
      }
    } finally {
      setLoadingCategories(false)
    }
  }

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
        setIsLocationReady(true) // Marcar que la geolocalización está lista
        
        // Si el mapa ya está inicializado, agregar el marcador del usuario
        if (mapInstanceRef.current) {
          addUserMarkerToMap(latitude, longitude)
        }

        // Refrescar automáticamente con la categoría seleccionada actual
        // para mostrar lugares cercanos a la nueva ubicación
        if (selectedCategory && selectedCategory !== "") {
          setIsRefreshingWithLocation(true)
          setTimeout(() => {
            handleSearch(selectedCategory).finally(() => {
              setIsRefreshingWithLocation(false)
            })
          }, 500) // Pequeño delay para que se procese la ubicación
        }
      },
      (error) => {
        // Marcar como lista incluso si falla (para permitir búsquedas generales)
        setIsLocationReady(true)
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
        fontWeight: "bold",
        background:"#fff",
        padding:"3px"
      },
      zIndex: 1000 // Asegurar que esté encima de otros marcadores
    })

    // Crear círculo de precisión alrededor del usuario (100m)
    new (window as any).google.maps.Circle({
      strokeColor: "#4285F4",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#4285F4",
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: SEARCH_CONFIG.PRECISION_RADIUS // 100 metros de radio para precisión
    })

    // Crear círculo de área de búsqueda (radio dinámico)
    new (window as any).google.maps.Circle({
      strokeColor: "#10B981",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: "#10B981",
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: actualRadius || searchRadius // Usar radio efectivo o el configurado
    })
  }
  
  // Solicitar geolocalización automáticamente al cargar el componente
  useEffect(() => {
    getUserLocation()
  }, [])

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories()
  }, [])

  // Ejecutar búsqueda inicial cuando tanto categorías como geolocalización estén listos
  useEffect(() => {
    if (isLocationReady && !loadingCategories && selectedCategory && selectedCategory !== "" && !hasSearched) {
      // Ejecutar la primera búsqueda con toda la información disponible
      setTimeout(() => {
        handleSearch(selectedCategory)
      }, 100)
    }
  }, [isLocationReady, loadingCategories, selectedCategory, hasSearched])
  
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

        // Crear bounds para ajustar el zoom automáticamente
        const bounds = new (window as any).google.maps.LatLngBounds()
        
        // Agregar la ubicación del usuario a los bounds si existe
        if (userLocation) {
          bounds.extend(new (window as any).google.maps.LatLng(userLocation.lat, userLocation.lng))
        }
        
        // Agregar todas las ubicaciones de los lugares a los bounds
        locations.forEach((location) => {
          bounds.extend(new (window as any).google.maps.LatLng(
            location.geometry.location.lat,
            location.geometry.location.lng
          ))
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
              fontWeight: "bold",
              background:"#fff",
              padding:"3px"
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
                fontWeight: "bold",
                background:"#fff",
                padding:"3px"
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
              fontWeight: "bold",
              background:"#fff",
              padding:"3px"
            })
            
            // Seleccionar el lugar
            handlePlaceSelect(location)
            
            // Abrir el drawer inmediatamente
            setIsDrawerOpen(true)
          })
          
          markersRef.current.push(marker)
        })
        
        // Ajustar el zoom y centro del mapa para mostrar todos los marcadores
        if (!bounds.isEmpty()) {
          mapInstanceRef.current.fitBounds(bounds, {
            padding: {
              top: 80,    // Espacio para la barra de búsqueda
              right: 50,
              bottom: 50,
              left: 50
            }
          })
          
          // Asegurar un zoom mínimo y máximo
          const listener = (window as any).google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
            const zoom = mapInstanceRef.current.getZoom()
            if (zoom > 16) {
              mapInstanceRef.current.setZoom(16) // Zoom máximo para no estar demasiado cerca
            } else if (zoom < 10) {
              mapInstanceRef.current.setZoom(10) // Zoom mínimo para no estar demasiado lejos
            }
          })
        }
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
      setSearchingPlaces(true)
      setHasSearched(true)
      
      setSearchQuery(category)
      try {
        let searchResult
        // Si tenemos la ubicación del usuario, buscar con radio progresivo
        if (userLocation) {
          searchResult = await searchPlaces(category, userLocation, searchRadius)
        } else {
          // Búsqueda general sin limitación geográfica
          searchResult = await searchPlaces(category)
        }
        
        // Actualizar el radio actual para mostrarlo en el mapa
        if (searchResult.radius && userLocation) {
          setSearchRadius(searchResult.radius)
        }
        
        // Abrir el drawer cuando se obtienen resultados
        if (!isDrawerOpen && searchResult.results.length > 0) {
          setIsDrawerOpen(true)
        }
      } finally {
        setSearchingPlaces(false)
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

  // Nueva función para manejar la selección en el autocompletado
  const handleAutocompleteSelect = async (value: string, label: string) => {
    setSelectedCategory(value)
    setInputValue(label)
    setSearchRadius(SEARCH_CONFIG.DEFAULT_RADIUS) // Reiniciar el radio al valor inicial
    setOpen(false)
    
    // Ejecutar búsqueda automáticamente
    if (value) {
      await handleSearch(value)
    }
  }

  // Función para manejar la búsqueda personalizada (cuando el usuario escribe algo)
  const handleCustomSearch = async () => {
    if (inputValue.trim()) {
      setSelectedCategory(inputValue.trim())
      setSearchRadius(SEARCH_CONFIG.DEFAULT_RADIUS) // Reiniciar el radio al valor inicial
      setOpen(false)
      // Usar la misma función handleSearch que utiliza geolocalización y radio progresivo
      await handleSearch(inputValue.trim())
    }
  }

  // Función para manejar el Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleCustomSearch()
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
            fontWeight: "bold",
            background:"#fff",
            padding:"3px"
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
              fontWeight: "bold",
              background:"#fff",
              padding:"3px"
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
            
            {/* Autocompletado personalizado */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    styles["servicios-page__select"],
                    "justify-between text-left font-normal"
                  )}
                  disabled={loadingCategories || searchingPlaces}
                >
                  {inputValue || "Buscar categoría o lugar específico..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar categoría o escribir lugar específico..." 
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyDown={handleKeyDown}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No se encontró la categoría. 
                        </p>
                        <Button 
                          size="sm" 
                          onClick={handleCustomSearch}
                          disabled={!inputValue.trim()}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Buscar "{inputValue}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Categorías disponibles">
                      {!loadingCategories && categories
                        .filter(category => category.value !== "") // Filtrar la opción vacía
                        .map((category) => {
                          const IconComponent = category.icon
                          return (
                            <CommandItem
                              key={category.value}
                              value={category.label}
                              onSelect={() => handleAutocompleteSelect(category.value, category.label)}
                            >
                              <IconComponent className="mr-2 h-4 w-4" />
                              {category.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedCategory === category.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                    </CommandGroup>
                    {inputValue && inputValue.trim() && !categories.some(cat => 
                      cat.label.toLowerCase().includes(inputValue.toLowerCase())
                    ) && (
                      <CommandGroup heading="Búsqueda personalizada">
                        <CommandItem
                          value={inputValue}
                          onSelect={handleCustomSearch}
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Buscar "{inputValue}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <ChevronDown className={styles["servicios-page__select-arrow"]} />
          </div>
        </div>
        
        {/* Loading indicator para búsqueda */}
        {(searchingPlaces || !isLocationReady) && (
          <div className={styles["servicios-page__search-loading"]}>
            <div className={styles["servicios-page__search-loading-spinner"]}></div>
            <span>
              {!isLocationReady 
                ? "Obteniendo tu ubicación..."
                : "Buscando lugares cercanos..."
              }
            </span>
          </div>
        )}
        
        {/* Mostrar error de ubicación si existe */}
        {/* {locationError && (
          <div className={styles["servicios-page__location-error"]}>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{locationError}</span>
          </div>
        )} */}
        
        {/* Mostrar confirmación de ubicación obtenida */}
        {userLocation && !locationError && isLocationReady && (
          <div className={styles["servicios-page__location-success"]}>
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {isRefreshingWithLocation || (searchingPlaces && userLocation)
                ? "Buscando lugares cercanos. Expandiendo radio si es necesario..."
                : actualRadius 
                  ? `Ubicación obtenida. Mostrando lugares en un radio de ${actualRadius / 1000}km.`
                  : `Ubicación obtenida. Buscando lugares en un radio de ${searchRadius / 1000}km.`
              }
            </span>
          </div>
        )}

        {/* Mostrar si se está usando búsqueda general (sin geolocalización) */}
        {isLocationReady && locationError && hasSearched && (
          <div className={styles["servicios-page__location-success"]}>
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Búsqueda general (sin ubicación específica)</span>
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
          {/* Mensaje informativo sobre búsqueda expandida */}
          {actualRadius && actualRadius > SEARCH_CONFIG.DEFAULT_RADIUS && locations.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Se expandió la búsqueda a {actualRadius / 1000}km para encontrar más lugares cercanos.
                </span>
              </div>
            </div>
          )}

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
