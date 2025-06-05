import { HeroSection } from "../src/components/home/HeroSection/HeroSection"
import { EventsCarousel } from "../src/components/home/EventsCarousel/EventsCarousel"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-nature-light">
      <HeroSection />
      <EventsCarousel />
    </main>
  )
}
