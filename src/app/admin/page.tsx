'use client';

import { useState, useEffect } from 'react';
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

  // 1. LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') setIsAuthenticated(true);
    else alert('PIN Incorrecto');
  };

  // 2. FETCH DATOS
  const fetchData = async () => {
    const { data: zData } = await supabase.from('zonas').select('*');
    const { data: lData } = await supabase.from('lotes').select('*');
    if (zData) setZonas(zData);
    if (lData) setLotes(lData);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // 3. DIBUJO E INSERCIÓN (CON MANEJO DE ERRORES)
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
        id: `zona-${Date.now()}`,
        title: `Manzana ${zonas.length + 1}`,
        polygon: pointsStr,
        microimage: '/areozona1.jpg',
        description: 'Nueva Manzana'
      });
      if (error) alert("Error de Supabase: " + error.message);
      else alert("Manzana guardada con éxito.");
    } 
    else if (mode === 'DRAW_LOTE' && activeZona) {
      const centerX = (currentDrawing.reduce((acc, p) => acc + p.x, 0) / currentDrawing.length).toFixed(2);
      const centerY = (currentDrawing.reduce((acc, p) => acc + p.y, 0) / currentDrawing.length).toFixed(2);
      const { error } = await supabase.from('lotes').insert({
        id: `lote-${Date.now()}`,
        zona_id: activeZona.id,
        number: `Lote ${lotes.length + 1}`,
        points: pointsStr,
        center_x: centerX,
        center_y: centerY,
        size: '800m²',
        status: 'disponible'
      });
      if (error) alert("Error de Supabase: " + error.message);
      else alert("Lote guardado con éxito.");
    }
    
    setCurrentDrawing([]);
    setMode('VIEW');
    fetchData();
  };

  // 4. EDITAR / ELIMINAR LOTE
  const updateLote = async () => {
    const { error } = await supabase.from('lotes').update({
      number: editingLote.number,
      status: editingLote.status,
      size: editingLote.size
    }).eq('id', editingLote.id);
    
    if (error) alert("Error al actualizar: " + error.message);
    else {
      alert("Actualizado correctamente.");
      setEditingLote(null);
      fetchData();
    }
  };

  const deleteLote = async (id: string) => {
    if(!confirm("¿Seguro que querés borrar este lote?")) return;
    const { error } = await supabase.from('lotes').delete().eq('id', id);
    if (error) alert("Error al borrar: " + error.message);
    else { setEditingLote(null); fetchData(); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1C1917] p-8 border border-[#292524] w-full max-w-sm text-center">
          <h1 className="text-[#C9A962] text-2xl mb-6 font-[family-name:var(--font-cormorant)]">Acceso Backoffice</h1>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-black text-white p-3 mb-4 text-center tracking-[1em]" placeholder="****" />
          <button type="submit" className="w-full bg-[#C9A962] text-black font-bold py-3 uppercase text-xs tracking-widest">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C0A09] text-white">
      {/* SIDEBAR DE HERRAMIENTAS */}
      <aside className="w-full md:w-80 bg-[#1C1917] border-r border-[#292524] p-6 overflow-y-auto">
        <h2 className="text-[#C9A962] text-xl font-[family-name:var(--font-cormorant)] border-b border-[#292524] pb-4 mb-6">Panel de Control</h2>
        
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">1. Gestión de Manzanas</h3>
          <button onClick={() => { setMode('DRAW_ZONA'); setActiveZona(null); setEditingLote(null); }} className={`w-full py-3 text-xs font-bold uppercase transition-colors ${mode === 'DRAW_ZONA' ? 'bg-blue-600 text-white' : 'bg-black border border-blue-500 text-blue-400 hover:bg-blue-900/30'}`}>
            + Dibujar Nueva Manzana
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">2. Seleccionar Manzana</h3>
          <div className="flex flex-col gap-2">
            {zonas.map(z => (
              <button key={z.id} onClick={() => { setActiveZona(z); setMode('VIEW'); setEditingLote(null); }} className={`p-3 text-sm border text-left transition-colors ${activeZona?.id === z.id ? 'bg-[#C9A962]/20 border-[#C9A962] text-[#C9A962]' : 'bg-black border-[#292524] text-gray-300 hover:border-gray-500'}`}>
                {z.title}
              </button>
            ))}
          </div>
        </div>

        {activeZona && (
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">3. Gestión de Lotes</h3>
            <button onClick={() => setMode('DRAW_LOTE')} className={`w-full py-3 text-xs font-bold uppercase transition-colors ${mode === 'DRAW_LOTE' ? 'bg-green-600 text-white' : 'bg-black border border-green-500 text-green-400 hover:bg-green-900/30'}`}>
              + Dibujar Lote en {activeZona.title}
            </button>
          </div>
        )}

        {editingLote && (
          <div className="bg-black p-4 border border-blue-500">
            <h3 className="text-blue-400 text-sm font-bold mb-4">Editar Lote</h3>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">Identificador</label>
            <input type="text" value={editingLote.number} onChange={e => setEditingLote({...editingLote, number: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-3 text-sm outline-none border border-[#292524] focus:border-blue-500" />
            
            <label className="block text-[10px] text-gray-400 uppercase mb-1">Estado</label>
            <select value={editingLote.status} onChange={e => setEditingLote({...editingLote, status: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-3 text-sm outline-none border border-[#292524] focus:border-blue-500">
              <option value="disponible">Disponible</option>
              <option value="vendido">Vendido</option>
            </select>

            <label className="block text-[10px] text-gray-400 uppercase mb-1">Superficie</label>
            <input type="text" value={editingLote.size} onChange={e => setEditingLote({...editingLote, size: e.target.value})} className="w-full bg-[#1C1917] p-2 mb-4 text-sm outline-none border border-[#292524] focus:border-blue-500" />
            
            <div className="flex gap-2">
              <button onClick={() => deleteLote(editingLote.id)} className="flex-1 bg-red-900/50 text-red-400 text-xs py-2 hover:bg-red-600 hover:text-white border border-red-900">Borrar</button>
              <button onClick={updateLote} className="flex-1 bg-blue-600 text-white text-xs py-2 font-bold hover:bg-blue-500">Guardar</button>
            </div>
          </div>
        )}
      </aside>

      {/* ÁREA DE TRABAJO (MAPA) */}
      <main className="flex-1 relative bg-black flex flex-col">
        {/* Barra superior de estado */}
        <div className="h-12 border-b border-[#292524] bg-[#1C1917] flex items-center justify-between px-6">
          <span className="text-xs uppercase tracking-widest text-gray-400">
            {mode === 'VIEW' ? 'Modo de Lectura' : mode === 'DRAW_ZONA' ? 'Dibujando Manzana...' : `Dibujando Lote en ${activeZona?.title}...`}
          </span>
          {currentDrawing.length > 0 && (
            <div className="flex gap-3">
              <button onClick={() => setCurrentDrawing([])} className="text-red-400 text-xs uppercase hover:text-red-300">Limpiar Puntos</button>
              <button onClick={saveDrawing} className="bg-green-600 text-white px-4 py-1 text-xs uppercase font-bold rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]">Cerrar Polígono y Guardar</button>
            </div>
          )}
        </div>

        {/* Lienzo del mapa */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          <div className={`relative inline-block max-w-full max-h-full ${mode !== 'VIEW' ? 'cursor-crosshair' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/areo.jpg" alt="Plano Aéreo" className="max-w-full max-h-[85vh] object-contain pointer-events-none select-none border border-[#292524]" />
            
            <div className="absolute inset-0 z-30" onClick={handleImageClick}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Dibujar Manzanas */}
                {zonas.map(z => (
                  <polygon key={z.id} points={z.polygon} className={`pointer-events-auto cursor-pointer transition-all ${activeZona?.id === z.id ? 'stroke-blue-400 stroke-[0.3] fill-blue-400/20' : 'stroke-white/30 stroke-[0.1] fill-white/5 hover:fill-white/10'}`} onClick={(e) => { e.stopPropagation(); setActiveZona(z); setMode('VIEW'); }} />
                ))}

                {/* Dibujar Lotes de la manzana activa */}
                {activeZona && lotes.filter(l => l.zona_id === activeZona.id).map(lot => (
                  <polygon key={lot.id} points={lot.points} onClick={(e) => { e.stopPropagation(); setEditingLote(lot); setMode('VIEW'); }} className={`pointer-events-auto cursor-pointer transition-all stroke-[0.2] hover:opacity-80 ${editingLote?.id === lot.id ? 'stroke-white stroke-[0.4] z-50' : 'stroke-white/50'} ${lot.status === 'disponible' ? 'fill-green-500/80' : 'fill-red-500/80'}`} />
                ))}

                {/* Dibujo actual en vivo */}
                {currentDrawing.length > 0 && <polyline points={currentDrawing.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-yellow-400 stroke-[0.3] stroke-dasharray-1" />}
              </svg>

              {/* Puntos de dibujo */}
              {currentDrawing.map((p, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full z-40 -translate-x-1/2 -translate-y-1/2 shadow-lg" style={{ top: `${p.y}%`, left: `${p.x}%` }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}