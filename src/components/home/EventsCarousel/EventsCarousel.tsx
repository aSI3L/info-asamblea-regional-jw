"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const events = [
  {
    id: 1,
    title: "Alojamiento",
    description: "Hoteles, departamentos y opciones de hospedaje cercanos al lugar de la asamblea.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "Transporte",
    description: "Información sobre medios de transporte, estacionamientos y traslados.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "Alimentación",
    description: "Restaurantes, cafeterías y opciones gastronómicas recomendadas.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
]

export function EventsCarousel() {
  const [api, setApi] = useState<CarouselApi>()

  const scrollPrev = () => {
    api?.scrollPrev()
  }

  const scrollNext = () => {
    api?.scrollNext()
  }

  // Determinar si mostrar las flechas de navegación
  const showNavigation = events.length > 3

  const EventCard = ({ event, isMobile = false }: { event: (typeof events)[0]; isMobile?: boolean }) => (
    <Card
      className={`overflow-hidden border-0 shadow-lg bg-nature-cream transition-all duration-300 ${
        !isMobile ? "md:hover:shadow-2xl md:cursor-pointer" : ""
      }`}
    >
      <CardContent className="p-0">
        <article className="relative h-64 md:h-72 lg:h-80">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${event.backgroundImage}')`,
            }}
          >
            {/* Gradient overlay usando colores de la paleta */}
            <div className="absolute inset-0 bg-gradient-to-t from-nature-forest/90 via-nature-forest/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-nature-cream">
            <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight">{event.title}</h3>
            <p className="text-sm md:text-base text-nature-light leading-relaxed">{event.description}</p>
          </div>
        </article>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-nature-light">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 md:mb-12">
          {/* Diseño elegante inspirado en la imagen */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-nature-forest tracking-[0.2em] mb-4">
                ADORACIÓN PURA
              </h3>
              {/* Línea decorativa con 2025 en el centro */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-32 md:w-48 lg:w-64 h-px bg-nature-forest/30"></div>
                <span className="text-xl md:text-2xl font-light text-nature-forest/70">2025</span>
                <div className="w-32 md:w-48 lg:w-64 h-px bg-nature-forest/30"></div>
              </div>
              <h2 className="text-sm md:text-base font-medium text-nature-forest tracking-[0.15em] uppercase">
                ASAMBLEA REGIONAL DE LOS TESTIGOS DE JEHOVÁ
              </h2>
            </div>
          </div>

          <p className="text-nature-forest/80 text-lg max-w-3xl mx-auto leading-relaxed mt-8">
            Descubra información sobre diferentes rubros que pueden serle de utilidad durante los días de asamblea.
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Header con navegación y categorías */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl md:text-3xl font-bold text-nature-forest">Categorías</span>
            {showNavigation && (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={scrollPrev}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-nature-forest text-nature-cream hover:bg-primary transition-colors duration-300 shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-nature-forest text-nature-cream hover:bg-primary transition-colors duration-300 shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Vista mobile: Grid vertical */}
          <div className="md:hidden space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} isMobile={true} />
            ))}
          </div>

          {/* Vista desktop: Carousel */}
          <div className="hidden md:block">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {events.map((event) => (
                  <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-1/2 lg:basis-1/3">
                    <EventCard event={event} isMobile={false} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
