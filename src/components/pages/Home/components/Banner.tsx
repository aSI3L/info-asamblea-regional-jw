import Image from "next/image"

interface BannerProps {
  url?: string,
  imageUrl: string
}

export function Banner({ url = "/placeholder.svg?height=400&width=600", imageUrl }: BannerProps) {
  const src = imageUrl !== "" ? imageUrl : url

  return (
    <section className="relative overflow-hidden">
      {/* Background Image - usando la imagen real del banner */}
      <div className="relative h-[450px] md:h-[600px]">
        <Image
          src={src}
          alt="Banner Asamblea Regional"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Gradiente de transición en la parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primaryColor-80" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-primaryColor" />
      </div>
    </section>
  )
}
