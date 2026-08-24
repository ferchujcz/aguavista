"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { EASE_LUX } from "@/components/motion/Reveal";

/** Solo se muestra una vez por pestaña; navegar de vuelta no lo repite. */
const SESSION_KEY = "av:preloaded";
/** Tope duro: si un asset se cuelga, la cortina se va igual. */
const MAX_DURATION = 2600;
const MIN_DURATION = 900;

/**
 * Cortina de carga.
 *
 * Decisión clave: NO bloquea el render de children. El contenido se
 * pinta y se indexa siempre; esto es solo un overlay fixed que se
 * desvanece. La versión anterior hacía `if (!loaded) return <div/>`, lo
 * que dejaba a los crawlers viendo una página vacía y disparaba el LCP.
 */
export function Preloader() {
  const t = useTranslations("preloader");
  const tc = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Modo incógnito con storage bloqueado: se muestra igual.
    }

    /* Excepción deliberada a react-hooks/set-state-in-effect: la decisión
       de mostrar la cortina depende de sessionStorage y de la preferencia
       de movimiento, dos cosas que no existen en el servidor. Arrancar en
       `true` haría que quien ya la vio se coma un flash de cortina antes
       del primer efecto, que es justo lo que se quiere evitar. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    // El scroll queda bloqueado mientras la cortina está arriba.
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    let raf = 0;

    /* La barra avanza con el tiempo transcurrido, no con assets
       cargados: da un progreso continuo y honesto en vez de saltar
       de 0 a 100 cuando termina la última imagen. */
    const tick = (now: number) => {
      const pct = Math.min(1, (now - start) / MAX_DURATION);
      setProgress(pct);
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      const elapsed = performance.now() - start;
      // Espera mínima para que la animación no parpadee en cache caliente.
      const wait = Math.max(0, MIN_DURATION - elapsed);
      window.setTimeout(() => {
        setProgress(1);
        setVisible(false);
        document.documentElement.style.overflow = "";
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* no crítico */
        }
      }, wait);
    };

    // `load` espera imágenes y videos; el timeout es la red de seguridad.
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const hardStop = window.setTimeout(finish, MAX_DURATION);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hardStop);
      window.removeEventListener("load", finish);
      document.documentElement.style.overflow = "";
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label={tc("loading")}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-base av-noise"
          initial={{ opacity: 1 }}
          // La cortina sube revelando la página, en vez de un fade plano.
          exit={{ y: "-100%", transition: { duration: 1.05, ease: EASE_LUX } }}
        >
          {/* Luz de fondo: evita que la cortina se lea como un color liso. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 40% at 50% 45%, var(--av-glow-vivo) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-8 px-6 text-center">
            {/* Monograma: se dibuja el trazo antes de aparecer el texto. */}
            <motion.svg
              width="76"
              height="76"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE_LUX }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="var(--av-lux)"
                strokeWidth="1"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.5 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.6, ease: EASE_LUX }}
              />
              {/* Onda de agua — el gesto de la marca. */}
              <motion.path
                d="M26 58c8-9 16-9 24 0s16 9 24 0"
                stroke="var(--av-vivo)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.35, ease: EASE_LUX }}
              />
              <motion.path
                d="M32 42l18-14 18 14"
                stroke="var(--av-lux-light)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: EASE_LUX }}
              />
            </motion.svg>

            <motion.span
              className="font-display text-3xl font-light uppercase tracking-[0.42em] text-ink md:text-4xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE_LUX }}
            >
              AguaVista
            </motion.span>

            <motion.p
              className="max-w-xs font-sans text-[10px] font-light uppercase leading-relaxed tracking-[0.3em] text-ink-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85 }}
            >
              {t("line1")}
              <br />
              {t("line2")}
            </motion.p>

            {/* Barra de progreso */}
            <div className="mt-2 h-px w-40 overflow-hidden bg-[color:var(--av-border)] md:w-56">
              <motion.div
                className="h-full origin-left bg-[color:var(--av-vivo)]"
                style={{ scaleX: progress }}
                aria-hidden="true"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
