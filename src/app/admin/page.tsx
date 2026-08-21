'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  // DATOS
  const [zonas, setZonas] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  
  // ESTADOS 2D
  const [activeZona, setActiveZona] = useState<any>(null);
  const [editingLote, setEditingLote] = useState<any>(null);
  const [currentDrawing, setCurrentDrawing] = useState<{x: number, y: number}[]>([]);
  const [mode, setMode] = useState<'VIEW' | 'DRAW_ZONA' | 'DRAW_LOTE'>('VIEW');
  
  // ESTADOS 360
  const [adminTab, setAdminTab] = useState<'2D' | '360'>('2D');
  const [activeLote360, setActiveLote360] = useState<any>(null);
  const [activeRoom360, setActiveRoom360] = useState<any>(null);
  const [newRoomImg, setNewRoomImg] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  
  // HOTSPOTS VISUALES
  const [hotspotModal, setHotspotModal] = useState<{pitch: number, yaw: number} | null>(null);
  const [hotspotTarget, setHotspotTarget] = useState('');
  const [hotspotText, setHotspotText] = useState('Ir a...');

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // ── 1. INIT & FETCH ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl) return alert("Falta la URL de Supabase en las variables de entorno.");
    if (pinInput === '1234') setIsAuthenticated(true);
    else alert('PIN Incorrecto');
  };

  const fetchData = async () => {
    const { data: zData } = await supabase.from('zonas').select('*');
    const { data: lData } = await supabase.from('lotes').select('*');
    if (zData) setZonas(zData);
    if (lData) {
      setLotes(lData);
      if (activeLote360) {
        const updatedLote = lData.find(l => l.id === activeLote360.id);
        setActiveLote360(updatedLote);
        if (activeRoom360 && updatedLote) {
          setActiveRoom360(updatedLote.housetour?.find((r:any) => r.id === activeRoom360.id));
        }
      }
    }
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);

  // ── 2. LÓGICA 2D Y EDITOR ──
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'VIEW') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentDrawing([...currentDrawing, { x, y }]);
  };

  const saveDrawing = async () => {
    if (currentDrawing.length < 3) return alert("Mínimo 3 puntos para un polígono.");
    const pointsStr = currentDrawing.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    
    if (mode === 'DRAW_ZONA') {
      await supabase.from('zonas').insert({
        id: `zona-${Date.now()}`, title: `Manzana ${zonas.length + 1}`, polygon: pointsStr, microimage: '/areozona1.jpg', description: ''
      });
    } else if (mode === 'DRAW_LOTE' && activeZona) {
      const cX = (currentDrawing.reduce((a, p) => a + p.x, 0) / currentDrawing.length).toFixed(2);
      const cY = (currentDrawing.reduce((a, p) => a + p.y, 0) / currentDrawing.length).toFixed(2);
      await supabase.from('lotes').insert({
        id: `lote-${Date.now()}`, zona_id: activeZona.id, number: `Lote Nuevo`, points: pointsStr, center_x: cX, center_y: cY, size: '800m²', price: 'Consultar', status: 'disponible', features: [], housetour: []
      });
    }
    setCurrentDrawing([]); setMode('VIEW'); fetchData();
  };

  // 👇 ACÁ ESTÁ LA FUNCIÓN QUE FALTABA 👇
  const openEditor = (lot: any) => {
    setEditingLote({
      ...lot,
      featuresRaw: lot.features ? lot.features.join('\n') : ''
    });
  };

  const updateLote = async () => {
    const featuresArray = editingLote.featuresRaw ? editingLote.featuresRaw.split('\n').filter((f:string) => f.trim() !== '') : [];
    await supabase.from('lotes').update({
      number: editingLote.number, status: editingLote.status, size: editingLote.size, price: editingLote.price, features: featuresArray
    }).eq('id', editingLote.id);
    alert("Lote guardado."); setEditingLote(null); fetchData();
  };

  const deleteLote = async (id: string) => {
    if(!confirm("¿Borrar permanentemente este lote?")) return;
    await supabase.from('lotes').delete().eq('id', id);
    setEditingLote(null); fetchData();
  };

  // ── 3. LÓGICA 360 (VISUAL BUILDER) ──
  useEffect(() => {
    if (adminTab !== '360' || !activeRoom360) return;

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;

      const hotSpots = activeRoom360.hotspots?.map((hs: any) => ({
        pitch: hs.pitch, yaw: hs.yaw, type: 'custom', cssClass: 'punto-dorado-calle',
        createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${hs.text}</span>`; }
      })) || [];

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: activeRoom360.image, autoLoad: true,
        showZoomCtrl: true, showFullscreenCtrl: false, hotSpots: hotSpots
      });

      viewerRef.current.on('mousedown', (event: MouseEvent) => {
        const coords = viewerRef.current.mouseEventToCoords(event);
        setHotspotModal({ pitch: coords[0], yaw: coords[1] });
      });
    };

    if (!(window as any).pannellum) {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'; script.async = true;
      document.body.appendChild(script); script.onload = initPannellum;
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    } else { setTimeout(initPannellum, 100); }

    return () => { if (viewerRef.current) { viewerRef.current.destroy(); viewerRef.current = null; } };
  }, [adminTab, activeRoom360]);

  const addRoom = async () => {
    if (!newRoomName || !newRoomImg || !activeLote360) return;
    const currentTour = activeLote360.housetour || [];
    const newRoom = { id: newRoomName.toLowerCase().replace(/\s+/g, '-'), name: newRoomName, image: newRoomImg, hotspots: [] };
    const updatedTour = [...currentTour, newRoom];
    
    await supabase.from('lotes').update({ housetour: updatedTour }).eq('id', activeLote360.id);
    setNewRoomName(''); setNewRoomImg(''); fetchData();
  };

  const deleteRoom = async (roomId: string) => {
    if(!confirm("¿Borrar esta habitación y sus flechas?")) return;
    const updatedTour = activeLote360.housetour.filter((r:any) => r.id !== roomId);
    await supabase.from('lotes').update({ housetour: updatedTour }).eq('id', activeLote360.id);
    if(activeRoom360?.id === roomId) setActiveRoom360(null);
    fetchData();
  };

  const saveVisualHotspot = async () => {
    if (!hotspotModal || !hotspotTarget || !activeLote360 || !activeRoom360) return;
    
    const newHotspot = { pitch: hotspotModal.pitch, yaw: hotspotModal.yaw, targetId: hotspotTarget, text: hotspotText };
    
    const updatedTour = activeLote360.housetour.map((room: any) => {
      if (room.id === activeRoom360.id) {
        return { ...room, hotspots: [...(room.hotspots || []), newHotspot] };
      }
      return room;
    });

    await supabase.from('lotes').update({ housetour: updatedTour }).eq('id', activeLote360.id);
    setHotspotModal(null); setHotspotTarget(''); setHotspotText('Ir a...');
    fetchData(); 
  };

  // ── LOGIN SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1C1917] p-8 border border-[#292524] w-full max-w-sm text-center shadow-2xl">
          <h1 className="text-[#C9A962] text-2xl mb-2 font-[family-name:var(--font-cormorant)]">Centro de Mando</h1>
          <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest">Masterplan & Tours 360</p>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-black text-white p-3 mb-4 text-center tracking-[1em] outline-none focus:border-[#C9A962] border border-[#292524]" placeholder="****" />
          <button type="submit" className="w-full bg-[#C9A962] text-black font-bold py-3 uppercase text-xs tracking-widest hover:bg-white transition-colors">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C0A09] text-white overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-[400px] bg-[#1C1917] border-r border-[#292524] flex flex-col h-screen shrink-0">
        <div className="p-4 border-b border-[#292524] flex gap-2">
          <button onClick={() => { setAdminTab('2D'); setMode('VIEW'); }} className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${adminTab === '2D' ? 'bg-blue-600 text-white' : 'bg-black text-gray-400 border border-[#292524]'}`}>Mapeo 2D</button>
          <button onClick={() => { setAdminTab('360'); setMode('VIEW'); }} className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${adminTab === '360' ? 'bg-[#C9A962] text-black' : 'bg-black text-gray-400 border border-[#292524]'}`}>Tours 360</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {adminTab === '2D' ? (
            <>
              {!editingLote ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-bold">1. Manzanas Generales</h3>
                    <button onClick={() => { setMode('DRAW_ZONA'); setActiveZona(null); }} className={`w-full py-3 text-[10px] font-bold uppercase transition-colors shadow-lg ${mode === 'DRAW_ZONA' ? 'bg-blue-600 text-white' : 'bg-blue-900/20 border border-blue-800 text-blue-400 hover:bg-blue-800/40'}`}>+ Dibujar Manzana</button>
                    <div className="mt-3 flex flex-col gap-2">
                      {zonas.map(z => (
                        <button key={z.id} onClick={() => { setActiveZona(z); setMode('VIEW'); }} className={`p-3 text-xs border text-left transition-colors ${activeZona?.id === z.id ? 'bg-[#C9A962]/20 border-[#C9A962] text-[#C9A962] font-bold' : 'bg-black border-[#292524] text-gray-300'}`}>{z.title}</button>
                      ))}
                    </div>
                  </div>

                  {activeZona && (
                    <div className="mb-8 animate-in fade-in">
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-bold">2. Lotes en {activeZona.title}</h3>
                      <button onClick={() => setMode('DRAW_LOTE')} className={`w-full py-3 text-[10px] font-bold uppercase mb-3 transition-colors shadow-lg ${mode === 'DRAW_LOTE' ? 'bg-green-600 text-white' : 'bg-green-900/20 border border-green-800 text-green-400 hover:bg-green-800/40'}`}>+ Dibujar Lote Nuevo</button>
                      <p className="text-[10px] text-gray-500 italic">Tocá un lote dibujado en el mapa para editarlo.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-black p-5 border border-blue-500 animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-5 border-b border-[#292524] pb-3">
                    <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider">Modificar Lote</h3>
                    <button onClick={() => setEditingLote(null)} className="text-gray-500 hover:text-white bg-[#1C1917] px-2 py-1 rounded">X</button>
                  </div>
                  
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Nombre Público</label>
                  <input type="text" value={editingLote.number} onChange={e => setEditingLote({...editingLote, number: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-3 text-sm outline-none border border-[#292524] focus:border-blue-500" />
                  
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Precio (USD o Consultar)</label>
                  <input type="text" value={editingLote.price || ''} onChange={e => setEditingLote({...editingLote, price: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-3 text-sm outline-none border border-[#292524] focus:border-green-500 text-green-400 font-bold" />
                  
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 uppercase mb-1">Estado</label>
                      <select value={editingLote.status} onChange={e => setEditingLote({...editingLote, status: e.target.value})} className={`w-full p-2.5 text-sm outline-none font-bold border ${editingLote.status === 'disponible' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-red-900/30 text-red-400 border-red-700'}`}>
                        <option value="disponible">DISPONIBLE</option><option value="vendido">VENDIDO</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 uppercase mb-1">Superficie</label>
                      <input type="text" value={editingLote.size} onChange={e => setEditingLote({...editingLote, size: e.target.value})} className="w-full bg-[#1C1917] p-2.5 text-sm outline-none border border-[#292524]" />
                    </div>
                  </div>

                  <label className="block text-[10px] text-[#C9A962] font-bold uppercase mt-5 mb-1">Detalles de la Casa / Terreno</label>
                  <p className="text-[9px] text-gray-500 mb-2">Un detalle por renglón (Ej: "3 Habitaciones", "Piscina")</p>
                  <textarea value={editingLote.featuresRaw} onChange={e => setEditingLote({...editingLote, featuresRaw: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-6 text-xs h-24 outline-none border border-[#292524] focus:border-[#C9A962]" placeholder="Piscina infinita&#10;Doble cochera..."></textarea>
                  
                  <button onClick={updateLote} className="w-full bg-blue-600 text-white py-3 uppercase font-bold text-[10px] tracking-widest hover:bg-blue-500 shadow-lg mb-2">Guardar Cambios</button>
                  <button onClick={() => deleteLote(editingLote.id)} className="w-full bg-transparent text-red-500 border border-red-900/50 py-2 uppercase font-bold text-[9px] tracking-widest hover:bg-red-900/30 transition-colors">Eliminar Lote</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">1. Seleccionar Lote a Editar</h3>
                <select value={activeLote360?.id || ''} onChange={(e) => {
                  const lote = lotes.find(l => l.id === e.target.value);
                  setActiveLote360(lote); setActiveRoom360(null);
                }} className="w-full bg-black p-3 text-sm border border-[#292524] text-white outline-none focus:border-[#C9A962]">
                  <option value="">-- Elegí un lote --</option>
                  {lotes.map(l => <option key={l.id} value={l.id}>{l.number} ({l.status})</option>)}
                </select>
              </div>

              {activeLote360 && (
                <div className="animate-in fade-in">
                  <h3 className="text-[10px] uppercase tracking-widest text-[#C9A962] mb-3 font-bold border-b border-[#292524] pb-2">Habitaciones del Tour</h3>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    {(activeLote360.housetour || []).map((room: any) => (
                      <div key={room.id} className={`flex items-center justify-between p-2 border ${activeRoom360?.id === room.id ? 'bg-[#C9A962]/20 border-[#C9A962]' : 'bg-black border-[#292524]'}`}>
                        <button onClick={() => setActiveRoom360(room)} className="text-xs font-bold text-left flex-1 text-white">{room.name}</button>
                        <button onClick={() => deleteRoom(room.id)} className="text-red-500 text-[10px] px-2 hover:bg-red-900/30">Borrar</button>
                      </div>
                    ))}
                    {(!activeLote360.housetour || activeLote360.housetour.length === 0) && <p className="text-xs text-gray-500 italic">No hay habitaciones cargadas.</p>}
                  </div>

                  <div className="bg-[#1C1917] p-3 border border-[#292524]">
                    <p className="text-[10px] text-gray-400 uppercase mb-2">Añadir Habitación</p>
                    <input type="text" placeholder="Nombre (Ej: Living)" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full bg-black border border-[#292524] p-2 text-xs mb-2 outline-none text-white" />
                    <input type="text" placeholder="URL Imagen (Ej: /living.jpg)" value={newRoomImg} onChange={e => setNewRoomImg(e.target.value)} className="w-full bg-black border border-[#292524] p-2 text-xs mb-3 outline-none text-white" />
                    <button onClick={addRoom} className="w-full bg-[#C9A962] text-black text-[10px] font-bold uppercase py-2 hover:bg-white transition-colors">Guardar Habitación</button>
                  </div>

                  {activeRoom360 && (
                    <div className="mt-6 p-4 bg-blue-900/10 border border-blue-900">
                      <p className="text-xs text-blue-400 font-bold mb-1">¡Visor 360 Activado!</p>
                      <p className="text-[10px] text-gray-400">Hacé clic en la puerta o lugar del visor donde quieras agregar una flecha (hotspot) para ir a otra habitación.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── ÁREA DE TRABAJO (MAPA / VISOR 360) ── */}
      <main className="flex-1 relative bg-black flex flex-col h-screen">
        
        <div className="h-12 border-b border-[#292524] bg-[#1C1917] flex items-center justify-between px-6 z-40 shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-[#C9A962] font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
            {adminTab === '2D' ? (mode === 'VIEW' ? 'MAPA 2D (LECTURA)' : `DIBUJANDO ${mode === 'DRAW_ZONA' ? 'MANZANA' : 'LOTE'}`) : 'CONSTRUCTOR DE TOURS 360'}
          </span>
          {currentDrawing.length > 0 && adminTab === '2D' && (
            <div className="flex gap-3">
              <button onClick={() => setCurrentDrawing([])} className="text-red-400 text-[10px] uppercase font-bold tracking-widest hover:text-red-300">Limpiar Puntos</button>
              <button onClick={saveDrawing} className="bg-green-600 text-white px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:bg-green-500 transition-colors">Cerrar Polígono y Guardar</button>
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          
          {adminTab === '2D' ? (
            <div className={`relative inline-block max-w-full max-h-full ${mode !== 'VIEW' ? 'cursor-crosshair' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/areo.jpg" alt="Plano" className="max-w-full max-h-[85vh] object-contain pointer-events-none select-none border border-[#292524]" />
              
              <div className="absolute inset-0 z-30" onClick={handleImageClick}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                  
                  {zonas.map(z => (
                    <polygon key={z.id} points={z.polygon} className={`transition-all ${mode === 'DRAW_LOTE' ? 'pointer-events-none stroke-blue-400/30 fill-transparent' : 'pointer-events-auto cursor-pointer'} ${activeZona?.id === z.id ? 'stroke-blue-400 stroke-[0.3] fill-blue-400/10' : 'stroke-white/30 stroke-[0.1] fill-white/5 hover:fill-white/10'}`} onClick={(e) => { e.stopPropagation(); if(mode === 'VIEW') setActiveZona(z); }} />
                  ))}

                  {activeZona && lotes.filter(l => l.zona_id === activeZona.id).map(lot => (
                    <polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); if(mode==='VIEW') openEditor(lot); }} className={`pointer-events-auto cursor-pointer transition-all stroke-[0.2] hover:opacity-80 ${editingLote?.id === lot.id ? 'stroke-white stroke-[0.4] z-50' : 'stroke-white/50'} ${lot.status === 'disponible' ? 'fill-green-500/80' : 'fill-red-500/80'}`} />
                  ))}

                  {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.3] stroke-dasharray-1" />}
                </svg>

                {currentDrawing.map((p, i) => (<div key={i} className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full z-40 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_rgba(0,0,0,1)]" style={{ top: `${p.y}%`, left: `${p.x}%` }} />))}
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative border border-[#292524]">
              {activeRoom360 ? (
                <div ref={containerRef} className="w-full h-full cursor-crosshair" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  <p className="text-sm">Seleccioná un lote y una habitación en el panel izquierdo.</p>
                </div>
              )}

              <AnimatePresence>
                {hotspotModal && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C1917] p-6 border border-[#C9A962] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 w-80">
                    <h4 className="text-[#C9A962] font-bold uppercase text-xs mb-4 text-center tracking-widest">Crear Conexión (Flecha)</h4>
                    
                    <label className="block text-[10px] text-gray-400 uppercase mb-1">Texto de la flecha</label>
                    <input type="text" value={hotspotText} onChange={e => setHotspotText(e.target.value)} className="w-full bg-black p-2.5 text-xs text-white outline-none border border-[#292524] focus:border-[#C9A962] mb-4" />
                    
                    <label className="block text-[10px] text-gray-400 uppercase mb-1">¿A dónde lleva?</label>
                    <select value={hotspotTarget} onChange={e => setHotspotTarget(e.target.value)} className="w-full bg-black p-2.5 text-xs text-white outline-none border border-[#292524] focus:border-[#C9A962] mb-6">
                      <option value="">-- Elegí otra habitación --</option>
                      {activeLote360.housetour.filter((r:any) => r.id !== activeRoom360.id).map((r:any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button onClick={() => setHotspotModal(null)} className="flex-1 bg-transparent text-gray-400 border border-gray-600 text-[10px] uppercase font-bold py-2 hover:text-white">Cancelar</button>
                      <button onClick={saveVisualHotspot} className="flex-1 bg-[#C9A962] text-black text-[10px] uppercase font-bold py-2 hover:bg-white shadow-lg">Guardar</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}  