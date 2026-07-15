'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(true);

  // Escuchamos el scroll. Si baja más de 150px (pasa el inicio), mostramos el menú.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 150) {
      setHidden(false);
    } else {
      setHidden(true);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: '-100%', opacity: 0 },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      // Acá está la magia del fondo difuminado (backdrop-blur)
      className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-center bg-black/30 backdrop-blur-md border-b border-white/10"
    >
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light tracking-[0.3em] text-[#FAFAF9] uppercase transition-colors group-hover:text-[#C9A962]">
          AguaVista
        </span>
      </Link>
    </motion.header>
  );
}