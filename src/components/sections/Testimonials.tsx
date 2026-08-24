"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TESTIMONIALS } from "@/data/testimonials";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

export function Testimonials() {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  // Dirección del último cambio: decide si la tarjeta entra por izquierda
  // o por derecha, para que el gesto acompañe al botón que se apretó.
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const total = TESTIMONIALS.length;

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  /* Autoplay: se detiene con hover, con foco de teclado dentro de la
     región y si el usuario pidió menos movimiento. Un carrusel que sigue
     girando mientras alguien lee es una trampa de accesibilidad. */
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const current = TESTIMONIALS[index];
  // Fallback al español si falta la traducción de una cita puntual.
  const quote = current.quote[locale] ?? current.quote.es;
  const role = current.role[locale] ?? current.role.es;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
  };

  return (
    <section id="testimonios" className="av-glow relative bg-base py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 md:px-10">
        <header className="mb-12 text-center md:mb-16">
          <Reveal>
            <span className="av-kicker">{t("kicker")}</span>
          </Reveal>
          <SplitText
            as="h2"
            text={t("title")}
            className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.08] text-ink"
          />
          <Reveal delay={0.15}>
            <p className="mt-4 font-sans text-sm font-light text-ink-muted">{t("subtitle")}</p>
          </Reveal>
        </header>

        <Reveal delay={0.1}>
          <div
            ref={regionRef}
            // roledescription + aria-live avisan al lector de pantalla que
            // esto rota solo y anuncian cada tarjeta nueva sin robar el foco.
            role="region"
            aria-roledescription="carousel"
            aria-label={t("title")}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="av-glass relative overflow-hidden rounded-3xl p-8 shadow-av-lg md:p-14"
          >
            <Quote
              aria-hidden="true"
              className="absolute -right-4 -top-4 size-32 text-[color:var(--av-vivo)] opacity-[0.06] md:size-44"
              strokeWidth={1}
            />

            {/* min-h evita que el contenedor salte de alto entre citas de
                distinto largo mientras una entra y otra sale. */}
            <div className="relative min-h-[15rem] md:min-h-[13rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.blockquote
                  key={current.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  aria-live="polite"
                  className="flex flex-col gap-8"
                >
                  <p className="text-balance font-display text-[clamp(1.25rem,3.2vw,1.9rem)] font-light italic leading-[1.45] text-ink">
                    “{quote}”
                  </p>

                  <footer className="flex items-center gap-4">
                    {/* Monograma de iniciales: sirve de avatar hasta que
                        haya fotos reales, sin pedir una imagen extra. */}
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full border border-[color:var(--av-lux)]/35 font-display text-base text-lux"
                    >
                      {current.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <div className="flex flex-col">
                      <cite className="font-sans text-sm font-medium not-italic tracking-wide text-ink">
                        {current.name}
                      </cite>
                      <span className="font-sans text-[11px] font-light uppercase tracking-[0.16em] text-ink-muted">
                        {role}
                      </span>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* ── Controles ── */}
            <div className="mt-8 flex items-center justify-between gap-6 border-t border-[color:var(--av-border-soft)] pt-6">
              <ul className="flex items-center gap-2.5">
                {TESTIMONIALS.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(i, i > index ? 1 : -1)}
                      aria-label={t("goTo", { number: i + 1 })}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "h-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        i === index
                          ? "w-8 bg-[color:var(--av-vivo)]"
                          : "w-3 bg-[color:var(--av-border)] hover:bg-[color:var(--av-text-faint)]"
                      )}
                    />
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label={t("prev")}
                  className="grid size-10 place-items-center rounded-full border border-[color:var(--av-border)] text-ink-muted transition-colors duration-300 hover:border-[color:var(--av-vivo)] hover:text-vivo"
                >
                  <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={t("next")}
                  className="grid size-10 place-items-center rounded-full border border-[color:var(--av-border)] text-ink-muted transition-colors duration-300 hover:border-[color:var(--av-vivo)] hover:text-vivo"
                >
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
