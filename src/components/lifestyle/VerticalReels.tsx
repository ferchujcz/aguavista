'use client';

import InkReveal from '@/components/ui/ink-reveal';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function VerticalReels() {
  const reels = ['/reel.mp4', '/reel-1.mp4', '/reel-2.mp4', '/reel-3.mp4'];
  const sectionRef = useRef<HTMLElement>(null);

  // ── DEBUG FORENSE ──────────────────────────────────────────────────────────
  useEffect(() => {
    const logHeights = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionH = section.offsetHeight;
      const winH = window.innerHeight;
      console.log('[VerticalReels DEBUG]', {
        'section.offsetHeight': sectionH,
        'window.innerHeight': winH,
        'sección > ventana?': sectionH > winH,
        'ratio sección/ventana': (sectionH / winH).toFixed(2) + 'x',
      });
    };

    logHeights();
    window.addEventListener('scroll', logHeights, { passive: true });
    window.addEventListener('resize', logHeights);

    return () => {
      window.removeEventListener('scroll', logHeights);
      window.removeEventListener('resize', logHeights);
    };
  }, []);
  // ── FIN DEBUG ──────────────────────────────────────────────────────────────

  return (
    /*
     * CONTENEDOR PRINCIPAL
     * relative w-full min-h-screen h-auto bg-black
     * SIN overflow-hidden
     */
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen h-auto bg-black cursor-crosshair"
    >

      {/*
       * CAPA DE FONDO — absolute inset-0 h-full w-full z-0
       * Se estira exactamente hasta donde llegue el contenido del <section>
       * SIN sticky ni h-screen
       */}
      <div className="absolute inset-0 h-full w-full z-0 pointer-events-none">
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

      {/*
       * CONTENEDOR DE CONTENIDO
       *
       * ARQUITECTURA:
       * — Mobile (base): flex-col. El texto (order-1) aparece arriba con
       *   sticky top-0 para que quede fijo mientras el usuario scrollea los
       *   videos (order-2) debajo.
       *
       * — Desktop (md+): CSS Grid de 2 columnas [40% | 1fr].
       *   El texto ocupa la columna izquierda (col-start-1) y los reels la
       *   derecha (col-start-2). Ambas columnas comparten la misma fila del
       *   grid, por lo que la altura de la fila la dictan los reels.
       *   El texto NO tiene sticky ni fixed — es un elemento normal en el
       *   flujo del grid. Al hacer scroll, el texto sube y baja junto con
       *   toda la sección de forma completamente orgánica.
       *   El padding vertical (py-32) centra visualmente el texto dentro
       *   de la columna sin necesidad de posicionamiento especial.
       */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-[40%_1fr] md:items-start px-4 md:px-10">

        {/*
         * TEXTO — Mobile: order-1 (arriba), flujo normal
         *         Desktop: col-start-1, self-start para que NO se estire
         *         al alto de la fila del grid (que lo haría parecer fijo).
         *         Con self-start el bloque solo ocupa su altura natural y
         *         se desplaza con el scroll de la página.
         */}
        <div className="relative w-full py-16
                        md:col-start-1 md:row-start-1 md:py-32 md:self-start
                        flex flex-col justify-start md:justify-center md:pr-10
                        order-1 pointer-events-none">
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

        {/*
         * REELS — Mobile: order-2 (debajo del texto)
         *         Desktop: col-start-2, dicta la altura total de la fila del grid
         */}
        <div className="w-full h-auto md:col-start-2 md:row-start-1 pointer-events-auto order-2">

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

      </div>
    </section>
  );
}
