import HeroVideo from "@/components/hero/HeroVideo";
import VerticalReels from "@/components/lifestyle/VerticalReels";
import InteractiveMap from "@/components/masterplan/InteractiveMap";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { ZoomParallax } from "@/components/ui/zoom-parallax";

/**
 * Landing Page — Aurum Real Estate
 *
 * Architecture:
 *  1. SmoothScrollProvider  — react-lenis wraps the entire page for Porsche-like scroll
 *  2. HeroVideo             — Full-screen cinematic hero with parallax video
 *  3. VerticalReels         — Horizontal scroll of 9:16 amenity cards (Framer Motion)
 *  4. InteractiveMap        — Masterplan with clickable lot pins + modal gallery
 */
export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="flex flex-col w-full bg-[#0C0A09]">
        {/* ── 1. Hero ── */}
        <HeroVideo />

        {/* ── 2. Zoom Parallax Gallery ── */}
        <ZoomParallax
          images={[
            { src: "/foto-1.jpg", alt: "AguaVista foto 1" },
            { src: "/foto-2.jpg", alt: "AguaVista foto 2" },
            { src: "/foto-3.jpg", alt: "AguaVista foto 3" },
            { src: "/foto-4.jpg", alt: "AguaVista foto 4" },
            { src: "/foto-5.jpg", alt: "AguaVista foto 5" },
            { src: "/foto-6.jpg", alt: "AguaVista foto 6" },
            { src: "/foto-7.jpg", alt: "AguaVista foto 7" },
          ]}
        />

        {/* ── 3. Lifestyle / Amenities ── */}
        <VerticalReels />

        {/* ── 3. Masterplan Interactivo ── */}
        <InteractiveMap />

        {/* ── Footer ── */}
        <footer className="relative w-full bg-[#0C0A09] border-t border-[#292524] py-16 px-8 md:px-16">
          {/* Gold top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(201,169,98,0.4), transparent)",
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="font-[family-name:var(--font-cormorant)] text-2xl font-light tracking-[0.3em] text-[#FAFAF9] uppercase"
                >
                  Aurum
                </span>
                <span className="w-px h-4 bg-[#C9A962]/40" aria-hidden="true" />
                <span className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#A8A29E] uppercase">
                  Real Estate
                </span>
              </div>
              <p className="font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.06em] text-[#44403C] max-w-xs leading-relaxed">
                Residencias de ultra lujo para quienes no aceptan compromisos.
                Desde USD 1.000.000.
              </p>
            </div>

            {/* Links */}
            <nav
              className="flex flex-wrap gap-x-8 gap-y-3"
              aria-label="Navegación del footer"
            >
              {[
                "Propiedades",
                "Masterplan",
                "Amenities",
                "Galería",
                "Contacto",
                "Privacidad",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.2em] text-[#44403C] uppercase hover:text-[#C9A962] transition-colors duration-300 focus:outline-none focus:text-[#C9A962]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom row */}
          <div className="mt-12 pt-6 border-t border-[#1C1917] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] text-[#292524] uppercase">
              © {new Date().getFullYear()} Aurum Real Estate. Todos los derechos reservados.
            </span>
            <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] text-[#292524] uppercase">
              Diseño Premium · Construido con Next.js
            </span>
          </div>
        </footer>
      </main>
    </SmoothScrollProvider>
  );
}
