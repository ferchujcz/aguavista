'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [zonas, setZonas] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [activeZona, setActiveZona] = useState<any>(null);
  const [editingLote, setEditingLote] = useState<any>(null);
  
  const [currentDrawing, setCurrentDrawing] = useState<{x: number, y: number}[]>([]);
  const [mode, setMode] = useState<'VIEW' | 'DRAW_ZONA' | 'DRAW_LOTE'>('VIEW');
  const [adminTab, setAdminTab] = useState<'2D' | '360'>('2D');

  // ── ESTADOS HERRAMIENTA 360 ──
  const [panoUrl, setPanoUrl] = useState('/exterior.jpg');
  const [lastCoords, setLastCoords] = useState<{pitch: string, yaw: string} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // 1. LOGIN Y FETCH
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
    if (lData) setLotes(lData);
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);

  // 2. MOTOR 360 DEL ADMIN
  useEffect(() => {
    if (adminTab !== '360' || !isAuthenticated) return;

    const initPannellum = () => {
      const pnl = (window as any).pannellum;
      if (!pnl || !containerRef.current) return;

      viewerRef.current = pnl.viewer(containerRef.current, {
        type: 'equirectangular', panorama: panoUrl, autoLoad: true,
        showZoomCtrl: true, showFullscreenCtrl: false
      });

      viewerRef.current.on('mousedown', (event: MouseEvent) => {
        const coords = viewerRef.current.mouseEventToCoords(event);
        setLastCoords({ pitch: coords[0].toFixed(2), yaw: coords[1].toFixed(2) });
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
  }, [adminTab, panoUrl, isAuthenticated]);

  // 3. DIBUJO 2D
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'VIEW') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentDrawing([...currentDrawing, { x, y }]);
  };

  const saveDrawing = async () => {
    if (currentDrawing.length < 3) return alert("Necesitas al menos 3 puntos.");
    const pointsStr = currentDrawing.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    
    if (mode === 'DRAW_ZONA') {
      const { error } = await supabase.from('zonas').insert({
        id: `zona-${Date.now()}`, title: `Manzana ${zonas.length + 1}`, polygon: pointsStr, microimage: '/areozona1.jpg', description: 'Nueva Manzana'
      });
      if (error) alert("Error de Supabase: " + error.message);
    } 
    else if (mode === 'DRAW_LOTE' && activeZona) {
      const centerX = (currentDrawing.reduce((acc, p) => acc + p.x, 0) / currentDrawing.length).toFixed(2);
      const centerY = (currentDrawing.reduce((acc, p) => acc + p.y, 0) / currentDrawing.length).toFixed(2);
      const { error } = await supabase.from('lotes').insert({
        id: `lote-${Date.now()}`, zona_id: activeZona.id, number: `Lote ${lotes.length + 1}`, points: pointsStr, center_x: centerX, center_y: centerY, size: '800m²', status: 'disponible', features: [], housetour: []
      });
      if (error) alert("Error de Supabase: " + error.message);
    }
    setCurrentDrawing([]); setMode('VIEW'); fetchData();
  };

  // 4. EDITOR DE LOTES Y DETALLES
  const openEditor = (lot: any) => {
    setEditingLote({
      ...lot,
      featuresRaw: lot.features ? lot.features.join('\n') : '',
      housetourRaw: lot.housetour ? lot.housetour.map((h:any) => h.image).join('\n') : ''
    });
  };

  const updateLote = async () => {
    // Convierte el texto separado por saltos de línea en Arrays para la Base de Datos
    const featuresArray = editingLote.featuresRaw.split('\n').filter((f:string) => f.trim() !== '');
    const housetourArray = editingLote.housetourRaw.split('\n').filter((h:string) => h.trim() !== '').map((img:string, idx:number) => ({
      id: `room-${idx}`, image: img.trim(), hotspots: [] 
    }));

    const { error } = await supabase.from('lotes').update({
      number: editingLote.number,
      status: editingLote.status,
      size: editingLote.size,
      features: featuresArray,
      housetour: housetourArray
    }).eq('id', editingLote.id);
    
    if (error) alert("Error al actualizar: " + error.message);
    else { alert("Lote actualizado."); setEditingLote(null); fetchData(); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1C1917] p-8 border border-[#292524] w-full max-w-sm text-center">
          <h1 className="text-[#C9A962] text-2xl mb-2 font-[family-name:var(--font-cormorant)]">Centro de Mando</h1>
          <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Masterplan & 360</p>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-black text-white p-3 mb-4 text-center tracking-[1em] outline-none focus:border-[#C9A962] border border-[#292524]" placeholder="****" />
          <button type="submit" className="w-full bg-[#C9A962] text-black font-bold py-3 uppercase text-xs tracking-widest hover:bg-white transition-colors">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C0A09] text-white">
      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-[400px] bg-[#1C1917] border-r border-[#292524] flex flex-col h-screen">
        <div className="p-6 border-b border-[#292524] flex gap-2">
          <button onClick={() => setAdminTab('2D')} className={`flex-1 py-2 text-xs uppercase font-bold tracking-widest transition-colors ${adminTab === '2D' ? 'bg-blue-600 text-white' : 'bg-black text-gray-400 border border-[#292524]'}`}>Mapeo 2D</button>
          <button onClick={() => setAdminTab('360')} className={`flex-1 py-2 text-xs uppercase font-bold tracking-widest transition-colors ${adminTab === '360' ? 'bg-[#C9A962] text-black' : 'bg-black text-gray-400 border border-[#292524]'}`}>Herramienta 360</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {adminTab === '2D' ? (
            <>
              {/* PANEL 2D */}
              {!editingLote ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">1. Manzanas</h3>
                    <button onClick={() => { setMode('DRAW_ZONA'); setActiveZona(null); }} className={`w-full py-3 text-xs font-bold uppercase transition-colors ${mode === 'DRAW_ZONA' ? 'bg-blue-600 text-white' : 'bg-black border border-blue-500 text-blue-400 hover:bg-blue-900/30'}`}>+ Dibujar Manzana</button>
                    <div className="mt-3 flex flex-col gap-2">
                      {zonas.map(z => (
                        <button key={z.id} onClick={() => { setActiveZona(z); setMode('VIEW'); }} className={`p-3 text-sm border text-left transition-colors ${activeZona?.id === z.id ? 'bg-[#C9A962]/20 border-[#C9A962] text-[#C9A962]' : 'bg-black border-[#292524] text-gray-300'}`}>{z.title}</button>
                      ))}
                    </div>
                  </div>

                  {activeZona && (
                    <div className="mb-8">
                      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">2. Lotes en {activeZona.title}</h3>
                      <button onClick={() => setMode('DRAW_LOTE')} className={`w-full py-3 text-xs font-bold uppercase mb-3 transition-colors ${mode === 'DRAW_LOTE' ? 'bg-green-600 text-white' : 'bg-black border border-green-500 text-green-400 hover:bg-green-900/30'}`}>+ Dibujar Lote</button>
                      <p className="text-xs text-gray-500">Tocá un lote en el mapa para editar sus detalles y recorridos 360.</p>
                    </div>
                  )}
                </>
              ) : (
                /* EDITOR DE LOTE COMPLETO */
                <div className="bg-black p-5 border border-blue-500">
                  <div className="flex justify-between mb-4"><h3 className="text-blue-400 text-sm font-bold">Editar Lote</h3><button onClick={() => setEditingLote(null)} className="text-red-400 font-bold">X</button></div>
                  
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Nombre Público</label>
                  <input type="text" value={editingLote.number} onChange={e => setEditingLote({...editingLote, number: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-3 text-sm outline-none border border-[#292524] focus:border-blue-500" />
                  
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 uppercase mb-1">Estado</label>
                      <select value={editingLote.status} onChange={e => setEditingLote({...editingLote, status: e.target.value})} className={`w-full p-2 text-sm outline-none font-bold border ${editingLote.status === 'disponible' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-red-900/30 text-red-400 border-red-700'}`}>
                        <option value="disponible">DISPONIBLE</option><option value="vendido">VENDIDO</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 uppercase mb-1">Metros</label>
                      <input type="text" value={editingLote.size} onChange={e => setEditingLote({...editingLote, size: e.target.value})} className="w-full bg-[#1C1917] p-2 text-sm outline-none border border-[#292524]" />
                    </div>
                  </div>

                  <label className="block text-[10px] text-[#C9A962] font-bold uppercase mt-4 mb-1">Detalles de la Propiedad</label>
                  <p className="text-[9px] text-gray-500 mb-2">Escribí un detalle por renglón (Ej: "3 Habitaciones", "Piscina")</p>
                  <textarea value={editingLote.featuresRaw} onChange={e => setEditingLote({...editingLote, featuresRaw: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-4 text-xs h-24 outline-none border border-[#292524] focus:border-[#C9A962]" placeholder="Piscina infinita&#10;Doble cochera..."></textarea>
                  
                  <label className="block text-[10px] text-[#C9A962] font-bold uppercase mb-1">Recorrido 360 de la Casa</label>
                  <p className="text-[9px] text-gray-500 mb-2">Pegá las rutas de las fotos 360 (Una por renglón)</p>
                  <textarea value={editingLote.housetourRaw} onChange={e => setEditingLote({...editingLote, housetourRaw: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-4 text-xs h-24 outline-none border border-[#292524] focus:border-[#C9A962]" placeholder="/interior-living.webp&#10;/interior-cocina.webp"></textarea>

                  <button onClick={updateLote} className="w-full bg-blue-600 text-white py-3 uppercase font-bold text-xs tracking-widest hover:bg-blue-500 shadow-lg">Guardar Cambios</button>
                </div>
              )}
            </>
          ) : (
            /* PANEL HERRAMIENTA 360 */
            <div>
              <h3 className="text-[#C9A962] text-sm uppercase font-bold mb-2">Buscador de Coordenadas</h3>
              <p className="text-xs text-gray-400 mb-4">Cargá una imagen 360, hacé clic en la pantalla y copiá el punto exacto.</p>
              
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Ruta de la imagen</label>
              <input type="text" value={panoUrl} onChange={e => setPanoUrl(e.target.value)} className="w-full bg-black p-3 mb-6 text-xs outline-none border border-[#292524] text-white" />

              <div className="bg-[#1C1917] border border-dashed border-[#C9A962] p-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Último Clic</p>
                {lastCoords ? (
                  <div className="bg-black p-3 font-mono text-green-400 text-sm border border-green-900 select-all">
                    pitch: {lastCoords.pitch}, yaw: {lastCoords.yaw}
                  </div>
                ) : (
                  <p className="text-xs text-white">Aún no hiciste clic en el visor.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── ÁREA DE TRABAJO (MAPA O VISOR 360) ── */}
      <main className="flex-1 relative bg-black flex flex-col h-screen">
        {adminTab === '2D' ? (
          <>
            <div className="h-12 border-b border-[#292524] bg-[#1C1917] flex items-center justify-between px-6 z-40">
              <span className="text-xs uppercase tracking-widest text-gray-400">{mode === 'VIEW' ? 'Modo de Lectura' : 'Dibujando...'}</span>
              {currentDrawing.length > 0 && (
                <div className="flex gap-3">
                  <button onClick={() => setCurrentDrawing([])} className="text-red-400 text-xs uppercase">Limpiar</button>
                  <button onClick={saveDrawing} className="bg-green-600 text-white px-4 py-1 text-xs uppercase font-bold">Cerrar y Guardar</button>
                </div>
              )}
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
              <div className={`relative inline-block max-w-full max-h-full ${mode !== 'VIEW' ? 'cursor-crosshair' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/areo.jpg" alt="Plano" className="max-w-full max-h-[85vh] object-contain pointer-events-none select-none" />
                <div className="absolute inset-0 z-30" onClick={handleImageClick}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                    {zonas.map(z => (<polygon key={z.id} points={z.polygon} className={`pointer-events-auto cursor-pointer transition-all ${activeZona?.id === z.id ? 'stroke-blue-400 stroke-[0.3] fill-blue-400/20' : 'stroke-white/30 stroke-[0.1] fill-white/5 hover:fill-white/10'}`} onClick={(e) => { e.stopPropagation(); setActiveZona(z); setMode('VIEW'); }} />))}
                    {activeZona && lotes.filter(l => l.zona_id === activeZona.id).map(lot => (<polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); openEditor(lot); setMode('VIEW'); }} className={`pointer-events-auto cursor-pointer transition-all stroke-[0.2] hover:opacity-80 ${editingLote?.id === lot.id ? 'stroke-white stroke-[0.4] z-50' : 'stroke-white/50'} ${lot.status === 'disponible' ? 'fill-green-500/80' : 'fill-red-500/80'}`} />))}
                    {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.3] stroke-dasharray-1" />}
                  </svg>
                  {currentDrawing.map((p, i) => (<div key={i} className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full z-40 -translate-x-1/2 -translate-y-1/2" style={{ top: `${p.y}%`, left: `${p.x}%` }} />))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 relative w-full h-full cursor-crosshair">
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute top-6 left-6 pointer-events-none bg-black/80 px-4 py-2 border border-[#C9A962] text-[#C9A962] text-xs uppercase tracking-widest font-bold">
              Vista 360 Activa - Hacé clic para capturar coordenadas
            </div>
          </div>
        )}
      </main>
    </div>
  );
}