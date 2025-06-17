import { Separator } from "@/components/ui/separator";

export function MainHeader() {
    return (
        <header className="text-center pb-8 md:pb-12">
          {/* Diseño elegante inspirado en la imagen */}
          <div className="max-w-4xl mx-auto">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-secondary-dark tracking-[0.2em] mb-4">
                ADORACIÓN PURA
              </h3>

              <div className="flex items-center justify-center gap-4 pb-4">
                <Separator className="w-32 md:w-48 lg:w-64 h-px bg-secondary-dark" />
                <span className="text-xl md:text-2xl font-light text-secondary-dark/80">2025</span>
                <Separator className="w-32 md:w-48 lg:w-64 h-px bg-secondary-dark" />
              </div>

              <h2 className="text-md md:text-base font-medium text-secondary-dark tracking-[0.15em]">
                ASAMBLEA REGIONAL DE LOS TESTIGOS DE JEHOVÁ
              </h2>
          </div>

          <p className="text-secondary-dark/80 text-lg max-w-3xl mx-auto pt-8">
            Descubra información sobre diferentes rubros que pueden serle de utilidad durante los días de asamblea.
          </p>
        </header>
    )
}