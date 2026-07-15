'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';
import Image from 'next/image';

const ZONES = [
  { id: 'golf', title: 'Zona Golf', cover: '/golf.webp', description: 'Campo de 60 hectáreas diseñado para el máximo disfrute, rodeado de naturaleza y vistas inigualables. El escenario perfecto para tu estilo de vida.' },
  { id: 'playa', title: 'Zona Playa', cover: '/playa.webp', description: 'Relájate en nuestra exclusiva playa privada. Un oasis de arena y sol pensado para quienes buscan descansar sin salir de casa.' },
  { id: 'nautica', title: 'Zona Náutica', cover: '/nautica.webp', description: 'Bahía privada con acceso directo para tus embarcaciones. Vive la experiencia de tener el río literalmente a tus pies.' },
  { id: 'aeropuerto', title: 'Zona Aeropuerto', cover: '/aeropuerto.webp', description: 'Conectividad absoluta. Pistas e infraestructura de primer nivel para llegadas y salidas rápidas, con total privacidad.' },
  { id: 'spa', title: 'Spa & Bienestar', cover: '/spa.webp', description: 'Desconexión total. Un salón de belleza y spa diseñado para renovar cuerpo y mente sin salir de tu comunidad.' },
  { id: 'tenis', title: 'House del Tenis', cover: '/tenis.webp', description: 'Canchas deportivas de primer nivel y un entorno social exclusivo en nuestro restaurante gourmet con salón privado.' },
];

export function ZoneGallery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // ── Estados para el Control del Drag y el Loop ──
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  
  const setRef = useRef<HTMLDivElement>(null);
  const xTranslation = useMotionValue(0);

  // Calculamos el ancho exacto de 1 solo set de imágenes para saber cuándo reiniciar el bucle
  useEffect(() => {
    const measure = () => {
      if (setRef.current) {
        setSingleSetWidth(setRef.current.offsetWidth);
        // Iniciamos en el Set 2 para que puedas arrastrar hacia la izquierda (hacia atrás) de inmediato
        if (xTranslation.get() === 0) {
           xTranslation.set(-setRef.current.offsetWidth);
        }
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [xTranslation]);

  // Motor del Loop Infinito (60fps)
  useAnimationFrame(() => {
    if (!singleSetWidth) return;
    let currentX = xTranslation.get();

    // Si no estamos arrastrando ni con el mouse encima, avanza solo
    if (!isDragging && !isHovered) {
      currentX -= 1; // Velocidad. Aumenta a 2 o 3 si lo quieres más rápido
    }

    // MAGIA: El reseteo infinito. (Solo resetea cuando NO estás arrastrando para evitar tirones en el mouse)
    if (!isDragging) {
        // Si avanzó hasta el Set 3, lo devolvemos al Set 2 de forma invisible
        if (currentX <= -singleSetWidth * 2) {
            currentX += singleSetWidth;
        } 
        // Si arrastraste hacia atrás y llegaste al Set 1, lo devolvemos al Set 2
        else if (currentX >= 0) {
            currentX -= singleSetWidth;
        }
    }

    xTranslation.set(currentX);
  });

  // ── Fondo Parallax ──
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#0C0A09] py-32 overflow-hidden" id="amenities">
      
      {/* Fondo Texturizado */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div style={{ y: backgroundY }} className="absolute -top-[10%] left-0 w-full h-[120%]">
          <Image src="/golf.webp" alt="Fondo" fill className="object-cover opacity-15" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09] via-transparent to-[#0C0A09]" />
        </motion.div>
      </div>

      {/* ── Textos Animados ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', y: 50 }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
        className="relative z-10 mb-16 flex flex-col items-center justify-center text-center px-4"
      >
        <span className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#C9A962] uppercase mb-4">
          Estilo de vida inigualable
        </span>
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-7xl text-[#FAFAF9] font-light">
          Zonas Exclusivas
        </h2>
      </motion.div>

      {/* ── Carrusel (Drag Libre + Loop) ── */}
      <div className="relative z-10 w-full pl-4 md:pl-16">
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-[#0C0A09] to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#0C0A09] to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing">
          <motion.div
            style={{ x: xTranslation }}
            drag="x"
            // ¡NO HAY LIMITES DE DRAG! Arrastra todo lo que quieras
            dragElastic={0}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex w-max"
          >
            {/* Renderizamos 4 copias idénticas para que nunca falten tarjetas */}
            {[1, 2, 3, 4].map((copyIndex) => (
              <div
                key={copyIndex}
                // Solo usamos la primera copia para medir el ancho matemático
                ref={copyIndex === 1 ? setRef : null}
                className="flex w-max gap-4 md:gap-8 pr-4 md:pr-8"
              >
                {ZONES.map((zone) => (
                  <motion.div
                    key={`${zone.id}-${copyIndex}`}
                    onClick={() => setSelectedId(zone.id)}
                    className="relative h-[450px] md:h-[600px] w-[300px] md:w-[450px] flex-shrink-0 overflow-hidden rounded-sm group"
                  >
                    <div className="relative w-full h-full pointer-events-none">
                      <Image 
                        src={zone.cover} 
                        alt={zone.title} 
                        fill 
                        draggable={false} // Evita el bug del navegador de "arrastrar imagen"
                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                        sizes="(max-width: 768px) 100vw, 33vw" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                    </div>
                    
                    <div className="absolute bottom-10 left-8 right-8 pointer-events-none">
                      <h3 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-white">{zone.title}</h3>
                      <p className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962] mt-3 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">Ver detalles</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Modal Expansivo ── */}
      <AnimatePresence>
        {selectedId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md cursor-pointer" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
              {ZONES.map((zone) => {
                if (zone.id !== selectedId) return null;
                return (
                  <motion.div key={`modal-${zone.id}`} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }} className="relative w-full max-w-5xl h-[80vh] md:h-[70vh] bg-[#1C1917] flex flex-col md:flex-row overflow-hidden pointer-events-auto rounded-sm border border-[#292524]">
                    <div className="relative w-full md:w-3/5 h-1/2 md:h-full"><Image src={zone.cover} alt={zone.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" /></div>
                    <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative">
                      <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 text-[#A8A29E] hover:text-white transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                      <h3 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-white mb-6">{zone.title}</h3>
                      <p className="font-[family-name:var(--font-josefin)] text-sm md:text-base text-[#A8A29E] leading-relaxed mb-8">{zone.description}</p>
                      <button onClick={() => setSelectedId(null)} className="self-start uppercase tracking-widest text-[10px] border-b border-[#C9A962] text-[#C9A962] pb-1 hover:text-white hover:border-white transition-colors">Volver al recorrido</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}