'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Instalaciones', href: '#instalaciones' },
  { name: 'Propiedades', href: '#propiedades' },
  { name: 'Contacto', href: '#contacto' },
  { name: 'Preguntas Frecuentes', href: '#faq' },
];

export function Navbar() {
  const { scrollY } = useScroll();
  // Arrancamos asumiendo que está oculto porque estamos arriba de todo
  const [hidden, setHidden] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Si estamos en la parte del video (menos de 150px de scroll), LO OCULTAMOS.
    if (latest < 150) {
      setHidden(true);
    } else {
      // Si ya bajamos, LO MOSTRAMOS.
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      // Le dejamos el fondo oscuro fijo porque solo se va a ver cuando scrolleemos hacia abajo
      className="fixed top-0 inset-x-0 z-50 bg-[#0C0A09]/95 backdrop-blur-md border-b border-[#292524]"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo pequeño para el navbar cuando bajamos */}
        <a href="#inicio" className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light tracking-[0.3em] text-[#FAFAF9] uppercase">
            AguaVista
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.2em] text-[#FAFAF9] uppercase hover:text-[#C9A962] transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
        </div>
        
        <button className="md:hidden text-[#FAFAF9] hover:text-[#C9A962] transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>

      </div>
    </motion.nav>
  );
}