"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

/**
 * Wraps the app with react-lenis for buttery smooth scrolling.
 * Inspired by Porsche Cayenne Black Edition's immersive scroll experience.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {/* @ts-expect-error — react-lenis peer dep mismatch with React 19 */}
      {children}
    </ReactLenis>
  );
}
