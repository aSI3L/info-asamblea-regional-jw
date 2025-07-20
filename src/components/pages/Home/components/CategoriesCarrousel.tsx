import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Category } from "@/types/category.type";
import { CategoryCard } from "./CategoryCard";
import { Dispatch, SetStateAction } from "react";
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import Link from "next/link";

interface CategoriesCarrouselProps {
    categories: Category[]
    setApi: Dispatch<SetStateAction<UseEmblaCarouselType[1]>>
}

export function CategoriesCarrousel({ categories, setApi }: CategoriesCarrouselProps) {
    return (
        <div className="hidden md:block">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                    {categories.map((category) => (
                        <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                            <Link href={category.href}>
                                <CategoryCard category={category} />
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}