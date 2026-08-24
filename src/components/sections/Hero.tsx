"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { SplitText } from "@/components/motion/SplitText";
import { EASE_LUX } from "@/components/motion/Reveal";
import { AMENITIES } from "@/data/amenities";

/**
 * Hero con video de fondo y parallax.
 *
 * Estrategia de carga (esto es lo que decide el LCP de toda la página):
 * el poster es un <Image priority> que se descarga como recurso crítico,
 * y el micro-loop de 14s (1,98 MB) lo pide LoopVideo recién cuando la
 * sección entra en viewport, pausándose sola al salir. Antes era un
 * video de 17 MB con autoPlay que se llevaba el LCP por delante.
 */
export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
  const ta = useTranslations("amenities.items");
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // El fondo se mueve menos que el contenido: eso es el parallax.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-label="AguaVista"
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Fondo ── */}
      <motion.div
        style={reduceMotion ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/banner-poster.webp"
          alt={t("videoAlt")}
          fill
          // El único priority de la página: es el LCP.
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className="object-cover"
        />

        {/* Decorativo: la información visual ya la aporta el poster de
            arriba, que sí lleva alt. Sin label queda aria-hidden. */}
        <LoopVideo
          src="/banner.mp4"
          poster="/banner-poster.webp"
          className="absolute inset-0 size-full motion-safe:animate-[av-fade-up_1.2s_ease-out]"
        />

        {/* Velo de contraste: garantiza AA para el texto blanco encima
            sin importar qué frame del video esté visible. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[#050D09]/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, rgba(5,13,9,.55) 100%), linear-gradient(to bottom, rgba(5,13,9,.5) 0%, transparent 25%, transparent 55%, var(--av-base) 100%)",
          }}
        />
      </motion.div>

      {/* ── Contenido ── */}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-24 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE_LUX }}
          className="av-kicker mb-6 block text-[#C8E88A]"
        >
          {t("kicker")}
        </motion.span>

        <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[1.02] tracking-[-0.01em] text-white">
          <SplitText text={t("title")} immediate delay={0.35} className="block" />
          <SplitText
            text={t("titleAccent")}
            immediate
            delay={0.55}
            className="block italic text-[#C8E88A]"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95, ease: EASE_LUX }}
          className="mt-7 max-w-xl text-balance font-sans text-sm font-light leading-relaxed text-white/75 md:text-base"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15, ease: EASE_LUX }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button href="#lotes" variant="primary" size="lg">
            {t("ctaPrimary")}
          </Button>
          <Button href="#amenities" variant="secondary" size="lg">
            {t("ctaSecondary")}
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Accesos rápidos a amenities ── */}
      <motion.ul
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 1.35, ease: EASE_LUX }}
        aria-label={t("ctaSecondary")}
        className="relative z-10 mt-14 flex w-full max-w-5xl snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center md:overflow-visible"
      >
        {AMENITIES.slice(0, 6).map((amenity) => (
          <li key={amenity.id} className="shrink-0 snap-start">
            <a
              href="#amenities"
              className="group relative flex h-24 w-28 flex-col items-center justify-end gap-1.5 overflow-hidden rounded-2xl border border-white/15 p-3 transition-colors duration-500 hover:border-[color:var(--av-vivo)] md:h-28 md:w-32"
            >
              <Image
                src={amenity.image}
                alt=""
                fill
                sizes="128px"
                quality={55}
                loading="lazy"
                className="object-cover opacity-45 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:opacity-70"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#050D09]/85 to-transparent" />
              <span className="relative z-10 font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white">
                {ta(`${amenity.id}.title`)}
              </span>
            </a>
          </li>
        ))}
      </motion.ul>

      {/* ── Indicador de scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
        aria-hidden="true"
        className="absolute bottom-6 right-6 z-10 hidden flex-col items-center gap-3 md:right-10 md:flex"
      >
        <span
          className="font-sans text-[9px] font-light uppercase tracking-[0.3em] text-white/60"
          style={{ writingMode: "vertical-rl" }}
        >
          {tc("scroll")}
        </span>
        <motion.span
          animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-12 w-px bg-gradient-to-b from-[color:var(--av-vivo)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
