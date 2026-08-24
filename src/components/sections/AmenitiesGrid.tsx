"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ResolvedAmenity } from "@/lib/amenities";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { EASE_LUX } from "@/components/motion/Reveal";
import { organicDelay } from "@/components/motion/SlideUp";
import { cn } from "@/lib/utils";

/** Curva del morph entre riel y detalle. Más lenta que un hover normal:
 *  el elemento recorre media pantalla y necesita tiempo para leerse. */
const MORPH = { type: "spring" as const, stiffness: 210, damping: 30, mass: 0.9 };

/* ── Tarjeta del riel ────────────────────────────────────────────── */

function RailCard({
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
      // Aparición escalonada orgánica. El índice se topea en 4 porque el
      // riel es horizontal: las tarjetas de más a la derecha entran en
      // viewport recién al desplazarlo, y arrastrar hasta ahí un retraso
      // acumulado de medio segundo se leería como un cuelgue.
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.85,
        ease: EASE_LUX,
        delay: organicDelay(Math.min(index, 4), 0.07),
      }}
      /* Ancho fijo + `flex-none` + `snap-start`: todas las tarjetas miden
         exactamente lo mismo en cada breakpoint y ninguna se encoge para
         acomodar a las demás. El ancho parcialmente visible de la última
         es lo que le dice al visitante que el riel sigue. */
      className="w-[68vw] flex-none snap-start sm:w-[43vw] md:w-[31vw] lg:w-[23vw] xl:w-[292px]"
    >
      {/* layoutId es el pegamento del morph: framer reconoce que esta
          tarjeta y el panel expandido son el MISMO elemento y anima la
          transición de posición y tamaño entre ambos. Mientras hay uno
          activo, el del riel se oculta para no duplicar el shared element. */}
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
        {/* Encuadre único para todas: 4/5 fijo. Antes las destacadas
            ocupaban dos columnas con 16/10, y eso era justo lo que
            desalineaba la fila. `featured` sigue existiendo en el modelo y
            en el panel, pero ya no cambia la geometría. */}
        <motion.div
          layoutId={`amenity-media-${amenity.id}`}
          transition={MORPH}
          className="relative aspect-[4/5] w-full"
        >
          {!loaded && <div aria-hidden="true" className="av-skeleton absolute inset-0" />}

          {/* El contenedor NO cambia de tamaño en hover: solo la imagen
              interna hace zoom. Es lo que evita que el riel se sacuda.
              `object-cover` recorta al encuadre en vez de deformar, así
              ninguna foto rompe la alineación horizontal. */}
          <Image
            src={amenity.image}
            alt={amenity.title}
            fill
            loading={index < 3 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 68vw, (max-width: 768px) 43vw, (max-width: 1024px) 31vw, 292px"
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
        // Mismo layoutId que la tarjeta del riel: framer interpola
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

          {/* El reel arranca recién acá: en el riel no se descarga nada. */}
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

/* ── Riel ────────────────────────────────────────────────────────── */

/**
 * Riel horizontal de amenities.
 *
 * Es una sola fila que no envuelve: ocho tarjetas del mismo ancho y del
 * mismo `aspect-[4/5]`, desplazables en horizontal. La versión anterior
 * era una grilla de cuatro columnas donde las destacadas ocupaban dos y
 * usaban 16/10, así que se armaban dos filas con alturas distintas —
 * exactamente lo que había que corregir.
 *
 * El desplazamiento es scroll nativo (gesto táctil, trackpad y rueda con
 * shift funcionan gratis) y las flechas son solo un atajo para mouse.
 */
export function AmenitiesGrid({ items }: { items: ResolvedAmenity[] }) {
  const t = useTranslations("amenities");
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((a) => a.id === activeId) ?? null;

  const railRef = useRef<HTMLUListElement>(null);
  // `null` = todavía no se midió. En ese estado las flechas no se pintan,
  // así no aparecen y desaparecen en el primer frame.
  const [edges, setEdges] = useState<{ start: boolean; end: boolean } | null>(null);

  const close = useCallback(() => setActiveId(null), []);

  /* ── Estado de los bordes ──
     Se recalcula en scroll y en resize. El margen de 2px absorbe el
     redondeo subpíxel de scrollWidth, que con zoom no entero deja el
     botón "siguiente" habilitado para siempre. */
  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft > 2,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  /** Avanza o retrocede una tarjeta, midiendo el paso real del riel. */
  const nudge = useCallback((direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    // El paso sale del ancho real de una tarjeta más el gap, no de un
    // número fijo: así sigue cayendo en el snap en cualquier breakpoint.
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first ? first.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }, []);

  return (
    <>
      <div className="relative">
        <ul
          ref={railRef}
          onScroll={measure}
          aria-label={t("kicker")}
          /* El margen negativo, más un padding igual y opuesto, hace que el
             riel se desplace de borde a borde del contenedor mientras la
             primera tarjeta sigue alineada con el encabezado. */
          className={cn(
            "av-rail -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-5",
            // scroll-padding corre el punto de anclaje del snap hasta el
            // borde del contenido. Sin esto el snapport arranca en el borde
            // del padding y la primera tarjeta se pegaria al canto de la
            // pantalla, desalineada del encabezado.
            "scroll-pl-5 py-1 md:-mx-10 md:gap-4 md:px-10 md:scroll-pl-10"
          )}
        >
          {items.map((amenity, i) => (
            <RailCard
              key={amenity.id}
              amenity={amenity}
              index={i}
              isActive={activeId === amenity.id}
              onOpen={() => setActiveId(amenity.id)}
            />
          ))}
        </ul>

        {/* ── Flechas ──
            Solo desde md: en touch el gesto es el control natural y un par
            de botones flotando encima de la primera y la última tarjeta
            solo taparían foto. En los extremos se deshabilitan en vez de
            desmontarse, para que no salten de lugar. Quedan fuera del
            recorrido de tabulación (`tabIndex={-1}` + contenedor
            `aria-hidden`) porque no aportan nada a quien navega con
            teclado: tabular las tarjetas ya desplaza el riel solo. */}
        {edges && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between md:flex"
            aria-hidden="true"
          >
            {(
              [
                ["prev", -1, edges.start, ChevronLeft, "-translate-x-1/2"],
                ["next", 1, edges.end, ChevronRight, "translate-x-1/2"],
              ] as const
            ).map(([key, dir, enabled, Icon, offset]) => (
              <button
                key={key}
                type="button"
                tabIndex={-1}
                onClick={() => nudge(dir)}
                disabled={!enabled}
                className={cn(
                  "pointer-events-auto grid size-11 place-items-center rounded-full",
                  "border border-[color:var(--av-glass-brd)] bg-[color:var(--av-base)]/85 text-ink",
                  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:border-[color:var(--av-vivo)] hover:text-vivo",
                  "disabled:pointer-events-none disabled:opacity-0",
                  offset
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <ExpandedCard key={active.id} amenity={active} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
