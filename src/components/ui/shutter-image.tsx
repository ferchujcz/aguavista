'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ShutterImageProps {
  src: string;
  alt?: string;
  className?: string;
  direction?: 'ltr' | 'rtl' | 'center' | 'ttb' | 'btt';
}

export default function ShutterImageLoader({ 
  src, 
  alt = '', 
  className = '',
  direction = 'center'
}: ShutterImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'center center']
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'ltr' ? ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'] :
    direction === 'rtl' ? ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'] :
    direction === 'ttb' ? ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'] :
    direction === 'btt' ? ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] :
    ['inset(0% 50% 0% 50%)', 'inset(0% 0% 0% 0%)']
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full transform-gpu ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        decoding="async"
        loading="lazy"
        style={{ 
          clipPath, 
          willChange: 'clip-path, transform',
          transform: 'translateZ(0)' // Fuerza a la GPU a crear una capa independiente
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
