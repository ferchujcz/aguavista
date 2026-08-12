'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ── 1. BASE DE DATOS DEL MASTERPLAN (FÁCIL DE EDITAR) ──
const MASTERPLAN_CONFIG = {
  general360: '/exterior.jpg', 
  zones: [
    {
      id: 'zona-1',
      title: 'Zona 1 - Etapa Inicial',
      hotspot: { pitch: -15, yaw: 120 }, 
      aerialImage: '/areo.webp', 
      street360: '/barrio.webp',
      specs: {
        description: 'La etapa inicial cuenta con los lotes más cercanos al pórtico principal, ofreciendo acceso rápido y vistas despejadas al bosque nativo.',
        features: [
          'Lotes desde 800m²',
          'Orientación Norte',
          'Frente a áreas verdes',
          'Entrega Inmediata'
        ]
      }
    },
    {
      id: 'zona-2',
      title: 'Zona 2 - El Bosque',
      hotspot: { pitch: -5, yaw: -45 }, 
      aerialImage: '/areo.webp',
      street360: '/barrio2.webp',
      specs: {
        description: 'Ubicados en el corazón del complejo, estos lotes se integran perfectamente con la naturaleza, garantizando privacidad absoluta.',
        features: [
          'Lotes desde 1000m²',
          'Rodeados de bosque protegido',
          'Cercanía al Club House',
          'Preventa exclusiva'
        ]
      }
    }
  ]
};

type ViewState = 'GENERAL_360' | 'AERIAL_2D' | 'STREET_360';

