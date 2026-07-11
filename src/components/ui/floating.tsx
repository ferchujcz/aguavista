"use client";

import { useRef, useEffect, useCallback } from "react";
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref";

interface FloatingProps {
  children: React.ReactNode;
  className?: string;
  /** How strongly the container responds to mouse movement (multiplier for children depths) */
  sensitivity?: number;
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Depth factor: how much this element moves relative to mouse.
   * Higher = moves more (closer to camera). Range: 0.5 – 2.
   */
  depth?: number;
}

/**
 * Floating — container that tracks mouse position and passes it to FloatingElement children
 * via a shared ref. Uses rAF for silky-smooth 3D parallax without re-renders.
 */
export default function Floating({
  children,
  className = "",
  sensitivity = 1,
}: FloatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useMousePositionRef();
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!containerRef.current) return;

    const { x, y } = mouseRef.current;

    // Apply a subtle perspective tilt to the whole container
    const rotateY = x * 6 * sensitivity;
    const rotateX = -y * 4 * sensitivity;

    containerRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    rafRef.current = requestAnimationFrame(animate);
  }, [mouseRef, sensitivity]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        transition: "transform 0.1s linear",
      }}
    >
      {children}
    </div>
  );
}

/**
 * FloatingElement — a child of <Floating> that translates in 3D based on mouse position.
 * depth controls how far it "floats" toward the viewer.
 */
export function FloatingElement({
  children,
  className = "",
  depth = 1,
}: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mouseRef = useMousePositionRef();
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!elementRef.current) return;

    const { x, y } = mouseRef.current;

    const translateX = x * 30 * depth;
    const translateY = y * 20 * depth;
    const translateZ = depth * 20;

    elementRef.current.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`;

    rafRef.current = requestAnimationFrame(animate);
  }, [mouseRef, depth]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        willChange: "transform",
        transition: "transform 0.08s linear",
      }}
    >
      {children}
    </div>
  );
}
