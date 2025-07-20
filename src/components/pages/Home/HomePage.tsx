"use client"

import { useState } from "react";
import { Banner } from "./components/Banner";
import { MainHeader } from "./components/MainInformation";
import { CarouselApi } from "@/components/ui/carousel";
import { NavigationCarrousel } from "./components/NavigationCarrousel";
import { CategoryCard } from "./components/CategoryCard";
import { CategoriesCarrousel } from "./components/CategoriesCarrousel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";

export function HomePage() {
    const [api, setApi] = useState<CarouselApi>()
    const { isLoading, hasError, errorMessage, infoPrincipal, categorias } = useAppData();

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (hasError) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Ha ocurrido un error</h2>
                    <p className="text-gray-600">{errorMessage}</p>
                    <Button
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reintentar
                    </Button>
                </div>
            </div>
        )
    }

    const scrollPrev = () => {
        api?.scrollPrev()
    }

    const scrollNext = () => {
        api?.scrollNext()
    }

    return (
        <>
            <Banner imageUrl={infoPrincipal.imageUrl}/>
            <section className="pt-6 pb-10">
              <div className="container mx-auto px-4">
                <MainHeader mainTitle={infoPrincipal.mainTitle} year={infoPrincipal.year} />
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center pb-6">
                    <span className="text-2xl md:text-3xl font-bold text-secondaryColor">Categorías</span>
                    <NavigationCarrousel scrollNext={scrollNext} scrollPrev={scrollPrev} />
                  </div>
        
                  {/* Vista mobile: Grid vertical */}
                  <div className="md:hidden space-y-6">
                    {categorias.map((event) => (
                      <CategoryCard key={event.id} category={event} />
                    ))}
                  </div>
        
                  {/* Vista desktop: Carousel */}
                  <CategoriesCarrousel categories={categorias} setApi={setApi}/>
                  
                </div>
              </div>
            </section>
        </>
    )
}