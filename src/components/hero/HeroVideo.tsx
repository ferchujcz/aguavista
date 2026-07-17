"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HeroVideo({
  videoSrc = "/banner.mp4",
  posterSrc = "",
  className,
}: {
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-8%"]);

  return (
    <section
      ref={containerRef}
      aria-label="Hero — AguaVista"
      className={cn(
        "relative w-full h-screen min-h-[500px] overflow-hidden flex items-center justify-center text-center",
        className
      )}
    >
      {/* ── Fondo de Video con Filtro Oscuro ── */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 w-full h-[115%] -top-[7.5%]"
      >
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Capa mucho más oscura para que el texto se lea perfecto */}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(12,10,9,0.7) 100%)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ── Tu Logo Oficial (Segunda Imagen) ── */}
      <div className="absolute top-8 left-6 md:left-12 z-20 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-solari.png"
          alt="AguaVista Solari Bienes Raíces"
          className="h-10 md:h-14 w-auto object-contain drop-shadow-md"
        />
      </div>

      {/* ── Textos Principales (Nueva Tipografía) ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full px-4 flex flex-col items-center mt-20"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          // Cambiamos a Cormorant (la tipografía elegante) y le dimos más peso
          className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-wide text-[#FAFAF9] uppercase max-w-5xl leading-[1.1] mb-6 drop-shadow-2xl"
        >
          Viví en paz rodeado de un <br className="hidden md:block" /> entorno natural y acogedor
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          // El subtítulo en dorado para contrastar
          className="font-[family-name:var(--font-josefin)] text-xs sm:text-sm md:text-base font-light tracking-[0.25em] text-[#C9A962] uppercase drop-shadow-md"
        >
          Encontrá todo lo que necesitás en un mismo lugar
        </motion.p>
      </motion.div>

      {/* ── Indicador de Scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 right-8 md:right-12 z-10 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span
          className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.3em] text-[#FAFAF9] uppercase opacity-80"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white to-transparent opacity-80"
        />
      </motion.div>
    </section>
  );
}