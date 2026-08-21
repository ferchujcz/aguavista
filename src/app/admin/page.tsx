'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [zonas, setZonas] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState({ imagen_360: '/exterior.jpg', imagen_2d: '/areo.jpg' });

  // ESTADOS 2D
  const [activeZona, setActiveZona] = useState<any>(null);
  const [editingLote, setEditingLote] = useState<any>(null);
  const [currentDrawing, setCurrentDrawing] = useState<{x: number, y: number}[]>([]);
  const [mode, setMode] = useState<'VIEW' | 'DRAW_ZONA' | 'DRAW_LOTE'>('VIEW');
  
  // ESTADOS 360
  const [adminTab, setAdminTab] = useState<'2D' | '360' | 'CONFIG'>('2D');
  const [mode360, setMode360] = useState<'GLOBAL' | 'HOUSE'>('GLOBAL');
  const [activeLote360, setActiveLote360] = useState<any>(null);
  const [activeRoom360, setActiveRoom360] = useState<any>(null);
  const [newRoomImg, setNewRoomImg] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  
  const [hotspotModal, setHotspotModal] = useState<{pitch: number, yaw: number} | null>(null);
  const [hotspotTarget, setHotspotTarget] = useState('');
  const [hotspotText, setHotspotText] = useState('Ir a...');

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (pinInput === '1234') setIsAuthenticated(true); else alert('PIN Incorrecto'); };

  const fetchData = async () => {
    const { data: zData } = await supabase.from('zonas').select('*');
    const { data: lData } = await supabase.from('lotes').select('*');
    if (zData && zData.length > 0) {
      setZonas(zData);
      setGlobalConfig({ imagen_360: zData[0].imagen_360 || '/exterior.jpg', imagen_2d: zData[0].imagen_2d || '/areo.jpg' });
    } else {
      setZonas([]);
    }
    if (lData) {
      setLotes(lData);
      if (activeLote360) {
        const updatedLote = lData.find(l => l.id === activeLote360.id);
        setActiveLote360(updatedLote);
        if (activeRoom360 && updatedLote) setActiveRoom360(updatedLote.housetour?.find((r:any) => r.id === activeRoom360.id));
      }
    }
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);

  // ── MOTOR 360 DEL ADMIN ──
  useEffect(() => {
    if (adminTab !== '360' || !isAuthenticated) return;
    if (mode360 === 'HOUSE' && !activeRoom360) return;

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;

      const imageToLoad = mode360 === 'GLOBAL' ? globalConfig.imagen_360 : activeRoom360.image;
      
      let hotSpots: any[] = [];
      if (mode360 === 'GLOBAL') {
        hotSpots = zonas.filter(z => z.pitch && z.yaw).map(z => ({
          pitch: parseFloat(z.pitch), yaw: parseFloat(z.yaw), type: 'custom', cssClass: 'punto-dorado',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${z.title}</span>`; }
        }));
      } else if (mode360 === 'HOUSE') {
        hotSpots = activeRoom360.hotspots?.map((hs: any) => ({
          pitch: hs.pitch, yaw: hs.yaw, type: 'custom', cssClass: 'punto-dorado-calle',
          createTooltipFunc: (div: any) => { div.innerHTML = `<span class="cartel-flotante text-[10px]">${hs.text}</span>`; }
        })) || [];
      }

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: imageToLoad, autoLoad: true, showZoomCtrl: true, showFullscreenCtrl: false, hotSpots: hotSpots
      });
    };

    if (!(window as any).pannellum) {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'; script.async = true;
      document.body.appendChild(script); script.onload = initPannellum;
    } else { setTimeout(initPannellum, 100); }

    return () => { if (viewerRef.current) { viewerRef.current.destroy(); viewerRef.current = null; } };
  }, [adminTab, mode360, activeRoom360, zonas, globalConfig.imagen_360, isAuthenticated]);

  // ── FUNCIÓN DE CAPTURA CON MIRA CENTRAL ──
  const captureCenterHotspot = () => {
    if (!viewerRef.current) return;
    const pitch = viewerRef.current.getPitch().toFixed(2);
    const yaw = viewerRef.current.getYaw().toFixed(2);
    setHotspotModal({ pitch: parseFloat(pitch), yaw: parseFloat(yaw) });
  };

  // ── ACTUALIZAR CONFIGURACIÓN GLOBAL ──
  const updateGlobalImages = async () => {
    if (zonas.length === 0) return alert("Debes crear al menos una manzana primero.");
    const { error } = await supabase.from('zonas').update({ imagen_360: globalConfig.imagen_360, imagen_2d: globalConfig.imagen_2d }).eq('id', zonas[0].id);
    if (error) alert("Error: " + error.message);
    else alert("Imágenes actualizadas. Recordá subir los archivos a tu carpeta public.");
  };

  // ── LÓGICAS CRUD ──
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'VIEW') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentDrawing([...currentDrawing, { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }]);
  };

  const saveDrawing = async () => {
    if (currentDrawing.length < 3) return alert("Mínimo 3 puntos.");
    const pointsStr = currentDrawing.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    
    if (mode === 'DRAW_ZONA') {
      const newZona = { id: `zona-${Date.now()}`, title: `Manzana ${zonas.length + 1}`, polygon: pointsStr, microimage: '/areozona1.jpg', imagen_360: globalConfig.imagen_360, imagen_2d: globalConfig.imagen_2d };
      setZonas([...zonas, newZona]); // Optimista
      await supabase.from('zonas').insert(newZona);
    } else if (mode === 'DRAW_LOTE' && activeZona) {
      const cX = (currentDrawing.reduce((a, p) => a + p.x, 0) / currentDrawing.length).toFixed(2);
      const cY = (currentDrawing.reduce((a, p) => a + p.y, 0) / currentDrawing.length).toFixed(2);
      await supabase.from('lotes').insert({ id: `lote-${Date.now()}`, zona_id: activeZona.id, number: `Lote Nuevo`, points: pointsStr, center_x: cX, center_y: cY, size: '800m²', price: 'Consultar', status: 'disponible', features: [], housetour: [] });
    }
    setCurrentDrawing([]); setMode('VIEW'); fetchData();
  };

  // BORRADO OPTIMISTA (Instantáneo visualmente)
  const deleteZona = async (id: string) => { 
    if(!confirm("¿Borrar Manzana y sus lotes?")) return;
    setZonas(prev => prev.filter(z => z.id !== id));
    if (activeZona?.id === id) setActiveZona(null);
    const { error } = await supabase.from('zonas').delete().eq('id', id);
    if (error) { alert("Error al borrar: " + error.message); fetchData(); }
  };

  const deleteLote = async (id: string) => { 
    if(!confirm("¿Borrar este lote?")) return;
    setLotes(prev => prev.filter(l => l.id !== id));
    setEditingLote(null);
    await supabase.from('lotes').delete().eq('id', id);
  };

  const openEditor = (lot: any) => { setEditingLote({ ...lot, featuresRaw: lot.features ? lot.features.join('\n') : '' }); };

  const updateLote = async () => {
    const featuresArray = editingLote.featuresRaw ? editingLote.featuresRaw.split('\n').filter((f:string) => f.trim() !== '') : [];
    await supabase.from('lotes').update({ number: editingLote.number, status: editingLote.status, size: editingLote.size, price: editingLote.price, features: featuresArray }).eq('id', editingLote.id);
    alert("Lote actualizado."); setEditingLote(null); fetchData();
  };

  const saveVisualHotspot = async () => {
    if (!hotspotModal) return;
    if (mode360 === 'GLOBAL') {
      if (!hotspotTarget) return alert('Seleccioná una manzana destino.');
      await supabase.from('zonas').update({ pitch: hotspotModal.pitch, yaw: hotspotModal.yaw }).eq('id', hotspotTarget);
    } else {
      if (!hotspotTarget || !activeLote360 || !activeRoom360) return;
      const newHotspot = { pitch: hotspotModal.pitch, yaw: hotspotModal.yaw, targetId: hotspotTarget, text: hotspotText };
      const updatedTour = activeLote360.housetour.map((r: any) => r.id === activeRoom360.id ? { ...r, hotspots: [...(r.hotspots || []), newHotspot] } : r);
      await supabase.from('lotes').update({ housetour: updatedTour }).eq('id', activeLote360.id);
    }
    setHotspotModal(null); setHotspotTarget(''); setHotspotText('Ir a...'); fetchData(); 
  };

  const removeGlobalHotspot = async (zonaId: string) => { await supabase.from('zonas').update({ pitch: null, yaw: null }).eq('id', zonaId); fetchData(); };
  const removeHouseHotspot = async (roomId: string, targetId: string) => {
    const updatedTour = activeLote360.housetour.map((r:any) => r.id === roomId ? { ...r, hotspots: r.hotspots.filter((h:any) => h.targetId !== targetId) } : r);
    await supabase.from('lotes').update({ housetour: updatedTour }).eq('id', activeLote360.id); fetchData();
  };
  const addRoom = async () => {
    if (!newRoomName || !newRoomImg || !activeLote360) return;
    const newRoom = { id: newRoomName.toLowerCase().replace(/\s+/g, '-'), name: newRoomName, image: newRoomImg, hotspots: [] };
    await supabase.from('lotes').update({ housetour: [...(activeLote360.housetour || []), newRoom] }).eq('id', activeLote360.id);
    setNewRoomName(''); setNewRoomImg(''); fetchData();
  };
  const deleteRoom = async (roomId: string) => {
    if(!confirm("¿Borrar habitación?")) return;
    await supabase.from('lotes').update({ housetour: activeLote360.housetour.filter((r:any) => r.id !== roomId) }).eq('id', activeLote360.id);
    if(activeRoom360?.id === roomId) setActiveRoom360(null); fetchData();
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-[#1C1917] p-8 border border-[#292524] w-full max-w-sm text-center shadow-2xl">
        <h1 className="text-[#C9A962] text-2xl mb-2 font-[family-name:var(--font-cormorant)]">Centro de Mando</h1>
        <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest">Panel de Control</p>
        <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-black text-white p-3 mb-4 text-center tracking-[1em] border border-[#292524] outline-none focus:border-[#C9A962]" placeholder="****" />
        <button type="submit" className="w-full bg-[#C9A962] text-black font-bold py-3 uppercase text-xs tracking-widest hover:bg-white transition-colors">Ingresar</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C0A09] text-white overflow-hidden">
      <aside className="w-full md:w-[400px] bg-[#1C1917] border-r border-[#292524] flex flex-col h-screen shrink-0">
        <div className="p-4 border-b border-[#292524] flex gap-2">
          <button onClick={() => { setAdminTab('2D'); setMode('VIEW'); setHotspotModal(null); }} className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${adminTab === '2D' ? 'bg-blue-600 text-white' : 'bg-black text-gray-400 border border-[#292524]'}`}>Mapeo 2D</button>
          <button onClick={() => { setAdminTab('360'); setMode('VIEW'); setHotspotModal(null); }} className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${adminTab === '360' ? 'bg-[#C9A962] text-black' : 'bg-black text-gray-400 border border-[#292524]'}`}>Tours 360</button>
          <button onClick={() => { setAdminTab('CONFIG'); setMode('VIEW'); setHotspotModal(null); }} className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors ${adminTab === 'CONFIG' ? 'bg-green-600 text-white' : 'bg-black text-gray-400 border border-[#292524]'}`}>Config</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {adminTab === 'CONFIG' && (
            <div className="animate-in fade-in">
              <h3 className="text-[10px] uppercase tracking-widest text-[#C9A962] mb-3 font-bold">Imágenes Principales</h3>
              <p className="text-xs text-gray-400 mb-4">Cambiá la foto de fondo del mapa general o el cielo 360.</p>
              
              <label className="block text-[10px] text-gray-400 uppercase mb-1">URL Imagen Aérea 2D</label>
              <input type="text" value={globalConfig.imagen_2d} onChange={e => setGlobalConfig({...globalConfig, imagen_2d: e.target.value})} className="w-full bg-black p-3 mb-4 text-xs text-white border border-[#292524] outline-none" />
              
              <label className="block text-[10px] text-gray-400 uppercase mb-1">URL Cielo 360</label>
              <input type="text" value={globalConfig.imagen_360} onChange={e => setGlobalConfig({...globalConfig, imagen_360: e.target.value})} className="w-full bg-black p-3 mb-6 text-xs text-white border border-[#292524] outline-none" />
              
              <button onClick={updateGlobalImages} className="w-full bg-green-600 text-white font-bold uppercase text-[10px] py-3 tracking-widest">Actualizar Imágenes</button>
            </div>
          )}

          {adminTab === '2D' && (
            <>
              {!editingLote ? (
                <>
                  <div className="mb-8">
                    <button onClick={() => { setMode('DRAW_ZONA'); setActiveZona(null); }} className={`w-full py-3 text-[10px] font-bold uppercase transition-colors shadow-lg ${mode === 'DRAW_ZONA' ? 'bg-blue-600 text-white' : 'bg-blue-900/20 border border-blue-800 text-blue-400'}`}>+ Dibujar Manzana</button>
                    <div className="mt-3 flex flex-col gap-2">
                      {zonas.map(z => (
                        <div key={z.id} className="flex gap-2">
                          <button onClick={() => { setActiveZona(z); setMode('VIEW'); }} className={`flex-1 p-3 text-xs border text-left transition-colors ${activeZona?.id === z.id ? 'bg-[#C9A962]/20 border-[#C9A962] text-[#C9A962] font-bold' : 'bg-black border-[#292524] text-gray-300'}`}>{z.title}</button>
                          <button onClick={() => deleteZona(z.id)} className="px-3 bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white transition-colors">X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeZona && (
                    <div className="mb-8 animate-in fade-in">
                      <button onClick={() => setMode('DRAW_LOTE')} className={`w-full py-3 text-[10px] font-bold uppercase mb-3 transition-colors shadow-lg ${mode === 'DRAW_LOTE' ? 'bg-green-600 text-white' : 'bg-green-900/20 border border-green-800 text-green-400'}`}>+ Dibujar Lote Nuevo en {activeZona.title}</button>
                      <div className="flex flex-col gap-2 mt-2">
                        {lotes.filter(l => l.zona_id === activeZona.id).map(lot => (
                          <div key={lot.id} className="flex gap-2 items-center bg-black border border-[#292524] p-2">
                            <button onClick={() => { setEditingLote(lot); openEditor(lot); }} className="flex-1 text-left text-xs text-gray-300 hover:text-white px-2 py-1">{lot.number} <span className={lot.status === 'disponible' ? 'text-green-500' : 'text-red-500'}>({lot.status})</span></button>
                            <button onClick={() => deleteLote(lot.id)} className="text-red-500 px-2 py-1 hover:bg-red-900/30 rounded">X</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-black p-5 border border-blue-500 animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-5 border-b border-[#292524] pb-3"><h3 className="text-blue-400 text-sm font-bold uppercase">Editar Lote</h3><button onClick={() => setEditingLote(null)} className="text-gray-500 hover:text-white">Volver</button></div>
                  <input type="text" value={editingLote.number} onChange={e => setEditingLote({...editingLote, number: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-3 text-sm outline-none border border-[#292524] text-white" placeholder="Nombre (Lote 1)" />
                  <input type="text" value={editingLote.price || ''} onChange={e => setEditingLote({...editingLote, price: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-3 text-sm outline-none border border-[#292524] text-green-400 font-bold" placeholder="Precio (USD)" />
                  <div className="flex gap-3 mb-3">
                    <select value={editingLote.status} onChange={e => setEditingLote({...editingLote, status: e.target.value})} className="w-full p-2.5 text-sm outline-none font-bold bg-[#1C1917] text-white border border-[#292524]"><option value="disponible">DISPONIBLE</option><option value="vendido">VENDIDO</option></select>
                    <input type="text" value={editingLote.size} onChange={e => setEditingLote({...editingLote, size: e.target.value})} className="w-full bg-[#1C1917] p-2.5 text-sm outline-none border border-[#292524] text-white" placeholder="Mts2" />
                  </div>
                  <textarea value={editingLote.featuresRaw} onChange={e => setEditingLote({...editingLote, featuresRaw: e.target.value})} className="w-full bg-[#1C1917] p-2.5 mb-6 text-xs h-24 outline-none border border-[#292524] text-white" placeholder="Detalles (Piscina, Quincho)"></textarea>
                  <button onClick={updateLote} className="w-full bg-blue-600 text-white py-3 uppercase font-bold text-[10px] tracking-widest shadow-lg">Guardar Lote</button>
                </div>
              )}
            </>
          )}

          {adminTab === '360' && (
            <>
              <div className="flex bg-[#1C1917] border border-[#292524] mb-6 p-1 rounded">
                <button onClick={() => {setMode360('GLOBAL'); setHotspotModal(null);}} className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${mode360 === 'GLOBAL' ? 'bg-[#C9A962] text-black' : 'text-gray-400 hover:text-white'}`}>Cielo General</button>
                <button onClick={() => {setMode360('HOUSE'); setHotspotModal(null);}} className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${mode360 === 'HOUSE' ? 'bg-[#C9A962] text-black' : 'text-gray-400 hover:text-white'}`}>Interior Casas</button>
              </div>

              {mode360 === 'GLOBAL' ? (
                <div className="animate-in fade-in">
                  <h3 className="text-[10px] uppercase tracking-widest text-[#C9A962] mb-3 font-bold">Puntos Hacia Manzanas</h3>
                  <div className="flex flex-col gap-2">
                    {zonas.filter(z => z.pitch && z.yaw).map(z => (
                      <div key={z.id} className="flex justify-between items-center bg-black border border-[#292524] p-3 text-xs"><span className="font-bold">{z.title}</span><button onClick={() => removeGlobalHotspot(z.id)} className="text-red-500">Borrar Punto</button></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in">
                  <select value={activeLote360?.id || ''} onChange={(e) => { setActiveLote360(lotes.find(l => l.id === e.target.value)); setActiveRoom360(null); }} className="w-full bg-black p-3 text-sm border border-[#292524] text-white outline-none mb-4">
                    <option value="">-- Elegí Lote --</option>
                    {lotes.map(l => <option key={l.id} value={l.id}>{l.number}</option>)}
                  </select>

                  {activeLote360 && (
                    <>
                      <div className="flex flex-col gap-2 mb-4">
                        {(activeLote360.housetour || []).map((room: any) => (
                          <div key={room.id} className={`p-2 border flex flex-col gap-2 ${activeRoom360?.id === room.id ? 'bg-[#C9A962]/10 border-[#C9A962]' : 'bg-black border-[#292524]'}`}>
                            <div className="flex justify-between items-center">
                              <button onClick={() => setActiveRoom360(room)} className="text-xs font-bold text-left flex-1">{room.name}</button>
                              <button onClick={() => deleteRoom(room.id)} className="text-red-500 text-[10px] px-2 border border-red-900/50">X Hab.</button>
                            </div>
                            {room.hotspots?.map((hs:any, i:number) => (
                              <div key={i} className="flex justify-between text-[9px] text-gray-400 pl-2 border-l border-gray-700">
                                <span>Flecha: "{hs.text}"</span><button onClick={() => removeHouseHotspot(room.id, hs.targetId)} className="text-red-400">Borrar</button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#1C1917] p-3 border border-[#292524]">
                        <input type="text" placeholder="Nombre (Living)" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full bg-black border border-[#292524] p-2 text-xs mb-2 text-white" />
                        <input type="text" placeholder="URL Imagen (/living.jpg)" value={newRoomImg} onChange={e => setNewRoomImg(e.target.value)} className="w-full bg-black border border-[#292524] p-2 text-xs mb-3 text-white" />
                        <button onClick={addRoom} className="w-full bg-[#C9A962] text-black text-[10px] font-bold uppercase py-2">Guardar Habitación</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 relative bg-black flex flex-col h-screen">
        <div className="h-12 border-b border-[#292524] bg-[#1C1917] flex items-center justify-between px-6 z-40 shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-[#C9A962] font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
            {adminTab === '2D' ? (mode === 'VIEW' ? 'MAPA 2D' : `DIBUJANDO`) : 'VISOR 360'}
          </span>
          {currentDrawing.length > 0 && adminTab === '2D' && (
            <div className="flex gap-3">
              <button onClick={() => setCurrentDrawing([])} className="text-red-400 text-[10px] uppercase font-bold">Limpiar</button>
              <button onClick={saveDrawing} className="bg-green-600 text-white px-4 py-1.5 text-[10px] uppercase font-bold">Guardar</button>
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          
          <div className={`absolute inset-0 w-full h-full z-20 ${adminTab === '2D' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`w-full h-full flex items-center justify-center relative ${mode !== 'VIEW' ? 'cursor-crosshair' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={globalConfig.imagen_2d} alt="Plano" className="max-w-full max-h-[85vh] object-contain pointer-events-none select-none border border-[#292524]" />
              <div className="absolute inset-0 z-30" onClick={handleImageClick}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                  {zonas.map(z => (<polygon key={z.id} points={z.polygon} className={`transition-all ${mode === 'DRAW_LOTE' ? 'pointer-events-none stroke-blue-400/30 fill-transparent' : 'pointer-events-auto cursor-pointer'} ${activeZona?.id === z.id ? 'stroke-blue-400 stroke-[0.3] fill-blue-400/10' : 'stroke-white/30 stroke-[0.1] fill-white/5 hover:fill-white/10'}`} onClick={(e) => { e.stopPropagation(); if(mode === 'VIEW') setActiveZona(z); }} />))}
                  {activeZona && lotes.filter(l => l.zona_id === activeZona.id).map(lot => (<polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); if(mode==='VIEW'){ setEditingLote(lot); openEditor(lot); } }} className={`pointer-events-auto cursor-pointer transition-all stroke-[0.2] hover:opacity-80 ${editingLote?.id === lot.id ? 'stroke-white stroke-[0.4] z-50' : 'stroke-white/50'} ${lot.status === 'disponible' ? 'fill-green-500/80' : 'fill-red-500/80'}`} />))}
                  {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.3] stroke-dasharray-1" />}
                </svg>
                {currentDrawing.map((p, i) => (<div key={i} className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full z-40 -translate-x-1/2 -translate-y-1/2 shadow-lg" style={{ top: `${p.y}%`, left: `${p.x}%` }} />))}
              </div>
            </div>
          </div>

          <div className={`absolute inset-0 w-full h-full z-10 ${adminTab === '360' || adminTab === 'CONFIG' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             {/* ── MIRA CENTRAL PROFESIONAL PARA CAPTURA 360 ── */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                <svg width="40" height="40" viewBox="0 0 40 40">
                   <circle cx="20" cy="20" r="2" fill="#C9A962" />
                   <circle cx="20" cy="20" r="12" fill="none" stroke="#C9A962" strokeWidth="2" strokeDasharray="4 4" />
                   <line x1="20" y1="0" x2="20" y2="8" stroke="#C9A962" strokeWidth="2" />
                   <line x1="20" y1="32" x2="20" y2="40" stroke="#C9A962" strokeWidth="2" />
                   <line x1="0" y1="20" x2="8" y2="20" stroke="#C9A962" strokeWidth="2" />
                   <line x1="32" y1="20" x2="40" y2="20" stroke="#C9A962" strokeWidth="2" />
                </svg>
             </div>
             
             {/* ── BOTÓN GIGANTE DE CAPTURA ── */}
             {adminTab === '360' && !hotspotModal && ((mode360 === 'GLOBAL') || (mode360 === 'HOUSE' && activeRoom360)) && (
               <button onClick={captureCenterHotspot} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-[#C9A962] text-black px-6 py-3 font-bold uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(201,169,98,0.5)] hover:bg-white transition-all hover:scale-105">
                 📍 Fijar Punto Aquí
               </button>
             )}

             <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
             
             <AnimatePresence>
                {hotspotModal && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C1917] p-6 border border-[#C9A962] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 w-80">
                    <h4 className="text-[#C9A962] font-bold uppercase text-xs mb-4 text-center tracking-widest">{mode360 === 'GLOBAL' ? 'Asignar Punto en el Cielo' : 'Crear Flecha 360'}</h4>
                    {mode360 === 'HOUSE' && <input type="text" value={hotspotText} onChange={e => setHotspotText(e.target.value)} placeholder="Texto flecha (Ej: Ir al patio)" className="w-full bg-black p-2.5 text-xs text-white outline-none border border-[#292524] mb-4" />}
                    <select value={hotspotTarget} onChange={e => setHotspotTarget(e.target.value)} className="w-full bg-black p-2.5 text-xs text-white outline-none border border-[#292524] mb-6">
                      <option value="">-- Destino --</option>
                      {mode360 === 'GLOBAL' ? zonas.filter(z => !z.pitch).map(z => <option key={z.id} value={z.id}>{z.title}</option>) : activeLote360.housetour.filter((r:any) => r.id !== activeRoom360.id).map((r:any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => setHotspotModal(null)} className="flex-1 bg-transparent text-gray-400 border border-gray-600 text-[10px] uppercase font-bold py-2 hover:text-white">Cancelar</button>
                      <button onClick={saveVisualHotspot} className="flex-1 bg-[#C9A962] text-black text-[10px] uppercase font-bold py-2 shadow-lg hover:bg-white">Guardar</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}