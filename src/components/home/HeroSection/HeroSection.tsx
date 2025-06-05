export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image - usando la imagen real del banner */}
      <div
        className="relative h-[450px] sm:h-[500px] md:h-[600px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/banner.jpg')",
        }}
      >
        {/* Gradiente de transición en la parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-nature-light/80" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-nature-light" />
      </div>
    </section>
  )
}
