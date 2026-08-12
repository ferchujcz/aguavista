import HeroVideo from "@/components/hero/HeroVideo";
import VerticalReels from "@/components/lifestyle/VerticalReels";
import InteractiveMap from "@/components/masterplan/InteractiveMap";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Preloader from "@/components/ui/preloader";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { ZoneGallery } from "@/components/ui/zone-gallery";
import { Navbar } from "@/components/ui/navbar";
import { VirtualTour } from "@/components/ui/virtual-tour";
import { FAQ } from "@/components/ui/faq"; // <-- IMPORTAMOS EL NUEVO FAQ

const CRITICAL_IMAGES = [
  "/foto-1.webp",
  "/foto-2.webp",
];

export default function Home() {
  return (
    <Preloader images={CRITICAL_IMAGES}>
      <SmoothScrollProvider>
        <main className="flex flex-col w-full bg-[#0C0A09]">
          <Navbar />
          
          {/* ── 1. Inicio ── */}
          <div id="inicio">
            <HeroVideo />
          {/* ── 2. Zoom Parallax Gallery ── */}
          <ZoomParallax
            images={[
              // Le pasamos la foto del avión (o la que quieras) + la orden de hacerla tarjeta (isText: true)
              { src: "/aero1.webp", isText: true },
              
              // Las demás fotos quedan normales
              { src: "/foto-2.webp", alt: "AguaVista foto 2" },
              { src: "/foto-3.webp", alt: "AguaVista foto 3" },
              { src: "/foto-4.webp", alt: "AguaVista foto 4" },
              { src: "/foto-5.webp", alt: "AguaVista foto 5" },
              { src: "/foto-6.webp", alt: "AguaVista foto 6" },
              { src: "/foto-7.webp", alt: "AguaVista foto 7" },
            ]}
          />
          </div>

          {/* ── 2. Instalaciones (Con los Reels) ── */}
          <ZoneGallery />

          {/* ── Lifestyle (Opcional, lo podés dejar acá o sacarlo) ── */}
          <VerticalReels />

          {/* ── 3. Propiedades ── */}
          <div id="propiedades">
            {/* <InteractiveMap />*/}
            <VirtualTour />
          </div>

          {/* ── 4. Contacto (Estructura Lista) ── */}
          <section id="contacto" className="py-32 w-full flex flex-col items-center justify-center border-t border-[#1C1917] bg-[#0C0A09]">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-[#FAFAF9] font-medium mb-8">
              Queres saber más
            </h2>
            <button 
              type="button"
              className="bg-[#FAFAF9] text-[#0C0A09] font-[family-name:var(--font-josefin)] text-sm md:text-base font-medium tracking-[0.1em] px-16 py-4 hover:bg-[#C9A962] hover:text-[#FAFAF9] transition-colors duration-300 shadow-lg"
            >
              contactarnos
            </button>
          </section>
          {/* ── 5. Preguntas Frecuentes ── */}
          <FAQ />

          {/* ── Footer ── */}
          <footer className="relative w-full bg-[#0C0A09] border-t border-[#292524] py-16 px-8 md:px-16">
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(201,169,98,0.4), transparent)",
              }}
              aria-hidden="true"
            />

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light tracking-[0.3em] text-[#FAFAF9] uppercase">
                    
                  </span>
                  <span className="w-px h-4 bg-[#C9A962]/40" aria-hidden="true" />
                  <span className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#A8A29E] uppercase">
                    
                  </span>
                </div>
                <p className="font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.06em] text-[#44403C] max-w-xs leading-relaxed">

                </p>
              </div>

              <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Navegación del footer">
                {[
                  "Inicio",
                  "Instalaciones",
                  "Propiedades",
                  "Contacto",
                  "FAQ",
                ].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.2em] text-[#44403C] uppercase hover:text-[#C9A962] transition-colors duration-300 focus:outline-none focus:text-[#C9A962]"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-12 pt-6 border-t border-[#1C1917] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] text-[#292524] uppercase">
                © {new Date().getFullYear()} 
              </span>
              <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] text-[#292524] uppercase">
                
              </span>
            </div>
          </footer>
        </main>
      </SmoothScrollProvider>
    </Preloader>
  );
}