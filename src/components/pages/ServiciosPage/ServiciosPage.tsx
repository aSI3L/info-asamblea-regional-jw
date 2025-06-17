"use client"

import { useState } from "react"
import { Search, MapPin, Utensils, Car, Bed, AlertCircle, X } from "lucide-react"
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
  const [selectedPlace, setSelectedPlace] = useState<GoogleMapsLocation | null>(null)
  const [placeDetails, setPlaceDetails] = useState<GoogleMapsLocation | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      await searchPlaces(searchQuery.trim())
    }
  }

  const handlePlaceSelect = async (place: GoogleMapsLocation) => {
    setSelectedPlace(place)
    setLoadingDetails(true)
    setIsPopupOpen(true) // Abrir el popup
    
    try {
      const details = await getPlaceDetails(place.place_id)
      setPlaceDetails(details)
    } catch (err) {
      console.error("Error getting place details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedPlace(null)
    setPlaceDetails(null)
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

      {/* Content */}
      <div className={styles["servicios-page__content"]}>
        {/* Header Section */}
        <div className={styles["servicios-page__header"]}>
          <h1 className={styles["servicios-page__header-title"]}>
            SERVICIOS CERCANOS
          </h1>
          <div className={styles["servicios-page__header-year"]}>2025</div>
          <div className={styles["servicios-page__header-subtitle"]}>
            ASAMBLEA REGIONAL DE LOS TESTIGOS DE JEHOVÁ
          </div>
          <p className={styles["servicios-page__header-description"]}>
            Encuentra restaurantes, hoteles, estaciones de servicio y otros lugares de interés cerca del lugar de la asamblea
          </p>
        </div>

        {/* Search Section */}
        <div className={styles["servicios-page__search"]}>
          <form onSubmit={handleSearch} className={styles["servicios-page__search-container"]}>
            <Search className={styles["servicios-page__search-icon"]} />
            <Input
              type="text"
              placeholder="Buscar restaurantes, hoteles, gasolineras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles["servicios-page__search-input"]}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !searchQuery.trim()}
              className={styles["servicios-page__search-button"]}
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </form>
        </div>        {/* Results Section */}
        <div className={styles["servicios-page__results-container"]}>
          {/* Search Results Panel */}
          <Card className={styles["servicios-page__results-card"]}>
            <CardHeader>
              <CardTitle className={styles["servicios-page__results-title"]}>
                Resultados de búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className={styles["servicios-page__results-content"]}>
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
              )}              {/* Search Results */}
              {!isLoading && locations.length > 0 && (
                <div className={styles["servicios-page__places-grid"]}>
                  {locations.map((place) => (
                    <div 
                      key={place.place_id}
                      className={`${styles["servicios-page__place-card"]} ${
                        selectedPlace?.place_id === place.place_id 
                          ? styles["servicios-page__place-card--selected"]
                          : ""
                      }`}
                      onClick={() => handlePlaceSelect(place)}
                    >
                      <div className={styles["servicios-page__place-card-content"]}>
                        <div className={styles["servicios-page__place-card-header"]}>
                          <div className={styles["servicios-page__place-card-icon-wrapper"]}>                            <span className={styles["servicios-page__place-card-icon-container"]}>
                              <svg xmlns="http://www.w3.org/2000/svg" className={styles["servicios-page__place-card-icon"]} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                              </svg>
                            </span>
                          </div>
                          <div className={styles["servicios-page__place-card-info"]}>
                            <div className={styles["servicios-page__place-card-title"]}>
                              {place.name}
                            </div>
                            <div className={styles["servicios-page__place-card-subtitle"]}>
                              {place.formatted_address}
                            </div>
                          </div>
                        </div>
                        <div className={styles["servicios-page__place-card-footer"]}>
                          <div className={styles["servicios-page__place-card-progress"]}>
                            <div className={styles["servicios-page__place-card-progress-bar"]} style={{width: "83%"}}></div>
                          </div>
                          <div className={styles["servicios-page__place-card-stats"]}>
                            <p className={styles["servicios-page__place-card-change"]}>Ver detalles</p>
                            <div className={styles["servicios-page__place-card-percentage"]}>
                              <p>83%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty States */}
              {!isLoading && !error && locations.length === 0 && (
                <div className={styles["servicios-page__empty-state"]}>
                  <div className={styles["servicios-page__empty-icon-wrapper"]}>
                    <Search className={styles["servicios-page__empty-icon"]} />
                  </div>
                  <h3 className={styles["servicios-page__empty-title"]}>
                    {searchQuery ? "No se encontraron lugares" : "Busca lugares de interés"}
                  </h3>
                  <p className={styles["servicios-page__empty-description"]}>
                    {searchQuery 
                      ? "Intenta con otros términos de búsqueda como 'restaurante', 'hotel' o 'gasolinera'"
                      : "Usa el buscador para encontrar restaurantes, hoteles y otros servicios cerca del lugar de la asamblea"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popup Modal for Place Details */}
        {isPopupOpen && selectedPlace && (
          <div className={styles["servicios-page__popup-overlay"]} onClick={closePopup}>
            <div 
              className={styles["servicios-page__popup"]}
              onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic en el contenido
            >
              {/* Header del popup */}
              <div className={styles["servicios-page__popup-header"]}>
                <h2 className={styles["servicios-page__popup-title"]}>
                  Detalles del lugar
                </h2>
                <button
                  onClick={closePopup}
                  className={styles["servicios-page__popup-close"]}
                  aria-label="Cerrar"
                >
                  <X className={styles["servicios-page__popup-close-icon"]} />
                </button>
              </div>

              {/* Contenido del popup */}
              <div className={styles["servicios-page__popup-content"]}>
                {/* Place Details */}
                <div className={styles["servicios-page__popup-place-info"]}>
                  <div className={styles["servicios-page__popup-place-header"]}>
                    <MapPin className={styles["servicios-page__popup-place-icon"]} />
                    <h3 className={styles["servicios-page__popup-place-name"]}>
                      {selectedPlace.name}
                    </h3>
                  </div>
                  
                  {loadingDetails ? (
                    <div className={styles["servicios-page__loading-details"]}>
                      <Skeleton className={styles["servicios-page__loading-details-line"]} />
                      <Skeleton className={styles["servicios-page__loading-details-line--medium"]} />
                      <Skeleton className={styles["servicios-page__loading-details-line--short"]} />
                    </div>
                  ) : (
                    <div className={styles["servicios-page__popup-place-content"]}>
                      <p className={styles["servicios-page__popup-place-address"]}>
                        {selectedPlace.formatted_address}
                      </p>
                      
                      <Button 
                        onClick={() => window.open(getGoogleMapsUrl(selectedPlace), '_blank')}
                        className={styles["servicios-page__popup-maps-button"]}
                      >
                        <MapPin className={styles["servicios-page__popup-maps-icon"]} />
                        Ver en Google Maps
                      </Button>
                    </div>
                  )}
                </div>

                {/* Google Maps Embed */}
                <div className={styles["servicios-page__popup-map-container"]}>
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${selectedPlace.place_id}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={styles["servicios-page__popup-map-iframe"]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
