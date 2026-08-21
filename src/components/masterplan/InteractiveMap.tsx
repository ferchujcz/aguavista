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
      const { data: dbZonas } = await supabase.from('zonas').select('*');
      const { data: dbLotes } = await supabase.from('lotes').select('*');

      if (dbZonas && dbZonas.length > 0) {
        const buildSubZones = dbZonas.map((z: any) => ({
          id: z.id, title: z.title, polygon: z.polygon, pitch: z.pitch, yaw: z.yaw,
          lots: (dbLotes || []).filter((l: any) => l.zona_id === z.id).map((l: any) => ({
            id: l.id, number: l.number, points: l.points, center: { x: l.center_x, y: l.center_y }, size: l.size, price: l.price, status: l.status, features: l.features || [], houseTour: l.housetour || []
          }))
        }));
        
        setMapConfig({
          global360: dbZonas[0].imagen_360 || '/exterior.jpg',
          macroImage: dbZonas[0].imagen_2d || '/areo.jpg',
          zones: [{ id: 'zona-1', title: 'Áreas en Venta', subZones: buildSubZones }]
        });
      }
    };
    fetchMapData();
  }, []);

  const getZoomStyle = () => {
    if (viewState === '2D_MICRO' && activeSubZone?.polygon) {
      const points = activeSubZone.polygon.split(' ').map((p: string) => { const [x, y] = p.split(',').map(Number); return { x, y }; });
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
    
    // Solución al Crash de Pannellum: Un contenedor siempre vivo, se limpia interno.
    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;
      const imageToLoad = viewState === '360_GLOBAL' ? mapConfig.global360 : activeRoom?.image;
      
      let hotSpots: any[] = [];
      if (viewState === '360_GLOBAL') {
        hotSpots = mapConfig.zones[0].subZones.filter((sz:any) => sz.pitch && sz.yaw).map((sz: any) => ({
          pitch: parseFloat(sz.pitch), yaw: parseFloat(sz.yaw), type: 'custom', cssClass: 'punto-dorado',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${sz.title}</span>`; },
          clickHandlerFunc: () => { setActiveSubZone(sz); setViewState('2D_MICRO'); }
        }));
      } else if (viewState === '360_HOUSE' && activeRoom) {
        hotSpots = activeRoom.hotspots?.map((hs: any) => ({
          pitch: hs.pitch, yaw: hs.yaw, type: 'custom', cssClass: 'punto-dorado-calle',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${hs.text}</span>`; },
          clickHandlerFunc: () => { const nextRoom = activeLot?.houseTour?.find((r: any) => r.id === hs.targetId); if (nextRoom) setActiveRoom(nextRoom); }
        })) || [];
      }

      if (viewerRef.current) viewerRef.current.destroy();

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

  const WHATSAPP_NUMBER = "5493755000000"; // Reemplazá por tu número real

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
            {viewState === '360_GLOBAL' ? 'Cielo 360' : mapConfig.zones[0].title}
          </span>
          {viewState === '2D_MACRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Plano General</span>}
          {viewState === '2D_MICRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Zoom {activeSubZone?.title}</span>}
        </div>

        <AnimatePresence>
          {viewState !== '360_GLOBAL' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 right-6 z-30 flex flex-col sm:flex-row gap-3 shadow-xl">
              {viewState === '2D_MACRO' && <button onClick={() => { setViewState('360_GLOBAL'); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#A8A29E] hover:text-white border border-[#292524] px-6 py-3 transition-all">Volver al Cielo</button>}
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
                
                {/* ── BOTÓN DE WHATSAPP ── */}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, quiero consultar por el ${activeLot.number} de AguaVista.`} target="_blank" rel="noreferrer" className="w-full text-center bg-[#25D366] text-white py-3 text-[10px] uppercase font-bold hover:bg-green-600 transition-colors mb-3 flex items-center justify-center gap-2 shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Consultar por WhatsApp
                </a>

                {activeLot.houseTour && activeLot.houseTour.length > 0 && (
                  <button onClick={() => { setActiveRoom(activeLot.houseTour[0]); setViewState('360_HOUSE'); }} className="w-full text-center bg-[#C9A962] text-[#0C0A09] py-3 text-[10px] uppercase font-bold hover:bg-white transition-colors mb-3 shadow-lg">Ver Interior Casa Modelo</button>
                )}
                <button onClick={() => setActiveLot(null)} className="w-full text-center border border-[#C9A962] text-[#C9A962] py-3 text-[10px] uppercase font-bold hover:bg-[#C9A962] hover:text-[#0C0A09] transition-colors">Volver a Info</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-10 ${(viewState === '360_GLOBAL' || viewState === '360_HOUSE') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}