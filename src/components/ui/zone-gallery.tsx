'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Definimos la estructura de la galería para cada zona
const ZONES = [
  {
    id: 'aeropuerto',
    title: 'Zona Aeropuerto',
    cover: '/aero1.webp',
    media: [
      { type: 'video', src: '/aeropuertoreel.mp4' },
      { type: 'image', src: '/aero1.webp' },
      { type: 'image', src: '/aero2.webp' },
      { type: 'image', src: '/aero3.webp' },
    ]
  },
  {
    id: 'golf',
    title: 'Zona Golf',
    cover: '/golf1.webp',
    media: [
      { type: 'video', src: '/golfreel.mp4' },
      { type: 'image', src: '/golf1.webp' },
      { type: 'image', src: '/golf2.webp' },
    ]
  },
  {
    id: 'tenis',
    title: 'House del Tenis',
    cover: '/tenis1.webp',
    media: [
      { type: 'video', src: '/tenisreel.mp4' },
      { type: 'image', src: '/tenis1.webp' },
      { type: 'image', src: '/tenis2.webp' },
    ]
  },
  {
    id: 'spa',
    title: 'Spa & Bienestar',
    cover: '/spa1.webp', 
    media: [
      { type: 'video', src: '/spareel.mp4' }, 
      { type: 'image', src: '/spa1.webp' },
      { type: 'image', src: '/spa2.webp' },
    ]
  },
  {
    id: 'club',
    title: 'Club House & Eventos',
    cover: '/club1.webp', 
    media: [
      { type: 'video', src: '/clubreel.mp4' },
      { type: 'image', src: '/club1.webp' },
      { type: 'image', src: '/club2.webp' },
    ]
  },
  {
    id: 'nautica',
    title: 'Deportes Náuticos',
    cover: '/nautica1.webp', 
    media: [
      { type: 'video', src: '/nauticareel.mp4' },
      { type: 'image', src: '/nautica1.webp' },
      { type: 'image', src: '/nautica2.webp' },
    ]
  }
];

export function ZoneGallery() {
  const [activeZone, setActiveZone] = useState<typeof ZONES[0] | null>(null);
  
  // Referencia para controlar el scroll con los botones
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      // Calculamos cuánto scrollear dependiendo si es celu o PC
      const scrollAmount = window.innerWidth > 768 ? 420 : window.innerWidth * 0.85;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full bg-[#0C0A09] py-24 overflow-hidden" id="instalaciones">
      {/* ── PARCHE PARA OCULTAR LA BARRA DE SCROLL NATIVA ── */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabecera y Controles del Carrusel */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#C9A962] uppercase mb-4 block">
              Estilo de vida inigualable
            </span>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-[#FAFAF9] font-light">
              Nuestras Instalaciones
            </h2>
          </div>

          {/* Flechas de Navegación (Solo PC y Tablets grandes) */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[#292524] flex items-center justify-center text-[#A8A29E] hover:text-[#C9A962] hover:border-[#C9A962] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[#292524] flex items-center justify-center text-[#A8A29E] hover:text-[#C9A962] hover:border-[#C9A962] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* ── EL CARRUSEL PRINCIPAL ── */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
        >
          {ZONES.map((zone) => (
            <div 
              key={zone.id} 
              className="relative group cursor-pointer overflow-hidden border border-[#292524] h-[55vh] md:h-[65vh] w-[85vw] md:w-[400px] shrink-0 snap-center"
              onClick={() => setActiveZone(zone)}
            >
              {/* Imagen de fondo de la tarjeta */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${zone.cover})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col items-start">
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-white mb-2">
                  {zone.title}
                </h3>
                <span className="font-[family-name:var(--font-josefin)] text-[10px] tracking-[0.2em] text-[#C9A962] uppercase flex items-center gap-2 group-hover:text-white transition-colors">
                  Ver Detalles
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Sub-carrusel de Medios (Adentro de cada zona) */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setActiveZone(null)}
              className="absolute top-8 right-8 text-[#A8A29E] hover:text-[#C9A962] transition-colors z-50 flex items-center gap-2"
            >
              <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest">Cerrar</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h3 className="absolute top-8 left-8 font-[family-name:var(--font-cormorant)] text-3xl text-[#C9A962]">
              {activeZone.title}
            </h3>

            {/* Carrusel interno del Modal */}
            <div className="w-full max-w-[100vw] overflow-x-auto flex gap-6 px-8 md:px-24 snap-x snap-mandatory py-12 hide-scrollbar items-center">
              {activeZone.media.map((item, idx) => (
                <div 
                  key={idx} 
                  className="snap-center shrink-0 w-[80vw] md:w-[400px] h-[70vh] relative border border-[#292524] rounded-sm overflow-hidden flex items-center justify-center bg-[#0C0A09]"
                >
                  {item.type === 'video' ? (
                    <video 
                      src={item.src} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.src} 
                      alt={`${activeZone.title} media`} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <p className="font-[family-name:var(--font-josefin)] text-[10px] tracking-[0.2em] text-[#A8A29E] uppercase mt-4">
              Desliza para ver más
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}