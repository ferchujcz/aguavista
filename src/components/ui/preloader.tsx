"use client";
import { useState, useEffect } from "react";

export default function Preloader({ children, images }: { children: React.ReactNode; images: string[] }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (images.length === 0) {
      setLoaded(true);
      return;
    }
    let loadedCount = 0;
    const checkLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) setLoaded(true);
    };
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = checkLoad;
      img.onerror = checkLoad;
    });
  }, [images]);

  if (!loaded) return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <p className="text-white/30 tracking-[0.5em] uppercase text-sm animate-pulse">Cargando experiencia...</p>
    </div>
  );
  return <>{children}</>;
}
