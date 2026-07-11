'use client';

import InkReveal from '@/components/ui/ink-reveal';
import { motion } from 'framer-motion';

export default function VerticalReels() {
  const reels = ['/reel.mp4', '/reel-1.mp4', '/reel-2.mp4', '/reel-3.mp4'];

  return (
    <section className="relative w-full bg-black cursor-crosshair">
      
      {/* Capa de Fondo (Sticky para que acompañe todo el alto de la sección) */}
      <div className="absolute inset-0 z-0">
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <img
            src="/foto-9.jpg"
            alt="Fondo Amenidades"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <InkReveal
            maskColor={[12, 12, 12]}
            brushSize={350}
            className="absolute inset-0 z-10"
          />
        </div>
      </div>

      {/* Contenedor Principal Z-20 */}
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-start px-4 md:px-10">
        
        {/* Izquierda: Grilla de Reels Desfasada (Scrollea normal) */}
        <div className="w-full md:w-[60%] flex gap-4 md:gap-8 py-32 pointer-events-auto">
          
          {/* Columna 1 de Reels (Arranca más abajo) */}
          <div className="flex flex-col gap-10 w-1/2 mt-32">
            {[reels[0], reels[2]].map((src) => (
              <motion.div 
                key={src}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5"
              >
                <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Derecha: Texto Fijo (Sticky) */}
        <div className="w-full md:w-[40%] h-screen sticky top-0 flex flex-col justify-center pl-0 md:pl-16 pointer-events-none">
          <motion.h2 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[#cda434] uppercase tracking-[0.2em] text-xs md:text-sm mb-4 font-semibold drop-shadow-md"
          >
            Lifestyle Exclusivo
          </motion.h2>
          
          <motion.h3 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl text-white font-serif leading-tight drop-shadow-2xl"
          >
            ¿Te gustaría vivir en el paraíso?
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-6 text-base md:text-lg max-w-md font-light"
          >
            Descubre cada detalle y siente la experiencia de AguaVista. Un ecosistema diseñado para quienes exigen lo extraordinario.
          </motion.p>
        </div>

      </div>
    </section>
  );
}
