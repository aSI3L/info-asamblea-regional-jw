"use client"

import { useState } from "react";
import { Banner } from "./components/Banner";
import { MainHeader } from "./components/MainInformation";
import { CarouselApi } from "@/components/ui/carousel";
import { NavigationCarrousel } from "./components/NavigationCarrousel";
import { CategoryCard } from "./components/CategoryCard";
import { CategoriesCarrousel } from "./components/CategoriesCarrousel";

const events = [
  {
    id: "1",
    title: "Alojamiento",
    description: "Hoteles, departamentos y opciones de hospedaje cercanos al lugar de la asamblea.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    title: "Transporte",
    description: "Información sobre medios de transporte, estacionamientos y traslados.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "3",
    title: "Alimentación",
    description: "Restaurantes, cafeterías y opciones gastronómicas recomendadas.",
    backgroundImage: "/placeholder.svg?height=400&width=600",
  },
]

export function HomePage() {
    const [api, setApi] = useState<CarouselApi>()

    const scrollPrev = () => {
        api?.scrollPrev()
    }

    const scrollNext = () => {
        api?.scrollNext()
    }

    return (
        <>
            <Banner />
            <section className="pt-6 pb-10">
              <div className="container mx-auto px-4">
                <MainHeader />
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center pb-6">
                    <span className="text-2xl md:text-3xl font-bold text-secondaryColor">Categorías</span>
                    <NavigationCarrousel scrollNext={scrollNext} scrollPrev={scrollPrev} />
                  </div>
        
                  {/* Vista mobile: Grid vertical */}
                  <div className="md:hidden space-y-6">
                    {events.map((event) => (
                      <CategoryCard key={event.id} category={event} />
                    ))}
                  </div>
        
                  {/* Vista desktop: Carousel */}
                  <CategoriesCarrousel categories={events} setApi={setApi}/>
                  
                </div>
              </div>
            </section>
        </>
    )
}