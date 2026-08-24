"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { AMENITIES, type Amenity } from "@/data/amenities";
import { Reveal, StaggerGroup, staggerChild } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

/** Tarjeta con imagen que hace zoom y reel que arranca en hover. */
function AmenityCard({ amenity, index }: { amenity: Amenity; index: number }) {
  const t = useTranslations("amenities.items");
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.li
      variants={staggerChild}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[color:var(--av-border-soft)]",
        "transition-[border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-[color:var(--av-vivo)]/50 hover:shadow-av-lg",
        amenity.featured ? "sm:col-span-2 sm:row-span-1" : ""
      )}
    >
      <div className={cn("relative w-full", amenity.featured ? "aspect-[16/10]" : "aspect-[3/4]")}>
        {/* Skeleton debajo de la imagen: cubre el hueco mientras carga
            en vez de dejar un rectángulo vacío que salta al aparecer. */}
        {!loaded && <div aria-hidden="true" className="av-skeleton absolute inset-0" />}

        <Image
          src={amenity.image}
          alt={t(`${amenity.id}.title`)}
          fill
          // Las 2 primeras entran en viewport casi seguro; el resto espera.
          loading={index < 2 ? "eager" : "lazy"}
          sizes={
            amenity.featured
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 640px"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 320px"
          }
          quality={70}
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:scale-[1.07]",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />

        {amenity.video && (
          // mode="hover": el reel no se descarga ni se decodifica hasta
          // que hay intención real de verlo, y se pausa al salir el
          // cursor o al salir la tarjeta de pantalla.
          <LoopVideo
            src={amenity.video}
            poster={amenity.image}
            mode="hover"
            play={hovered}
            className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {/* Degradado de legibilidad. Se intensifica en hover para que el
            texto no compita con el video en movimiento. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#050D09] via-[#050D09]/25 to-transparent opacity-85 transition-opacity duration-700 group-hover:opacity-95"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="font-display text-2xl font-normal uppercase leading-tight tracking-wide text-white md:text-[1.75rem]">
          {t(`${amenity.id}.title`)}
        </h3>
        {/* La descripción sube y aparece en hover: la grilla queda limpia
            en reposo y el detalle está a un gesto de distancia. */}
        <p className="mt-2 max-w-sm font-sans text-[13px] font-light leading-relaxed text-white/0 transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white/80 md:translate-y-2 md:group-hover:translate-y-0">
          {t(`${amenity.id}.description`)}
        </p>
        <span
          aria-hidden="true"
          className="mt-4 block h-px w-0 bg-[color:var(--av-vivo)] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-14"
        />
      </div>
    </motion.li>
  );
}

export function Amenities() {
  const t = useTranslations("amenities");

  return (
    <section id="amenities" className="av-glow relative bg-base py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <header className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <Reveal>
            <span className="av-kicker">{t("kicker")}</span>
          </Reveal>
          <SplitText
            as="h2"
            text={t("title")}
            className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.08] text-ink"
          />
          <Reveal delay={0.15}>
            <p className="mt-5 text-balance font-sans text-sm font-light leading-relaxed text-ink-muted md:text-base">
              {t("subtitle")}
            </p>
          </Reveal>
        </header>

        <StaggerGroup>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AMENITIES.map((amenity, i) => (
              <AmenityCard key={amenity.id} amenity={amenity} index={i} />
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
