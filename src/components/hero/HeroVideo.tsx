"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroVideoProps {
  /** URL of the background video (mp4 recommended) */
  videoSrc?: string;
  /** Fallback poster image while video loads */
  posterSrc?: string;
  /** Main headline — split into two lines for dramatic effect */
  headlineTop?: string;
  headlineBottom?: string;
  /** Overline label above the headline */
  overline?: string;
  /** Subtext below the headline */
  subtext?: string;
  /** Primary CTA label */
  ctaLabel?: string;
  /** Secondary CTA label */
  ctaSecondaryLabel?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroVideo({
  videoSrc = "/banner.mp4",
  posterSrc = "",
  headlineTop = "AGUAVISTA",
  headlineBottom = "",
  overline = "AguaVista Airport Executive",
  subtext = "La experiencia de vivir con carácter y exclusividad.",
  ctaLabel = "Explorar Propiedades",
  ctaSecondaryLabel = "Ver Masterplan",
  className,
}: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax: video moves slower than scroll
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
      aria-label="Hero — Residencias de Ultra Lujo"
      className={cn(
        "relative w-full h-screen min-h-[600px] overflow-hidden flex items-end",
        className
      )}
    >
      {/* ── Video Background ── */}
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
          disablePictureInPicture
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Multi-layer dark overlay for cinematic depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(12,10,9,0.97) 0%, rgba(12,10,9,0.55) 40%, rgba(12,10,9,0.15) 70%, rgba(12,10,9,0.05) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Subtle vignette on sides */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(12,10,9,0.6) 100%)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ── Decorative gold line — top ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A962]/60 to-transparent origin-left"
        aria-hidden="true"
      />

      {/* ── Navigation hint ── */}
      <div className="absolute top-8 left-0 right-0 flex items-center justify-between px-8 md:px-16 z-20">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-3"
        >
          {/* Logo wordmark */}
          <span
            className="font-[family-name:var(--font-cormorant)] text-xl font-light tracking-[0.3em] text-[#FAFAF9] uppercase"
            style={{ letterSpacing: "0.3em" }}
          >
            Aurum
          </span>
          <span className="w-px h-4 bg-[#C9A962]/50" aria-hidden="true" />
          <span
            className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#A8A29E] uppercase"
          >
            Real Estate
          </span>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden md:flex items-center gap-8"
          aria-label="Navegación principal"
        >
          {["Propiedades", "Masterplan", "Amenities", "Contacto"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.2em] text-[#A8A29E] uppercase hover:text-[#C9A962] transition-colors duration-300 focus:outline-none focus:text-[#C9A962]"
              >
                {item}
              </a>
            )
          )}
        </motion.nav>
      </div>

      {/* ── Main Content ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full px-8 md:px-16 pb-20 md:pb-28"
      >
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-[family-name:var(--font-josefin)] text-[10px] md:text-[11px] font-light tracking-[0.35em] text-[#C9A962] uppercase mb-6"
        >
          {overline}
        </motion.p>

        {/* Headline */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light leading-[0.9] tracking-tight text-[#FAFAF9]"
          >
            {headlineTop}
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light leading-[0.9] tracking-tight text-[#FAFAF9] italic"
          >
            {headlineBottom}
          </motion.h1>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-px bg-[#C9A962] mb-8 origin-left"
          aria-hidden="true"
        />

        {/* Subtext + CTAs row */}
        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-josefin)] text-sm font-light tracking-[0.08em] text-[#A8A29E] max-w-xs leading-relaxed"
          >
            {subtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            {/* Primary CTA */}
            <a
              href="#propiedades"
              className={cn(
                "group relative inline-flex items-center gap-3",
                "font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.25em] uppercase",
                "px-8 py-4 border border-[#C9A962] text-[#C9A962]",
                "overflow-hidden transition-colors duration-500",
                "hover:text-[#0C0A09] focus:outline-none focus:ring-1 focus:ring-[#C9A962]"
              )}
            >
              <span className="absolute inset-0 bg-[#C9A962] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" aria-hidden="true" />
              <span className="relative z-10">{ctaLabel}</span>
              <span className="relative z-10 w-4 h-px bg-current transition-all duration-300 group-hover:w-6" aria-hidden="true" />
            </a>

            {/* Secondary CTA */}
            <a
              href="#masterplan"
              className={cn(
                "font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.25em] uppercase",
                "text-[#A8A29E] hover:text-[#FAFAF9] transition-colors duration-300",
                "flex items-center gap-2 focus:outline-none focus:text-[#FAFAF9]"
              )}
            >
              {ctaSecondaryLabel}
              <span className="w-3 h-px bg-current" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-8 right-8 md:right-16 z-10 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span
          className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.3em] text-[#A8A29E] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-[#C9A962]/80 to-transparent"
        />
      </motion.div>

      {/* ── Property count badge ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 z-10 hidden lg:flex flex-col items-end gap-1"
        aria-label="Estadísticas"
      >
        <span className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#FAFAF9]">
          24
        </span>
        <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.25em] text-[#A8A29E] uppercase">
          Residencias
        </span>
        <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.25em] text-[#A8A29E] uppercase">
          Disponibles
        </span>
      </motion.div>
    </section>
  );
}
