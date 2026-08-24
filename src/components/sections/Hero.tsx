"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { SplitText } from "@/components/motion/SplitText";
import { EASE_LUX } from "@/components/motion/Reveal";

/**
 * Hero con video de fondo y parallax.
 *
 * Estrategia de carga (esto es lo que decide el LCP de toda la página):
 * el poster es un <Image priority> que se descarga como recurso crítico,
 * y el micro-loop de 14s (1,98 MB) lo pide LoopVideo recién cuando la
 * sección entra en viewport, pausándose sola al salir.
 *
 * Sobre el apilado: el fondo va en `z-0` y el contenido en `z-10`, ambos
 * positivos y dentro del mismo contexto. La versión anterior mandaba el
 * fondo a `-z-10`, lo que lo empujaba detrás del contexto de apilado que
 * crea PageTransition y hacía que el video quedara tapado.
 *
 * `video` y `poster` llegan por props desde el server component de la
 * página, que los resuelve con getSettings(): así se pueden reemplazar
 * desde /admin/media sin tocar código. Los valores por defecto son los
 * archivos de /public, para que el componente siga siendo usable solo.
 */
export function Hero({
  video = "/banner.mp4",
  poster = "/banner-poster.webp",
}: {
  video?: string;
  poster?: string;
} = {}) {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
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
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Fondo ── */}
      <motion.div
        style={reduceMotion ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0"
      >
        {/* Poster: es el LCP. Se queda debajo del video y sirve de primer
            frame mientras el loop todavía no arrancó. */}
        <Image
          src={poster}
          alt={t("videoAlt")}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className="object-cover"
        />

        {/* Decorativo: la información visual ya la aporta el poster de
            arriba, que sí lleva alt. Sin label queda aria-hidden. */}
        <LoopVideo
          src={video}
          poster={poster}
          className="absolute inset-0 size-full"
        />

        {/* Velo de contraste. Deliberadamente liviano: al 55% + gradiente
            radial + fundido a color base, el video se leía como un bloque
            de color sólido. Ahora el metraje se ve y el texto igual
            mantiene contraste AA gracias al degradado de abajo. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[#050D09]/25" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              // Viñeta suave para separar el texto del centro…
              "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(5,13,9,.28) 0%, rgba(5,13,9,.05) 55%, transparent 100%)," +
              // …y fundido al fondo de página solo en el último cuarto,
              // para que la sección siguiente entre sin costura.
              "linear-gradient(to bottom, rgba(5,13,9,.45) 0%, transparent 22%, transparent 72%, var(--av-base) 100%)",
          }}
        />
      </motion.div>

      {/* ── Contenido ── */}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE_LUX }}
          className="av-kicker mb-6 block text-[#C8E88A] drop-shadow-[0_1px_8px_rgba(5,13,9,0.8)]"
        >
          {t("kicker")}
        </motion.span>

        <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[1.02] tracking-[-0.01em] text-white drop-shadow-[0_2px_20px_rgba(5,13,9,0.55)]">
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
          className="mt-7 max-w-xl text-balance font-sans text-sm font-light leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(5,13,9,0.7)] md:text-base"
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

      {/* ── Indicador de scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
        aria-hidden="true"
        className="absolute bottom-8 right-6 z-10 hidden flex-col items-center gap-3 md:right-10 md:flex"
      >
        <span
          className="font-sans text-[9px] font-light uppercase tracking-[0.3em] text-white/70"
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
