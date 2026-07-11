"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * SmoothScrollProvider — Lenis nativo sobre el window.
 *
 * IMPORTANTE: No usamos root:true ni un wrapper con overflow.
 * Lenis se inicializa sobre el scroll nativo del window, lo que
 * permite que position:sticky funcione correctamente en todos los
 * elementos hijos (incluido VerticalReels).
 *
 * Inspirado en el scroll experience del Porsche Cayenne Black Edition.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Inicializar Lenis sobre el scroll nativo del window
    // autoRaf:true delega el loop a Lenis internamente
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // NO pasamos 'wrapper' ni 'content' — usa el window por defecto
      // Esto es crítico para que position:sticky funcione
    });

    lenisRef.current = lenis;

    // RAF loop manual para compatibilidad con framer-motion
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Renderiza los children directamente — sin wrapper DOM adicional
  // que pueda crear un nuevo scroll context
  return <>{children}</>;
}
