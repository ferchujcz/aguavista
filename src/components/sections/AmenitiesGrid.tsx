"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ResolvedAmenity } from "@/lib/amenities";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { EASE_LUX } from "@/components/motion/Reveal";
import { organicDelay } from "@/components/motion/SlideUp";
import { cn } from "@/lib/utils";

/** Curva del morph entre grid y detalle. Más lenta que un hover normal:
 *  el elemento recorre media pantalla y necesita tiempo para leerse. */
const MORPH = { type: "spring" as const, stiffness: 210, damping: 30, mass: 0.9 };

/* ── Tarjeta del grid ────────────────────────────────────────────── */

function GridCard({
  amenity,
  index,
  isActive,
  onOpen,
}: {
  amenity: ResolvedAmenity;
  index: number;
  isActive: boolean;
  onOpen: () => void;
}) {
  const t = useTranslations("amenities");
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.li
      // Aparición escalonada orgánica al entrar la grilla en viewport.
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, ease: EASE_LUX, delay: organicDelay(index, 0.07) }}
      className={amenity.featured ? "sm:col-span-2" : ""}
    >
      {/* layoutId es el pegamento del morph: framer reconoce que esta
          tarjeta y el panel expandido son el MISMO elemento y anima la
          transición de posición y tamaño entre ambos. Mientras hay uno
          activo, el del grid se oculta para no duplicar el shared element. */}
      <motion.button
        type="button"
        layoutId={`amenity-card-${amenity.id}`}
        onClick={onOpen}
        aria-label={t("open", { name: amenity.title })}
        style={{ visibility: isActive ? "hidden" : "visible" }}
        transition={MORPH}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl",
          "border border-[color:var(--av-border-soft)] text-left",
          "transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:border-[color:var(--av-vivo)]/50 focus-visible:border-[color:var(--av-vivo)]"
        )}
      >
        <motion.div
          layoutId={`amenity-media-${amenity.id}`}
          transition={MORPH}
          className={cn("relative w-full", amenity.featured ? "aspect-[16/10]" : "aspect-[3/4]")}
        >
          {!loaded && <div aria-hidden="true" className="av-skeleton absolute inset-0" />}

          {/* El contenedor NO cambia de tamaño en hover: solo la imagen
              interna hace zoom. Es lo que evita que la grilla se sacuda. */}
          <Image
            src={amenity.image}
            alt={amenity.title}
            fill
            loading={index < 2 ? "eager" : "lazy"}
            sizes={
              amenity.featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 640px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 320px"
            }
            quality={70}
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              "group-hover:scale-105",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#050D09] via-[#050D09]/20 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-90"
          />
        </motion.div>

        {/* Título sobreimpreso — el estado base es solo eso, sin descripción. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <motion.h3
            layoutId={`amenity-title-${amenity.id}`}
            transition={MORPH}
            className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-white"
          >
            {amenity.title}
          </motion.h3>

          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full border border-white/35 text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-hover:border-[color:var(--av-vivo)] group-hover:text-[color:var(--av-vivo)]"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
          </span>
        </div>
      </motion.button>
    </motion.li>
  );
}

/* ── Panel expandido ─────────────────────────────────────────────── */

function ExpandedCard({
  amenity,
  onClose,
}: {
  amenity: ResolvedAmenity;
  onClose: () => void;
}) {
  const t = useTranslations("amenities");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-8">
      {/* Fondo. Clic afuera cierra. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050D09]/80 backdrop-blur-sm"
      />

      <motion.div
        // Mismo layoutId que la tarjeta del grid: framer interpola
        // posición, tamaño y radio entre las dos, así que al abrir crece
        // desde su lugar exacto y al cerrar vuelve ahí sin cortes.
        layoutId={`amenity-card-${amenity.id}`}
        transition={MORPH}
        role="dialog"
        aria-modal="true"
        aria-label={amenity.title}
        className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[color:var(--av-glass-brd)] bg-[color:var(--av-surface)] shadow-av-lg md:flex-row"
      >
        <motion.div
          layoutId={`amenity-media-${amenity.id}`}
          transition={MORPH}
          className="relative aspect-[16/10] w-full shrink-0 md:aspect-auto md:h-auto md:w-1/2"
        >
          <Image
            src={amenity.image}
            alt={amenity.title}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            quality={78}
            className="object-cover"
          />

          {/* El reel arranca recién acá: en el grid no se descarga nada. */}
          {amenity.video && (
            <LoopVideo
              src={amenity.video}
              poster={amenity.image}
              className="absolute inset-0 size-full"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#050D09]/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[color:var(--av-surface)]"
          />
        </motion.div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-7 md:p-10">
          <motion.h3
            layoutId={`amenity-title-${amenity.id}`}
            transition={MORPH}
            className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-vivo"
          >
            {amenity.title}
          </motion.h3>

          {/* El contenido extra entra con un pequeño retraso: primero se
              acomoda la geometría, después aparece el texto. Si entran a
              la vez, el morph se lee sucio. */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.45, delay: 0.18, ease: EASE_LUX }}
          >
            <p className="mt-4 font-display text-[clamp(1.5rem,3.2vw,2.25rem)] font-light leading-tight text-ink">
              {amenity.description}
            </p>
            <div aria-hidden="true" className="av-hairline my-7" />
            <p className="font-sans text-[15px] font-light leading-[1.8] text-ink-muted">
              {amenity.descriptionLong}
            </p>
          </motion.div>
        </div>

        <motion.button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-[color:var(--av-glass-brd)] bg-[color:var(--av-base)]/60 text-ink backdrop-blur-md transition-colors duration-300 hover:border-[color:var(--av-vivo)] hover:text-vivo"
        >
          <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Grilla ──────────────────────────────────────────────────────── */

export function AmenitiesGrid({ items }: { items: ResolvedAmenity[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((a) => a.id === activeId) ?? null;

  const close = useCallback(() => setActiveId(null), []);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((amenity, i) => (
          <GridCard
            key={amenity.id}
            amenity={amenity}
            index={i}
            isActive={activeId === amenity.id}
            onOpen={() => setActiveId(amenity.id)}
          />
        ))}
      </ul>

      <AnimatePresence>
        {active && <ExpandedCard key={active.id} amenity={active} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
