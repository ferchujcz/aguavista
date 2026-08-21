'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type ViewState = '360_GLOBAL' | '2D_MACRO' | '2D_MICRO' | '360_HOUSE';

export default function InteractiveMap() {
  const [mapConfig, setMapConfig] = useState<any>({
    global360: '/exterior.jpg',
    macroImage: '/areo.jpg', 
    zones: [{ id: 'zona-1', title: 'Nuestras Áreas', subZones: [] }]
  });

  const [viewState, setViewState] = useState<ViewState>('360_GLOBAL');
  const [activeZone, setActiveZone] = useState<any>(null);
  const [activeSubZone, setActiveSubZone] = useState<any>(null);
  const [activeLot, setActiveLot] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      const { data: dbZonas, error: errorZonas } = await supabase.from('zonas').select('*');
      const { data: dbLotes, error: errorLotes } = await supabase.from('lotes').select('*');

      if (errorZonas || errorLotes) return console.error("Error BD:", errorZonas, errorLotes);

      if (dbZonas) {
        const buildSubZones = dbZonas.map((z: any) => ({
          id: z.id, title: z.title, polygon: z.polygon, microImage: z.microimage, pitch: z.pitch, yaw: z.yaw,
          specs: { description: z.description, features: z.features || [] },
          lots: (dbLotes || []).filter((l: any) => l.zona_id === z.id).map((l: any) => ({
            id: l.id, number: l.number, points: l.points, center: { x: l.center_x, y: l.center_y }, size: l.size, price: l.price, status: l.status, houseTour: l.housetour || []
          }))
        }));
        setMapConfig((prev: any) => ({ ...prev, zones: [{ ...prev.zones[0], subZones: buildSubZones }] }));
      }
    };
    fetchMapData();
  }, []);

  const getZoomStyle = () => {
    if (viewState === '2D_MICRO' && activeSubZone?.polygon) {
      const points = activeSubZone.polygon.split(' ').map((p: string) => {
        const [x, y] = p.split(',').map(Number); return { x, y };
      });
      const minX = Math.min(...points.map((p: any) => p.x)); const maxX = Math.max(...points.map((p: any) => p.x));
      const minY = Math.min(...points.map((p: any) => p.y)); const maxY = Math.max(...points.map((p: any) => p.y));

      const centerX = minX + (maxX - minX) / 2; const centerY = minY + (maxY - minY) / 2;
      const width = maxX - minX; const height = maxY - minY;
      const scale = Math.max(Math.min(65 / width, 65 / height), 1.5); 
      return { transformOrigin: `${centerX}% ${centerY}%`, scale: scale };
    }
    return { transformOrigin: '50% 50%', scale: 1 };
  };

  useEffect(() => {
    if (viewState === '2D_MACRO' || viewState === '2D_MICRO') return;
    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;
      const imageToLoad = viewState === '360_GLOBAL' ? mapConfig.global360 : activeRoom?.image;
      
      let hotSpots: any[] = [];
      if (viewState === '360_GLOBAL') {
        // PUNTOS DINÁMICOS DEL CIELO
        hotSpots = mapConfig.zones[0].subZones.filter((sz:any) => sz.pitch && sz.yaw).map((sz: any) => ({
          pitch: parseFloat(sz.pitch), yaw: parseFloat(sz.yaw), type: 'custom', cssClass: 'punto-dorado',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${sz.title}</span>`; },
          clickHandlerFunc: () => { setActiveZone(mapConfig.zones[0]); setViewState('2D_MACRO'); }
        }));
      } else if (viewState === '360_HOUSE' && activeRoom) {
        hotSpots = activeRoom.hotspots.map((hs: any) => ({
          pitch: hs.pitch, yaw: hs.yaw, type: 'custom', cssClass: 'punto-dorado-calle',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${hs.text}</span>`; },
          clickHandlerFunc: () => { const nextRoom = activeLot?.houseTour?.find((r: any) => r.id === hs.targetId); if (nextRoom) setActiveRoom(nextRoom); }
        })) || [];
      }

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: imageToLoad, autoLoad: true, showZoomCtrl: false, showFullscreenCtrl: false, mouseZoom: false, ignoreGPanoXMP: true, hotSpots: hotSpots
      });
    };

    if (!(window as any).pannellum) {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'; script.async = true;
      document.body.appendChild(script); script.onload = initPannellum;
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'; document.head.appendChild(link);
    } else { setTimeout(initPannellum, 100); }

    return () => { if (viewerRef.current) { viewerRef.current.destroy(); viewerRef.current = null; } };
  }, [viewState, mapConfig, activeRoom, activeLot]);

  return (
    <section className="relative w-full block clear-both bg-[#0C0A09] py-24 md:py-32" id="propiedades">
      <style>{`
        .pnlm-error-msg { display: none !important; }
        .punto-dorado { width: 22px; height: 22px; background-color: #C9A962; border-radius: 50%; border: 3px solid #0C0A09; box-shadow: 0 0 12px rgba(201, 169, 98, 0.8); cursor: pointer; transition: transform 0.2s ease; pointer-events: auto; }
        .punto-dorado:hover { transform: scale(1.3); }
        .punto-dorado-calle { width: 30px; height: 30px; background-color: rgba(255,255,255,0.2); border-radius: 50%; border: 2px solid #FAFAF9; backdrop-filter: blur(4px); cursor: pointer; transition: transform 0.2s ease; pointer-events: auto; }
        .punto-dorado-calle:hover { transform: scale(1.3); }
        .cartel-flotante { position: absolute; bottom: 35px; left: 50%; transform: translateX(-50%); background-color: rgba(12, 10, 9, 0.95); color: #FAFAF9; padding: 8px 14px; border: 1px solid rgba(201, 169, 98, 0.5); font-family: var(--font-josefin), sans-serif; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
        .punto-dorado:hover .cartel-flotante, .punto-dorado-calle:hover .cartel-flotante { opacity: 1; }
      `}</style>

      <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-16 pt-8 relative z-10 block">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-6xl text-[#FAFAF9] font-semibold italic mb-4">Nuestras áreas en venta</h2>
        <p className="font-[family-name:var(--font-josefin)] text-lg md:text-xl text-[#A8A29E] font-light tracking-wide">Elegí el que más se adapte a vos</p>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[70vh] md:h-[80vh] border-y md:border border-[#292524] overflow-hidden bg-[#0C0A09]">
        
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-1 pointer-events-none">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962] bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max border border-[#C9A962]/30">
            {viewState === '360_GLOBAL' ? 'Cielo 360' : activeZone?.title}
          </span>
          {viewState === '2D_MACRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Plano General</span>}
          {viewState === '2D_MICRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Zoom {activeSubZone?.title}</span>}
        </div>

        <AnimatePresence>
          {viewState !== '360_GLOBAL' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 right-6 z-30 flex flex-col sm:flex-row gap-3 shadow-xl">
              {viewState === '2D_MACRO' && <button onClick={() => { setViewState('360_GLOBAL'); setActiveZone(null); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#A8A29E] hover:text-white border border-[#292524] px-6 py-3 transition-all">Volver al Cielo</button>}
              {viewState === '2D_MICRO' && <button onClick={() => { setViewState('2D_MACRO'); setActiveSubZone(null); setActiveLot(null); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-black px-6 py-3 transition-all">Volver a Plano General</button>}
              {viewState === '360_HOUSE' && <button onClick={() => setViewState('2D_MICRO')} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-[#0C0A09] px-6 py-3 transition-all">Salir de la Casa</button>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-20 overflow-hidden bg-[#1C1917] ${(viewState === '2D_MACRO' || viewState === '2D_MICRO') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <motion.div className="relative w-full h-full flex items-center justify-center" animate={getZoomStyle()} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapConfig.macroImage} alt="Plano" className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none" />
            <div className="absolute inset-0 z-30">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                {viewState === '2D_MACRO' && mapConfig.zones[0]?.subZones?.map((sub: any) => (
                  <polygon key={sub.id} points={sub.polygon} onClick={(e) => { e.stopPropagation(); setActiveSubZone(sub); setViewState('2D_MICRO'); }} className={`pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.2] transition-all ${activeSubZone?.id === sub.id ? 'fill-white opacity-40' : 'fill-white opacity-10 hover:opacity-30'}`} />
                ))}
                {viewState === '2D_MICRO' && activeSubZone?.lots?.map((lot: any) => (
                  <polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); setActiveLot(lot); }} className={`pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.1] transition-all ${activeLot?.id === lot.id ? 'stroke-[0.3] opacity-80' : 'opacity-40 hover:opacity-70'} ${lot.status === 'disponible' ? 'fill-green-500' : 'fill-red-500'}`} />
                ))}
              </svg>
            </div>
          </motion.div>

          <AnimatePresence>
            {viewState === '2D_MICRO' && activeLot && (
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: 50 }} className="absolute right-0 md:right-6 top-[auto] bottom-0 md:top-1/2 md:bottom-[auto] md:-translate-y-1/2 w-full md:w-80 bg-black/95 backdrop-blur-md border-t md:border border-[#292524] p-6 shadow-2xl z-40">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-white">{activeLot.number}</h4>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Precio</span>
                    <span className="font-bold text-[#C9A962]">{activeLot.price || 'Consultar'}</span>
                  </div>
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 inline-block mb-4 border ${activeLot.status === 'disponible' ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>{activeLot.status}</div>
                <ul className="space-y-3 border-t border-[#292524] pt-4 mb-6">
                  <li className="flex justify-between font-[family-name:var(--font-josefin)] text-sm text-[#A8A29E]"><span>Superficie:</span> <span className="text-[#FAFAF9]">{activeLot.size}</span></li>
                  {activeLot.features?.map((f:string, i:number) => <li key={i} className="flex items-start gap-2 font-[family-name:var(--font-josefin)] text-xs text-[#FAFAF9]"><span className="text-[#C9A962] mt-0.5">✓</span>{f}</li>)}
                </ul>
                
                {activeLot.houseTour && activeLot.houseTour.length > 0 && (
                  <button onClick={() => { setActiveRoom(activeLot.houseTour[0]); setViewState('360_HOUSE'); }} className="w-full text-center bg-[#C9A962] text-[#0C0A09] py-3 text-[10px] uppercase font-bold hover:bg-white transition-colors mb-3 shadow-lg">Ver Interior Casa Modelo</button>
                )}
                <button onClick={() => setActiveLot(null)} className="w-full text-center border border-[#C9A962] text-[#C9A962] py-3 text-[10px] uppercase font-bold hover:bg-[#C9A962] hover:text-[#0C0A09] transition-colors">Volver a Info</button>
              </motion.div>
            )}
          </AnimatePresence>

          {viewState === '2D_MICRO' && (
            <div className="absolute top-6 left-6 md:top-[auto] md:bottom-6 bg-black/90 px-4 py-3 border border-[#292524] flex flex-col gap-2 backdrop-blur-md z-30 shadow-xl">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Disponible</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Vendido</span></div>
            </div>
          )}
        </div>

        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-10 ${(viewState === '360_GLOBAL' || viewState === '360_HOUSE') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}