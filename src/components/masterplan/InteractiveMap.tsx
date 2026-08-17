'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// ── CONEXIÓN A SUPABASE ──
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type ViewState = '360_GLOBAL' | '2D_MACRO' | '2D_MICRO' | '360_HOUSE';

export default function InteractiveMap() {
  // ── ESTADO GLOBAL DESDE LA BASE DE DATOS ──
  const [mapConfig, setMapConfig] = useState<any>({
    global360: '/exterior.jpg',
    macroImage: '/areo.webp',
    zones: [{ id: 'zona-1', title: 'Nuestras Áreas', hotspot: { pitch: -15, yaw: 120 }, subZones: [] }]
  });

  // ESTADOS DE NAVEGACIÓN
  const [viewState, setViewState] = useState<ViewState>('360_GLOBAL');
  const [activeZone, setActiveZone] = useState<any>(null);
  const [activeSubZone, setActiveSubZone] = useState<any>(null);
  const [activeLot, setActiveLot] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  // ESTADOS ADMIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<{x: number, y: number}[]>([]);
  const [editingLot, setEditingLot] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // ── 1. CARGAR DATOS DESDE SUPABASE AL INICIAR ──
  const fetchMapData = async () => {
    try {
      const { data: dbZonas } = await supabase.from('zonas').select('*');
      const { data: dbLotes } = await supabase.from('lotes').select('*');

      if (dbZonas) {
        const buildSubZones = dbZonas.map((z: any) => ({
          id: z.id,
          title: z.title,
          polygon: z.polygon,
          microImage: z.microimage,
          specs: { description: z.description, features: z.features || [] },
          lots: (dbLotes || []).filter((l: any) => l.zona_id === z.id).map((l: any) => ({
            id: l.id,
            number: l.number,
            points: l.points,
            center: { x: l.center_x, y: l.center_y },
            size: l.size,
            status: l.status,
            houseTour: l.housetour || []
          }))
        }));

        setMapConfig((prev: any) => ({
          ...prev,
          zones: [{ ...prev.zones[0], subZones: buildSubZones }]
        }));
      }
    } catch (error) {
      console.error("Error cargando base de datos:", error);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // ── ADMIN LOGIN ──
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') { 
      setIsAdminActive(true); setShowPinModal(false); setPinInput('');
      alert('🔓 MODO DESARROLLADOR: Conectado a Servidor PostgreSQL');
    } else {
      alert('❌ PIN Incorrecto'); setPinInput('');
    }
  };

  const changeView = (newView: ViewState) => {
    setViewState(newView); setCurrentDrawing([]); setEditingLot(null);
  };

  // ── AUTO-ZOOM ──
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

  // ── MOTOR 360 ──
  useEffect(() => {
    if (viewState === '2D_MACRO' || viewState === '2D_MICRO') return;

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;

      const imageToLoad = viewState === '360_GLOBAL' ? mapConfig.global360 : viewState === '360_HOUSE' ? activeRoom?.image : '';
      let hotSpots: any[] = [];
      
      if (viewState === '360_GLOBAL') {
        hotSpots = mapConfig.zones.map((zone: any) => ({
          pitch: zone.hotspot.pitch, yaw: zone.hotspot.yaw, type: 'custom', cssClass: 'punto-dorado',
          createTooltipFunc: (hotSpotDiv: any) => {
            if (hotSpotDiv.innerHTML === "") hotSpotDiv.innerHTML = `<span class="cartel-flotante text-[10px]">${zone.title}</span>`;
          },
          clickHandlerFunc: () => {
            if (!isAdminActive) { setActiveZone(zone); changeView('2D_MACRO'); }
          }
        }));
      } else if (viewState === '360_HOUSE' && activeRoom) {
        hotSpots = activeRoom.hotspots.map((hs: any) => ({
          pitch: hs.pitch, yaw: hs.yaw, type: 'custom', cssClass: 'punto-dorado-calle',
          createTooltipFunc: (hotSpotDiv: any) => {
            if (hotSpotDiv.innerHTML === "") hotSpotDiv.innerHTML = `<span class="cartel-flotante text-[10px]">${hs.text}</span>`;
          },
          clickHandlerFunc: () => {
            if (!isAdminActive) {
              const nextRoom = activeLot?.houseTour?.find((r: any) => r.id === hs.targetId);
              if (nextRoom) setActiveRoom(nextRoom);
            }
          }
        })) || [];
      }

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: imageToLoad, autoLoad: true,
        showZoomCtrl: false, showFullscreenCtrl: false, mouseZoom: false, ignoreGPanoXMP: true, hotSpots: hotSpots
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
  }, [viewState, isAdminActive, mapConfig, activeRoom, activeLot]);

  // ── DIBUJO E INSERCIÓN EN POSTGRES ──
  const handle2DClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdminActive || editingLot) return; 
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentDrawing([...currentDrawing, { x, y }]);
  };

  const finishDrawing = async () => {
    if (currentDrawing.length < 3) return alert("Hacé 3 clics mínimo.");
    const pointsStr = currentDrawing.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const centerX = (currentDrawing.reduce((acc, p) => acc + p.x, 0) / currentDrawing.length).toFixed(2);
    const centerY = (currentDrawing.reduce((acc, p) => acc + p.y, 0) / currentDrawing.length).toFixed(2);

    if (viewState === '2D_MACRO') {
      const newZone = {
        id: `manzana-${Date.now()}`, title: `Manzana Nueva`, polygon: pointsStr, microimage: '/areozona1.jpg', description: 'Nueva Manzana', features: []
      };
      await supabase.from('zonas').insert(newZone);
    } else if (viewState === '2D_MICRO') {
      const newLot = {
        id: `lote-${Date.now()}`, zona_id: activeSubZone.id, number: `Lote Nuevo`, points: pointsStr, center_x: centerX, center_y: centerY, size: '800m²', status: 'disponible', housetour: []
      };
      await supabase.from('lotes').insert(newLot);
    }
    setCurrentDrawing([]);
    fetchMapData(); // Refresca los datos desde el servidor
  };

  // ── ACTUALIZACIÓN DE LOTES (POSTGRES UPDATE) ──
  const updateLotData = async () => {
    await supabase.from('lotes').update({
      number: editingLot.number,
      status: editingLot.status,
      size: editingLot.size
    }).eq('id', editingLot.id);
    
    setEditingLot(null);
    fetchMapData(); // Refresca instantáneamente
  };

  const deleteLot = async (id: string) => {
    if(!confirm("¿Borrar permanentemente este lote de la Base de Datos?")) return;
    await supabase.from('lotes').delete().eq('id', id);
    setEditingLot(null);
    fetchMapData();
  };

  return (
    <section className="relative w-full block clear-both bg-[#0C0A09] py-24 md:py-32" id="propiedades">
      <style>{`
        .pnlm-error-msg { display: none !important; }
        .punto-dorado { width: 22px; height: 22px; background-color: #C9A962; border-radius: 50%; border: 3px solid #0C0A09; box-shadow: 0 0 12px rgba(201, 169, 98, 0.8); cursor: pointer; transition: transform 0.2s ease; pointer-events: auto; }
        .punto-dorado-calle { width: 30px; height: 30px; background-color: rgba(255,255,255,0.2); border-radius: 50%; border: 2px solid #FAFAF9; backdrop-filter: blur(4px); cursor: pointer; transition: transform 0.2s ease; pointer-events: auto; }
        .punto-dorado:hover, .punto-dorado-calle:hover { transform: scale(1.3); }
        .cartel-flotante { position: absolute; bottom: 35px; left: 50%; transform: translateX(-50%); background-color: rgba(12, 10, 9, 0.95); color: #FAFAF9; padding: 8px 14px; border: 1px solid rgba(201, 169, 98, 0.5); font-family: var(--font-josefin), sans-serif; text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
        .punto-dorado:hover .cartel-flotante, .punto-dorado-calle:hover .cartel-flotante { opacity: 1; }
      `}</style>

      {/* ── ENCABEZADO ── */}
      <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-16 pt-8 relative z-10 block">
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-6xl text-[#FAFAF9] font-semibold italic mb-4">Nuestras áreas en venta</h2>
        <p className="font-[family-name:var(--font-josefin)] text-lg md:text-xl text-[#A8A29E] font-light tracking-wide">Elegí el que más se adapte a vos</p>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[70vh] md:h-[80vh] border-y md:border border-[#292524] overflow-hidden bg-[#0C0A09]">
        
        {/* INDICADOR DE VISTA */}
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-1 pointer-events-none">
          <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-[#C9A962] bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max border border-[#C9A962]/30">
            {viewState === '360_GLOBAL' ? 'Cielo 360' : activeZone?.title}
          </span>
          {viewState === '2D_MACRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Plano General</span>}
          {viewState === '2D_MICRO' && <span className="font-[family-name:var(--font-josefin)] text-[10px] uppercase tracking-widest text-white bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-md w-max mt-1 border border-white/20">Zoom {activeSubZone?.title}</span>}
        </div>

        {/* BOTONES DE NAVEGACIÓN */}
        <AnimatePresence>
          {viewState !== '360_GLOBAL' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 right-6 z-30 flex flex-col sm:flex-row gap-3 shadow-xl">
              {viewState === '2D_MACRO' && <button onClick={() => { changeView('360_GLOBAL'); setActiveZone(null); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#A8A29E] hover:text-white border border-[#292524] px-6 py-3 transition-all">Volver al Cielo</button>}
              {viewState === '2D_MICRO' && <button onClick={() => { changeView('2D_MACRO'); setActiveSubZone(null); setActiveLot(null); setEditingLot(null); }} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-black px-6 py-3 transition-all">Volver a Plano General</button>}
              {viewState === '360_HOUSE' && <button onClick={() => changeView('2D_MICRO')} className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs uppercase tracking-widest bg-black/90 text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-[#0C0A09] px-6 py-3 transition-all">Salir de la Casa</button>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BARRA SUPERIOR ADMIN (Directo a Servidor) ── */}
        {isAdminActive && (
          <div className="absolute top-0 left-0 w-full bg-blue-900/90 text-white z-40 flex justify-between items-center px-6 py-2 border-b border-blue-500 backdrop-blur-sm">
            <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> DB ONLINE - MODO EDICIÓN VISUAL</span>
            <button onClick={() => setIsAdminActive(false)} className="bg-black/50 px-4 py-1 text-[10px] uppercase tracking-widest hover:bg-black border border-blue-400">Cerrar Admin</button>
          </div>
        )}

        {/* ── MENÚ FLOTANTE ADMIN DE HERRAMIENTAS ── */}
        <AnimatePresence>
          {isAdminActive && (viewState === '2D_MACRO' || viewState === '2D_MICRO') && !editingLot && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/95 border border-[#C9A962] p-4 flex flex-col items-center text-center shadow-2xl">
              <p className="text-[#C9A962] font-bold text-sm mb-2">{viewState === '2D_MACRO' ? 'Dibujar Manzanas' : 'Dibujar Lotes'}</p>
              <p className="text-xs text-gray-400 mb-3">Hacé clic en las esquinas del terreno.</p>
              {currentDrawing.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDrawing([])} className="bg-red-900/50 text-red-400 px-4 py-2 text-xs border border-red-900">Limpiar</button>
                  <button onClick={finishDrawing} className="bg-green-600 text-white px-4 py-2 text-xs font-bold border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]">Guardar en Base de Datos</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RENDER 2D: CON AUTO-ZOOM ── */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-20 overflow-hidden bg-[#1C1917] ${(viewState === '2D_MACRO' || viewState === '2D_MICRO') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <motion.div className={`relative w-full h-full flex items-center justify-center ${isAdminActive && !editingLot ? 'cursor-crosshair' : ''}`} animate={getZoomStyle()} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapConfig.macroImage} alt="Plano" className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none" />
            
            <div className="absolute inset-0 z-30" onClick={handle2DClick}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                
                {viewState === '2D_MACRO' && mapConfig.zones[0]?.subZones?.map((sub: any) => (
                  <polygon key={sub.id} points={sub.polygon} onClick={(e) => { e.stopPropagation(); setActiveSubZone(sub); if (!isAdminActive) changeView('2D_MICRO'); }} className={`pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.2] transition-all ${activeSubZone?.id === sub.id ? 'fill-white opacity-40' : 'fill-white opacity-10 hover:opacity-30'}`} />
                ))}

                {viewState === '2D_MICRO' && activeSubZone?.lots?.map((lot: any) => (
                  <polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); if (isAdminActive) { setEditingLot(lot); setActiveLot(null); } else { setActiveLot(lot); } }} className={`pointer-events-auto cursor-pointer stroke-[#FAFAF9] stroke-[0.1] transition-all ${activeLot?.id === lot.id || editingLot?.id === lot.id ? 'stroke-[0.3] opacity-80' : 'opacity-40 hover:opacity-70'} ${lot.status === 'disponible' ? 'fill-green-500' : 'fill-red-500'}`} />
                ))}

                {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.2] stroke-dasharray-1" />}
              </svg>

              {currentDrawing.map((p, i) => (<div key={i} className="absolute w-1 h-1 bg-yellow-400 rounded-full z-40 -translate-x-1/2 -translate-y-1/2" style={{ top: `${p.y}%`, left: `${p.x}%` }} />))}
            </div>
          </motion.div>

          {/* ── PANEL DERECHO: VISTA CLIENTE ── */}
          <AnimatePresence>
            {viewState === '2D_MICRO' && activeLot && !isAdminActive && (
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: 50 }} className="absolute right-0 md:right-6 top-[auto] bottom-0 md:top-1/2 md:bottom-[auto] md:-translate-y-1/2 w-full md:w-80 bg-black/95 backdrop-blur-md border-t md:border border-[#292524] p-6 shadow-2xl z-40">
                <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-white mb-2">{activeLot.number}</h4>
                <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 inline-block mb-4 border ${activeLot.status === 'disponible' ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>{activeLot.status}</div>
                <ul className="space-y-3 border-t border-[#292524] pt-4 mb-6">
                  <li className="flex justify-between font-[family-name:var(--font-josefin)] text-sm text-[#A8A29E]"><span>Superficie:</span> <span className="text-[#FAFAF9]">{activeLot.size}</span></li>
                </ul>
                
                {activeLot.houseTour && activeLot.houseTour.length > 0 && (
                  <button onClick={() => { setActiveRoom(activeLot.houseTour[0]); changeView('360_HOUSE'); }} className="w-full text-center bg-[#C9A962] text-[#0C0A09] py-3 text-[10px] uppercase font-bold hover:bg-white transition-colors mb-3 shadow-lg">Ver Interior Casa Modelo</button>
                )}

                <button onClick={() => setActiveLot(null)} className="w-full text-center border border-[#C9A962] text-[#C9A962] py-3 text-[10px] uppercase font-bold hover:bg-[#C9A962] hover:text-[#0C0A09] transition-colors">Volver a Info</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PANEL DERECHO: EDITOR DE LOTE ADMIN (ACTUALIZA POSTGRES) ── */}
          <AnimatePresence>
            {isAdminActive && editingLot && (
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: 50 }} className="absolute right-0 md:right-6 top-1/2 -translate-y-1/2 w-full md:w-80 bg-[#1C1917] border border-blue-500 p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] z-50">
                <div className="flex justify-between items-center border-b border-[#292524] pb-3 mb-4">
                  <h4 className="text-blue-400 font-bold flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> DB Editor</h4>
                  <button onClick={() => setEditingLot(null)} className="text-gray-400 hover:text-white">X</button>
                </div>

                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Identificador Público</label>
                <input type="text" value={editingLot.number} onChange={(e) => setEditingLot({...editingLot, number: e.target.value})} className="w-full bg-black border border-[#292524] text-white p-2 mb-4 text-sm focus:border-blue-500 outline-none" />

                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Estado de Venta</label>
                <select value={editingLot.status} onChange={(e) => setEditingLot({...editingLot, status: e.target.value})} className={`w-full p-2 mb-4 text-sm font-bold border outline-none ${editingLot.status === 'disponible' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                  <option value="disponible">DISPONIBLE</option>
                  <option value="vendido">VENDIDO</option>
                </select>

                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Superficie</label>
                <input type="text" value={editingLot.size} onChange={(e) => setEditingLot({...editingLot, size: e.target.value})} className="w-full bg-black border border-[#292524] text-white p-2 mb-6 text-sm focus:border-blue-500 outline-none" />

                <div className="flex gap-2">
                  <button onClick={() => deleteLot(editingLot.id)} className="flex-1 bg-red-900/50 text-red-400 py-3 text-[10px] uppercase font-bold border border-red-900 hover:bg-red-600 hover:text-white transition-colors">Eliminar</button>
                  <button onClick={updateLotData} className="flex-1 bg-blue-600 text-white py-3 text-[10px] uppercase font-bold hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">Actualizar Nube</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEYENDA */}
          {!isAdminActive && viewState === '2D_MICRO' && (
            <div className="absolute top-6 left-6 md:top-[auto] md:bottom-6 bg-black/90 px-4 py-3 border border-[#292524] flex flex-col gap-2 backdrop-blur-md z-30 shadow-xl">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Disponible</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="font-[family-name:var(--font-josefin)] text-[10px] text-white uppercase tracking-wider">Lote Vendido</span></div>
            </div>
          )}
        </div>

        {/* ── RENDER 360 ── */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-10 ${(viewState === '360_GLOBAL' || viewState === '360_HOUSE') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div ref={containerRef} className="w-full h-full" />
        </div>

      </div>

      {/* ── CANDADO DE ACCESO ADMIN ── */}
      <button onClick={() => setShowPinModal(true)} className="absolute bottom-4 right-4 text-[#292524] hover:text-blue-500 transition-colors z-50" title="Acceso Desarrollador">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </button>

      {/* ── MODAL DEL PIN ── */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center backdrop-blur-sm">
            <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onSubmit={handlePinSubmit} className="bg-[#1C1917] border border-blue-900 p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(30,58,138,0.5)]">
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-blue-400 mb-2">Supabase DB Sync</h3>
              <p className="text-xs text-[#A8A29E] mb-6 uppercase tracking-widest font-[family-name:var(--font-josefin)]">Ingrese PIN Maestro</p>
              <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} autoFocus className="w-full bg-black border border-[#292524] text-white text-center text-2xl tracking-[1em] p-4 mb-6 focus:border-blue-500 outline-none" placeholder="****" />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 text-[#A8A29E] text-xs uppercase tracking-widest hover:text-white">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest py-3 hover:bg-blue-500 transition-colors">Conectar BD</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}