import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationCarrouselProps {
    scrollPrev: () => void
    scrollNext: () => void
}

export function NavigationCarrousel({ scrollPrev, scrollNext }: NavigationCarrouselProps) {
    return (
        <div className="hidden md:flex gap-3">
            <button onClick={scrollPrev} className="flex items-center justify-center w-10 h-10 rounded-full bg-nature-forest text-nature-cream hover:bg-primary transition-colors duration-300 shadow-md">
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={scrollNext} className="flex items-center justify-center w-10 h-10 rounded-full bg-nature-forest text-nature-cream hover:bg-primary transition-colors duration-300 shadow-md">
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    )
}