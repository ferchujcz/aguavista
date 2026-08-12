'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENES = {
  exterior: {
    id: 'exterior',
    image: '/exterior.jpg',
    title: 'Vista Aérea del Complejo',
    hotspots: [
      { pitch: -15, yaw: 120, type: 'scene', text: 'Ingresar a Residencia Principal', target: 'living1' },
      { pitch: -5, yaw: -45, type: 'info', text: 'Ver Detalles del Masterplan', infoTitle: 'Ubicación Privilegiada', infoText: 'El complejo cuenta con 60 hectáreas de bosque nativo protegido, garantizando vistas ininterrumpidas y privacidad absoluta.' }
    ]
  },
  living1: {
    id: 'living1',
    image: '/living1.jpg',
    title: 'Living Principal',
    hotspots: [
      { pitch: -5, yaw: 80, type: 'scene', text: 'Ir a Sala de Estar', target: 'living2' },
      { pitch: 5, yaw: -170, type: 'scene', text: 'Volver al Exterior', target: 'exterior' },
      { pitch: -10, yaw: -45, type: 'info', text: 'Materiales Premium', infoTitle: 'Diseño de Interiores', infoText: 'Pisos de roble de Eslavonia de 15mm, carpintería con doble vidrio hermético (DVH) y mobiliario hecho a medida.' }
    ]
  },
  living2: {
    id: 'living2',
    image: '/living2.jpg',
    title: 'Sala de Estar Íntima',
    hotspots: [
      { pitch: -5, yaw: -120, type: 'scene', text: 'Volver al Living Principal', target: 'living1' },
      { pitch: -2, yaw: 30, type: 'info', text: 'Iluminación Natural', infoTitle: 'Vistas Panorámicas', infoText: 'Orientación norte que garantiza iluminación natural durante todo el día, maximizando la eficiencia.' }
    ]
  }
};

export function VirtualTour() {
  const [modalInfo, setModalInfo] = useState<{title: string, text: string} | null>(null);
  const [currentTitle, setCurrentTitle] = useState(SCENES.exterior.title);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Inyectamos la librería original de forma segura
    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link');
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('pannellum-js')) {
      const script = document.createElement('script');
      script.id = 'pannellum-js';
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = initPannellum;
    } else {
      initPannellum();
    }

    // 2. Encendemos el motor 3D con todas las salas conectadas
    function initPannellum() {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current || viewerRef.current) return;

      const scenesConfig: any = {};
      
      Object.values(SCENES).forEach((scene) => {
        scenesConfig[scene.id] = {
          type: 'equirectangular',
          panorama: scene.image,
          autoLoad: true,
          hotSpots: scene.hotspots.map(hs => {
            const isScene = hs.type === 'scene';
            return {
              pitch: hs.pitch,
              yaw: hs.yaw,
              type: isScene ? 'scene' : 'info',
              sceneId: isScene ? hs.target : undefined,
              cssClass: 'punto-dorado',
              createTooltipFunc: (hotSpotDiv: any) => {
                if (hotSpotDiv.innerHTML === "") {
                  hotSpotDiv.innerHTML = `<span class="cartel-flotante">${hs.text}</span>`;
                }
              },
              clickHandlerFunc: isScene ? undefined : () => {
                setModalInfo({ title: hs.infoTitle!, text: hs.infoText! });
              }
            };
          })
        };
      });

      viewerRef.current = pnl.viewer(containerRef.current, {
        default: {
          firstScene: 'exterior',
          sceneFadeDuration: 1000, // <-- Magia pura: Fundido suave entre salas
          autoLoad: true,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          mouseZoom: false,
          ignoreGPanoXMP: true
        },
        scenes: scenesConfig
      });

      // Escuchamos cuando cambiás de sala para actualizar el cartelito de arriba
      viewerRef.current.on('scenechange', (sceneId: string) => {
        if (SCENES[sceneId as keyof typeof SCENES]) {
          setCurrentTitle(SCENES[sceneId as keyof typeof SCENES].title);
        }
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <section className="relative w-full bg-[#0C0A09] py-32" id="tour-360">
      {/* Estilos inyectados directo para que no fallen */}
      <style>{`
        .pnlm-error-msg { display: none !important; }
        .punto-dorado {
          width: 22px;
          height: 22px;
          background-color: #C9A962;
          border-radius: 50%;
          border: 3px solid #0C0A09;
          box-shadow: 0 0 12px rgba(201, 169, 98, 0.8);
          cursor: pointer;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }
        .punto-dorado:hover { transform: scale(1.3); }
        .cartel-flotante {
          position: absolute;
          bottom: 35px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(12, 10, 9, 0.95);
          color: #FAFAF9;
          padding: 8px 14px;
          border: 1px solid rgba(201, 169, 98, 0.5);
          font-family: var(--font-josefin), sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .punto-dorado:hover .cartel-flotante { opacity: 1; }
      `}</style>

      <div className="mb-12 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-[#FAFAF9] font-semibold italic mb-3">
          Nuestras areas en venta
        </h2>
        <p className="font-[family-name:var(--font-josefin)] text-lg md:text-xl text-[#FAFAF9] font-light">
          Elegi el que mas se adapte a vos
        </p>
      </div>

      <div className="relative w-full max-w-7xl mx-auto h-[60vh] md:h-[80vh] bg-black overflow-hidden border border-[#292524]">
        
        {/* Cartel Superior Izquierdo */}
        <div className="absolute top-6 left-6 z-10 bg-[#0C0A09]/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-sm pointer-events-none">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962]">
            Ubicación:
          </span>
          <p className="font-[family-name:var(--font-cormorant)] text-xl text-white mt-1">
            {currentTitle}
          </p>
        </div>

        {/* ── CONTENEDOR DEL VISOR NATIVO ── */}
        <div ref={containerRef} className="w-full h-full" />
        
      </div>

      <p className="text-center mt-6 font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-[0.2em] text-[#A8A29E]">
        Arrastra la imagen para explorar. Toca los iconos para interactuar.
      </p>

      {/* MODAL DE INFORMACIÓN */}
      <AnimatePresence>
        {modalInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalInfo(null)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm cursor-pointer flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-[#1C1917] p-8 md:p-12 border border-[#292524] cursor-default shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setModalInfo(null)}
                className="absolute top-6 right-6 text-[#A8A29E] hover:text-[#C9A962] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-white mb-4">
                {modalInfo.title}
              </h3>
              <div className="w-12 h-px bg-[#C9A962] mb-6" />
              <p className="font-[family-name:var(--font-josefin)] text-sm leading-relaxed text-[#A8A29E]">
                {modalInfo.text}
              </p>
              <button
                onClick={() => setModalInfo(null)}
                className="mt-8 uppercase tracking-widest text-[10px] border-b border-[#C9A962] text-[#C9A962] pb-1 hover:text-white hover:border-white transition-colors"
              >
                Continuar Recorrido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}