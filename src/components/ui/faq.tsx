'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PREGUNTAS = [
  {
    pregunta: "¿Cuáles son las opciones de financiación disponibles?",
    respuesta: "Ofrecemos planes de financiación a medida, con un anticipo del 30% y el saldo en cuotas fijas en dólares sin interés durante el período de obra."
  },
  {
    pregunta: "¿El predio cuenta con seguridad las 24 horas?",
    respuesta: "Absolutamente. AguaVista dispone de un triple anillo de seguridad, control de acceso biométrico, vigilancia perimetral con cámaras térmicas y personal de guardia 24/7."
  },
  {
    pregunta: "¿Puedo acceder a las instalaciones si compro un lote?",
    respuesta: "Sí, todos los propietarios adquieren una membresía vitalicia que garantiza el acceso ilimitado a la House del Tenis, la Zona Golf, el Spa & Bienestar y el Aeropuerto privado."
  },
  {
    pregunta: "¿Cuándo se entregan las propiedades?",
    respuesta: "El masterplan está diseñado para entregas por etapas. La primera fase de residencias y los amenities principales estarán finalizados para diciembre de este año."
  }
];

export function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#0C0A09] py-32 px-6" id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.25em] text-[#C9A962] uppercase mb-4 block">
            Información Adicional
          </span>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-[#FAFAF9] font-light">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {PREGUNTAS.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <div 
                key={index}
                className={`border-b transition-colors duration-300 ${isActive ? 'border-[#C9A962]' : 'border-[#292524]'}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-[family-name:var(--font-cormorant)] text-xl md:text-2xl transition-colors duration-300 ${isActive ? 'text-[#C9A962]' : 'text-[#FAFAF9]'}`}>
                    {item.pregunta}
                  </span>
                  <span className={`text-[#C9A962] transform transition-transform duration-300 ${isActive ? 'rotate-45' : 'rotate-0'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 font-[family-name:var(--font-josefin)] text-sm leading-relaxed text-[#A8A29E]">
                        {item.respuesta}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}