export default function InteractiveMap() {
  const [viewState, setViewState] = useState<ViewState>('GENERAL_360');
  const [activeZone, setActiveZone] = useState<typeof MASTERPLAN_CONFIG.zones[0] | null>(null);
  
  // Estados del Modo Admin
  const [isUrlAdmin, setIsUrlAdmin] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{pitch: number, yaw: number} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // ── LÓGICA DE LA URL SECRETA ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('admin') === 'solari') {
        setIsUrlAdmin(true);
      }
    }
  }, []);

  // ── LÓGICA DEL VISOR 360 NATIVO ──
  useEffect(() => {
    if (viewState === 'AERIAL_2D') {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      return;
    }

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current || viewerRef.current) return;

      const imageToLoad = viewState === 'GENERAL_360' 
        ? MASTERPLAN_CONFIG.general360 
        : activeZone?.street360 || MASTERPLAN_CONFIG.general360;

      const hotSpots = viewState === 'GENERAL_360' ? MASTERPLAN_CONFIG.zones.map(zone => ({
        pitch: zone.hotspot.pitch,
        yaw: zone.hotspot.yaw,
        type: 'custom',
        cssClass: 'punto-dorado',
        createTooltipFunc: (hotSpotDiv: any) => {
          if (hotSpotDiv.innerHTML === "") {
            hotSpotDiv.innerHTML = `<span class="cartel-flotante text-[10px]">${zone.title}</span>`;
          }
        },
        clickHandlerFunc: () => {
          if (!isAdminActive) {
            setActiveZone(zone);
            setViewState('AERIAL_2D'); 
          }
        }
      })) : [];

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: imageToLoad,
        autoLoad: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        mouseZoom: false,
        ignoreGPanoXMP: true,
        hotSpots: hotSpots
      });

      viewerRef.current.on('mousedown', (event: MouseEvent) => {
        setIsAdminActive((currentAdminState) => {
          if (currentAdminState && viewerRef.current) {
            const coords = viewerRef.current.mouseEventToCoords(event);
            setClickedCoords({ pitch: coords[0].toFixed(2), yaw: coords[1].toFixed(2) });
          }
          return currentAdminState;
        });
      });
    };

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
      setTimeout(initPannellum, 100);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [viewState, activeZone, isAdminActive]); 

  return (
    <section className="relative w-full bg-[#0C0A09] py-32" id="propiedades">
      
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
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .punto-dorado:hover .cartel-flotante { opacity: 1; }
      `}</style>

      {/* ── ENCABEZADO CON LOS TEXTOS CORRECTOS ── */}
      <div className="mb-12 flex flex-col items-center justify-center text-center px-4 relative">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-[#FAFAF9] font-semibold italic mb-3">
          Nuestras areas en venta
        </h2>
        <p className="font-[family-name:var(--font-josefin)] text-lg md:text-xl text-[#FAFAF9] font-light">
          Elegi el que mas se adapte a vos
        </p>
        
        {/* BOTÓN SECRETO DE ADMIN */}
        {isUrlAdmin && (
          <button 
            onClick={() => {
              setIsAdminActive(!isAdminActive);
              setClickedCoords(null);
            }}
            className={`absolute right-4 top-0 md:right-12 px-3 py-1 text-[9px] font-[family-name:var(--font-josefin)] uppercase tracking-widest border transition-colors z-50 ${isAdminActive ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-transparent border-[#292524] text-[#A8A29E] hover:border-[#C9A962]'}`}
          >
            {isAdminActive ? 'Apagar Admin' : 'Modo Admin'}
          </button>
        )}
      </div>

      <div className="relative w-full max-w-7xl mx-auto h-[60vh] md:h-[80vh] border border-[#292524] overflow-hidden bg-[#1C1917]">
        
        {/* ── HEADER DEL VISOR ── */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 pointer-events-none">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962] bg-black/60 px-2 py-1 rounded-sm backdrop-blur-md w-max">
            {viewState === 'GENERAL_360' ? 'Vista General' : activeZone?.title}
          </span>
          {viewState !== 'GENERAL_360' && (
            <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/60 px-2 py-1 rounded-sm backdrop-blur-md w-max mt-1">
              {viewState === 'AERIAL_2D' ? 'Plano de Lotes y Especificaciones' : 'Recorrido 360'}
            </span>
          )}
        </div>

        {/* ── BOTONES DE NAVEGACIÓN ── */}
        <AnimatePresence>
          {viewState !== 'GENERAL_360' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 right-6 z-20 flex flex-col sm:flex-row gap-3"
            >
              {viewState === 'AERIAL_2D' ? (
                <>
                  <button 
                    onClick={() => setViewState('GENERAL_360')}
                    className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/80 text-[#A8A29E] hover:text-white border border-[#292524] hover:border-[#C9A962] px-4 py-2 transition-all backdrop-blur-md"
                  >
                    Volver al Inicio
                  </button>
                  <button 
                    onClick={() => setViewState('STREET_360')}
                    className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-[#C9A962] text-[#0C0A09] hover:bg-white px-4 py-2 transition-colors font-semibold"
                  >
                    Caminar por la zona
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setViewState('AERIAL_2D')}
                  className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/80 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-[#0C0A09] px-4 py-2 transition-all backdrop-blur-md"
                >
                  Volver al plano
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PANEL DE ADMIN FLOTANTE ── */}
        <AnimatePresence>
          {isAdminActive && viewState === 'GENERAL_360' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-[#C9A962] p-4 shadow-2xl flex flex-col items-center text-center"
            >
              <p className="font-[family-name:var(--font-josefin)] text-[10px] text-[#A8A29E] uppercase tracking-widest mb-2">
                {clickedCoords ? 'Copiá este código en tus Zonas:' : 'Hacé clic en cualquier parte del cielo/tierra'}
              </p>
              {clickedCoords && (
                <code className="bg-[#1C1917] px-4 py-2 text-sm text-green-400 font-mono select-all border border-[#292524]">
                  {`hotspot: { pitch: ${clickedCoords.pitch}, yaw: ${clickedCoords.yaw} }`}
                </code>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RENDERIZADO DINÁMICO DE LA VISTA ── */}
        {viewState === 'AERIAL_2D' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative flex items-center"
          >
            <div className="absolute inset-0">
              <Image 
                src={activeZone?.aerialImage || '/placeholder.webp'} 
                alt="Plano de Lotes" 
                fill 
                className="object-contain"
              />
            </div>

            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-72 md:w-80 bg-black/85 backdrop-blur-md border border-[#292524] p-6 hidden sm:block shadow-2xl"
            >
              <h4 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#C9A962] mb-4 border-b border-[#292524] pb-2">
                Especificaciones
              </h4>
              <p className="font-[family-name:var(--font-josefin)] text-xs leading-relaxed text-[#A8A29E] mb-6">
                {activeZone?.specs?.description}
              </p>
              <ul className="space-y-3">
                {activeZone?.specs?.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 font-[family-name:var(--font-josefin)] text-xs text-[#FAFAF9]">
                    <span className="text-[#C9A962] mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="absolute bottom-6 left-6 bg-black/80 px-4 py-3 border border-[#292524] flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Vendido</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
            ref={containerRef}
          />
        )}
      </div>

      {viewState === 'GENERAL_360' && (
        <p className="text-center mt-6 font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-[0.2em] text-[#A8A29E]">
          Arrastrá para explorar la vista aérea. Tocá las zonas para ver los lotes y sus especificaciones.
        </p>
      )}
    </section>
  );
}