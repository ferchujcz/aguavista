'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ── 1. LA ESTRUCTURA EXACTA DEL EMBUDO ──
const MASTERPLAN_CONFIG = {
  global360: '/exterior.jpg', // 1. Foto desde el cielo
  
  zones: [
    {
      id: 'zona-1',
      title: 'Zona 1 - General',
      hotspot: { pitch: -15, yaw: 120 }, // Punto en el cielo
      macroImage: '/areozona1.jpg', // 2. Foto 2D amplia (Se ven las manzanas)
      
      subZones: [
        {
          id: 'manzana-a',
          title: 'Manzana A',
          polygon: '10.00,10.00 40.00,10.00 40.00,40.00 10.00,40.00', // Dibujado con el admin
          microImage: '/areozona2.jpg', // 3. Foto 2D con Zoom (Se ven los lotes de esta manzana)
          street360: '/barrio.webp', // 4. Foto 360 para caminar por esta manzana
          
          specs: {
            description: 'Manzana premium con acceso directo a los amenities principales.',
            features: ['Terrenos nivelados', 'Orientación Norte', 'Servicios subterráneos']
          },
          
          lots: [
            // Los lotes delimitados dentro de la Manzana A
            {
              id: "lote-1",
              points: "15.00,15.00 25.00,15.00 25.00,30.00 15.00,30.00", 
              center: { x: "20.00", y: "22.50" }, 
              status: "disponible",
              number: "Lote 01",
              size: "800m²"
            }
          ]
        }
      ]
    }
  ]
};

type ViewState = '360_GLOBAL' | '2D_MACRO' | '2D_MICRO' | '360_STREET';
type SubZoneType = typeof MASTERPLAN_CONFIG.zones[0]['subZones'][0];
type LotType = SubZoneType['lots'][0];

