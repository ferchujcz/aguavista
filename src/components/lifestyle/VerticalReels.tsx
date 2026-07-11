'use client';

import InkReveal from '@/components/ui/ink-reveal';
import { motion } from 'framer-motion';

export default function VerticalReels() {
  const reels = ['/reel.mp4', '/reel-1.mp4', '/reel-2.mp4', '/reel-3.mp4'];

  return (
    /*
     * CONTENEDOR PRINCIPAL
     * - relative: necesario para que absolute children se posicionen aquí
     * - w-full: ancho completo
     * - min-h-screen h-auto: crece según el contenido (los reels dictan la altura)
     * - bg-black: fondo base
     * - cursor-crosshair: estilo visual
     * - SIN overflow-hidden: crítico para que sticky funcione
     */
    <section className="relative w-full min-h-screen h-auto bg-black cursor-crosshair">

      {/*
       * CAPA DE FONDO — absolute inset-0 h-full w-full
       * Al ser absolute con h-full, se estira exactamente hasta donde llegue
       * el contenido del <section> padre (que es h-auto).
       * El sticky interno mantiene el efecto visual mientras se hace scroll.
       */}
      <div className="absolute inset-0 h-full w-full z-0 pointer-events-none">
        <div className="sticky top-0 w-full h-screen">
          <img
            src="/foto-9.jpg"
            alt="Fondo Amenidades"
            decoding="async"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
          />
          <InkReveal
            maskColor={[12, 12, 12]}
            brushSize={350}
            className="absolute inset-0 z-10"
            style={{ pointerEvents: 'none', touchAction: 'none' }}
          />
        </div>
      </div>

      {/*
       * CONTENEDOR DE CONTENIDO
       * - relative z-10: sobre el fondo
       * - flex: layout horizontal en desktop
       * - max-w-7xl mx-auto px: centrado y padding
       * - SIN overflow-hidden: crítico para sticky
       */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start px-4 md:px-10">

        {/*
         * FLEX CHILD IZQUIERDA — Grilla de Reels
         * - flex-1 h-auto: crece según su contenido y dicta la altura total de la sección
         * - md:order-1: orden en desktop
         */}
        <div className="flex-1 h-auto md:order-1 pointer-events-auto">

          {/* Mobile: 2 columnas compactas */}
          <div className="flex md:hidden gap-3 py-10">
            {/* Columna 1 */}
            <div className="flex flex-col gap-3 w-1/2 mt-8">
              {[reels[0], reels[2]].map((src) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative w-full aspect-[9/16] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-white/5"
                >
                  <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
            {/* Columna 2 */}
            <div className="flex flex-col gap-3 w-1/2">
              {[reels[1], reels[3]].map((src) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative w-full aspect-[9/16] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-white/5"
                >
                  <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop: 2 columnas desfasadas con más espacio */}
          <div className="hidden md:flex gap-8 py-32">
            {/* Columna 1 de Reels (Arranca más abajo) */}
            <div className="flex flex-col gap-10 w-1/2 mt-32">
              {[reels[0], reels[2]].map((src) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5"
                >
                  <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>

            {/* Columna 2 de Reels (Arranca más arriba) */}
            <div className="flex flex-col gap-10 w-1/2">
              {[reels[1], reels[3]].map((src) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5"
                >
                  <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/*
         * FLEX CHILD DERECHA — Texto Sticky
         * - w-full md:w-[40%]: ancho en mobile y desktop
         * - sticky top-0 h-screen: se mantiene fijo en el viewport mientras dura el scroll de los reels
         * - flex flex-col justify-center: centra el texto verticalmente
         * - md:order-2: orden en desktop
         * - pointer-events-none: no interfiere con el InkReveal
         */}
        <div className="w-full md:w-[40%] py-12 md:py-0 sticky top-0 h-screen flex flex-col justify-center md:pl-16 md:order-2 pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-[#cda434] uppercase tracking-[0.2em] text-xs md:text-sm mb-3 md:mb-4 font-semibold drop-shadow-md"
          >
            Lifestyle Exclusivo
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-6xl text-white font-serif leading-tight drop-shadow-2xl"
          >
            ¿Te gustaría vivir en el paraíso?
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-4 md:mt-6 text-sm md:text-base lg:text-lg max-w-md font-light leading-relaxed"
          >
            Descubre cada detalle y siente la experiencia de AguaVista. Un ecosistema diseñado para quienes exigen lo extraordinario.
          </motion.p>
        </div>

      </div>
    </section>
  );
}