export default function InteractiveMap() {
  // ESTADOS DEL EMBUDO
  const [viewState, setViewState] = useState<ViewState>('360_GLOBAL');
  const [activeZone, setActiveZone] = useState<typeof MASTERPLAN_CONFIG.zones[0] | null>(null);
  const [activeSubZone, setActiveSubZone] = useState<SubZoneType | null>(null);
  const [activeLot, setActiveLot] = useState<LotType | null>(null);
  
  // ESTADOS DEL ADMIN
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<{x: number, y: number}[]>([]);
  const [tempPolygons, setTempPolygons] = useState<any[]>([]); // Guarda manzanas o lotes temporales
  const [clickedCoords3D, setClickedCoords3D] = useState<{pitch: string, yaw: string} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // LA LLAVE SECRETA (3 Clics)
  const [clickCount, setClickCount] = useState(0);
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 2) {
      setIsAdminActive(true); setClickCount(0);
      alert("🔓 PANEL ADMIN ACTIVADO");
    }
    setTimeout(() => setClickCount(0), 1000); 
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('admin') === 'solari') setIsAdminActive(true);
    }
  }, []);

  // MOTOR 360
  useEffect(() => {
    if (viewState === '2D_MACRO' || viewState === '2D_MICRO') return;

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;

      const imageToLoad = viewState === '360_GLOBAL' ? MASTERPLAN_CONFIG.global360 : activeSubZone?.street360;
      let hotSpots: any[] = [];
      
      if (viewState === '360_GLOBAL') {
        hotSpots = MASTERPLAN_CONFIG.zones.map(zone => ({
          pitch: zone.hotspot.pitch, yaw: zone.hotspot.yaw, type: 'custom', cssClass: 'punto-dorado',
          createTooltipFunc: (hotSpotDiv: any) => {
            if (hotSpotDiv.innerHTML === "") hotSpotDiv.innerHTML = `<span class="cartel-flotante text-[10px]">${zone.title}</span>`;
          },
          clickHandlerFunc: () => {
            if (!isAdminActive) { setActiveZone(zone); setViewState('2D_MACRO'); }
          }
        }));
      }

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: imageToLoad, autoLoad: true,
        showZoomCtrl: false, showFullscreenCtrl: false, mouseZoom: false, ignoreGPanoXMP: true,
        hotSpots: hotSpots
      });

      viewerRef.current.on('mousedown', (event: MouseEvent) => {
        setIsAdminActive((currentAdmin) => {
          if (currentAdmin && viewerRef.current) {
            const coords = viewerRef.current.mouseEventToCoords(event);
            setClickedCoords3D({ pitch: coords[0].toFixed(2), yaw: coords[1].toFixed(2) });
          }
          return currentAdmin;
        });
      });
    };

    if (!(window as any).pannellum) {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'; script.async = true;
      document.body.appendChild(script); script.onload = initPannellum;
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    } else {
      setTimeout(initPannellum, 100);
    }

    return () => { if (viewerRef.current) { viewerRef.current.destroy(); viewerRef.current = null; } };
  }, [viewState, isAdminActive, activeZone, activeSubZone]);

  // LÓGICA DE DIBUJO (Admin)
  const handle2DClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdminActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentDrawing([...currentDrawing, { x, y }]);
  };

  const finishDrawing = () => {
    if (currentDrawing.length < 3) return alert("Necesitás 3 clics mínimo para cerrar un área.");
    const pointsStr = currentDrawing.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const centerX = (currentDrawing.reduce((acc, p) => acc + p.x, 0) / currentDrawing.length).toFixed(2);
    const centerY = (currentDrawing.reduce((acc, p) => acc + p.y, 0) / currentDrawing.length).toFixed(2);

    if (viewState === '2D_MACRO') {
      setTempPolygons([...tempPolygons, { id: `manzana-${Date.now()}`, title: `Manzana ${tempPolygons.length + 1}`, polygon: pointsStr, microImage: '/ruta_imagen_zoom.jpg', lots: [] }]);
    } else if (viewState === '2D_MICRO') {
      setTempPolygons([...tempPolygons, { id: `lote-${Date.now()}`, points: pointsStr, center: { x: centerX, y: centerY }, status: 'disponible', number: `Lote ${tempPolygons.length + 1}`, size: '800m²' }]);
    }
    setCurrentDrawing([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(tempPolygons, null, 2));
    alert('¡Copiado! Pegalo en tu archivo de código.');
  };

  return (
    <section className="relative w-full block clear-both bg-[#0C0A09] py-24 md:py-32" id="propiedades">
      <style>{`
        .pnlm-error-msg { display: none !important; }
        .punto-dorado { width: 22px; height: 22px; background-color: #C9A962; border-radius: 50%; border: 3px solid #0C0A09; box-shadow: 0 0 12px rgba(201, 169, 98, 0.8); cursor: pointer; transition: transform 0.2s ease; pointer-events: auto; }
        .punto-dorado:hover { transform: scale(1.3); }
        .cartel-flotante { position: absolute; bottom: 35px; left: 50%; transform: translateX(-50%); background-color: rgba(12, 10, 9, 0.95); color: #FAFAF9; padding: 8px 14px; border: 1px solid rgba(201, 169, 98, 0.5); font-family: var(--font-josefin), sans-serif; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
        .punto-dorado:hover .cartel-flotante { opacity: 1; }
      `}</style>

      {/* ENCABEZADO */}
      <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-16 pt-8 relative z-10 block">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-6xl text-[#FAFAF9] font-semibold italic mb-4 cursor-pointer select-none" onClick={handleSecretClick}>
          Nuestras áreas en venta
        </h2>
        <p className="font-[family-name:var(--font-josefin)] text-lg md:text-xl text-[#A8A29E] font-light tracking-wide">
          Elegí el que más se adapte a vos
        </p>
        {isAdminActive && (
          <button onClick={() => { setIsAdminActive(false); setTempPolygons([]); setCurrentDrawing([]); }} className="absolute right-4 top-0 md:right-12 px-4 py-2 text-[10px] font-[family-name:var(--font-josefin)] uppercase tracking-widest transition-colors z-50 bg-red-900/80 border border-red-500 text-red-100 shadow-xl">
            Apagar Admin
          </button>
        )}
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[70vh] md:h-[80vh] border-y md:border border-[#292524] overflow-hidden bg-[#0C0A09]">
        
        {/* INDICADOR DE VISTA */}
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-1 pointer-events-none">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962] bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max border border-[#C9A962]/30">
            {viewState === '360_GLOBAL' ? 'Cielo 360' : activeZone?.title}
          </span>
          {viewState === '2D_MACRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Vista Macro (Manzanas)</span>}
          {viewState === '2D_MICRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Vista Micro ({activeSubZone?.title})</span>}
          {viewState === '360_STREET' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Recorrido 360</span>}
        </div>

        {/* BOTONES DE NAVEGACIÓN (EL EMBUDO HACIA ATRÁS) */}
        <AnimatePresence>
          {viewState !== '360_GLOBAL' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 right-6 z-30 flex flex-col sm:flex-row gap-3 shadow-xl">
              {viewState === '2D_MACRO' && (
                <button onClick={() => { setViewState('360_GLOBAL'); setActiveZone(null); setTempPolygons([]); setCurrentDrawing([]); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#A8A29E] hover:text-white border border-[#292524] px-6 py-3 transition-all">
                  Volver al Cielo
                </button>
              )}
              {viewState === '2D_MICRO' && (
                <>
                  <button onClick={() => { setViewState('2D_MACRO'); setActiveSubZone(null); setActiveLot(null); setTempPolygons([]); setCurrentDrawing([]); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-black px-6 py-3 transition-all">
                    Volver a Vista Macro
                  </button>
                  <button onClick={() => setViewState('360_STREET')} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-[#C9A962] text-[#0C0A09] hover:bg-white px-6 py-3 transition-colors font-bold">
                    Caminar por Manzana
                  </button>
                </>
              )}
              {viewState === '360_STREET' && (
                <button onClick={() => setViewState('2D_MICRO')} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-[#0C0A09] px-6 py-3 transition-all">
                  Volver a los Lotes
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONSOLA ADMIN ── */}
        <AnimatePresence>
          {isAdminActive && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/95 border border-[#C9A962] p-5 flex flex-col items-center text-center w-[90%] max-w-lg">
              {viewState === '360_GLOBAL' && (
                <>
                  <p className="font-[family-name:var(--font-josefin)] text-[10px] text-[#A8A29E] uppercase tracking-widest mb-2">Copiá este Hotspot (Punto en el cielo):</p>
                  {clickedCoords3D ? <code className="bg-[#1C1917] p-3 text-xs text-green-400 font-mono w-full block">{`hotspot: { pitch: ${clickedCoords3D.pitch}, yaw: ${clickedCoords3D.yaw} }`}</code> : <p className="text-xs text-white">Clic en el cielo para sacar coordenadas.</p>}
                </>
              )}
              {(viewState === '2D_MACRO' || viewState === '2D_MICRO') && (
                <>
                  <h4 className="text-[#C9A962] font-[family-name:var(--font-cormorant)] text-xl mb-1">{viewState === '2D_MACRO' ? 'Creador de Manzanas' : 'Creador de Lotes'}</h4>
                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-3">
                    {currentDrawing.length > 0 && (
                      <>
                        <button onClick={() => setCurrentDrawing([])} className="flex-1 bg-red-900/40 text-red-400 px-3 py-2 text-[10px] uppercase">Limpiar</button>
                        <button onClick={finishDrawing} className="flex-1 bg-green-600 text-white px-3 py-2 text-[10px] uppercase font-bold">Cerrar Polígono</button>
                      </>
                    )}
                    {currentDrawing.length === 0 && tempPolygons.length > 0 && (
                      <button onClick={copyToClipboard} className="w-full bg-[#C9A962] text-[#0C0A09] font-bold px-4 py-3 text-[10px] uppercase">Copiar {tempPolygons.length} Creados</button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RENDER 2D: MACRO Y MICRO ── */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-20 flex items-center justify-center bg-[#1C1917] ${(viewState === '2D_MACRO' || viewState === '2D_MICRO') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`relative inline-block max-w-full max-h-full ${isAdminActive ? 'cursor-crosshair' : ''}`}>
            
            {/* LA IMAGEN CAMBIA SEGÚN EL NIVEL DEL EMBUDO */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={viewState === '2D_MACRO' ? activeZone?.macroImage : activeSubZone?.microImage || '/placeholder.webp'} 
              alt="Plano" 
              className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none"
            />
            
            <div className="absolute inset-0 z-30" onClick={handle2DClick}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                
                {/* DIBUJA MANZANAS EN VISTA MACRO */}
                {viewState === '2D_MACRO' && activeZone?.subZones?.map(sub => (
                  <polygon key={sub.id} points={sub.polygon} onClick={(e) => { e.stopPropagation(); if (!isAdminActive) { setActiveSubZone(sub); setViewState('2D_MICRO'); } }} className="pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.2] fill-white opacity-20 hover:opacity-50 transition-all" />
                ))}

                {/* DIBUJA LOTES EN VISTA MICRO */}
                {viewState === '2D_MICRO' && activeSubZone?.lots?.map(lot => (
                  <polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); if (!isAdminActive) setActiveLot(lot); }} className={`pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.2] transition-all ${activeLot?.id === lot.id ? 'stroke-[0.6] opacity-80' : 'opacity-40 hover:opacity-70'} ${lot.status === 'disponible' ? 'fill-green-500' : 'fill-red-500'}`} />
                ))}

                {/* Polígonos y lápiz del Admin */}
                {tempPolygons.map((poly) => (
                  <polygon key={poly.id} points={poly.polygon || poly.points} className="fill-blue-500 opacity-50 stroke-white stroke-[0.3]" />
                ))}
                {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.5] stroke-dasharray-1 animate-pulse" />}
              </svg>

              {/* Puntitos solo para los Lotes (Vista Micro) */}
              {viewState === '2D_MICRO' && activeSubZone?.lots?.map(lot => (
                <div key={`${lot.id}-dot`} className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white z-40 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_rgba(0,0,0,1)] pointer-events-none" style={{ top: `${lot.center.y}%`, left: `${lot.center.x}%` }} />
              ))}
              {currentDrawing.map((p, i) => (
                <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-400 z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ top: `${p.y}%`, left: `${p.x}%` }} />
              ))}
            </div>
          </div>

          {/* PANEL DE ESPECIFICACIONES (Solo en Micro) */}
          <AnimatePresence>
            {viewState === '2D_MICRO' && (
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: 50 }} className="absolute right-0 md:right-6 top-[auto] bottom-0 md:top-1/2 md:bottom-[auto] md:-translate-y-1/2 w-full md:w-80 bg-black/95 backdrop-blur-md border-t md:border border-[#292524] p-6 shadow-2xl z-40">
                {activeLot ? (
                  <div className="animate-in fade-in">
                    <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-white mb-2">{activeLot.number}</h4>
                    <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 inline-block mb-4 border ${activeLot.status === 'disponible' ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>{activeLot.status}</div>
                    <ul className="space-y-3 border-t border-[#292524] pt-4 mb-6">
                      <li className="flex justify-between font-[family-name:var(--font-josefin)] text-sm text-[#A8A29E]"><span>Superficie:</span> <span className="text-[#FAFAF9]">{activeLot.size}</span></li>
                    </ul>
                    <button onClick={() => setActiveLot(null)} className="w-full text-center border border-[#C9A962] text-[#C9A962] py-3 text-[10px] uppercase font-bold hover:bg-[#C9A962] hover:text-[#0C0A09] transition-colors">Volver a Info de Manzana</button>
                  </div>
                ) : (
                  <div className="animate-in fade-in">
                    <h4 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#C9A962] mb-4 border-b border-[#292524] pb-2">Especificaciones de {activeSubZone?.title}</h4>
                    <p className="font-[family-name:var(--font-josefin)] text-xs leading-relaxed text-[#A8A29E] mb-6">{activeSubZone?.specs?.description}</p>
                    <ul className="space-y-3">
                      {activeSubZone?.specs?.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 font-[family-name:var(--font-josefin)] text-xs text-[#FAFAF9]"><span className="text-[#C9A962] mt-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RENDER 360 (Cielo o Calle) ── */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-10 ${(viewState === '360_GLOBAL' || viewState === '360_STREET') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div ref={containerRef} className="w-full h-full" />
        </div>

      </div>
    </section>
  );
}