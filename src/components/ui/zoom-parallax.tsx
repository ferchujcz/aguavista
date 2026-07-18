'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

interface ImgData {
    src: string;
    alt?: string;
    isText?: boolean;
}

interface ZoomParallaxProps {
    images: ImgData[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
    const mainContainer = useRef(null);
    const { scrollYProgress: globalScroll } = useScroll({
        target: mainContainer,
        offset: ['start end', 'end start'],
    });
    
    const backgroundY = useTransform(globalScroll, [0, 1], ['0%', '20%']);

    const galleryContainer = useRef(null);
    const { scrollYProgress: galleryScroll } = useScroll({
        target: galleryContainer,
        offset: ['start start', 'end end'],
    });

    const scale4 = useTransform(galleryScroll, [0, 1], [1, 4]);
    const scale5 = useTransform(galleryScroll, [0, 1], [1, 5]);
    const scale6 = useTransform(galleryScroll, [0, 1], [1, 6]);
    const scale8 = useTransform(galleryScroll, [0, 1], [1, 8]);
    const scale9 = useTransform(galleryScroll, [0, 1], [1, 9]);

    const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

    // ── NUEVAS ANIMACIONES PARA EL TEXTO (EFECTO CINEMÁTICO) ──
    const textOpacity = useTransform(galleryScroll, [0, 0.5], [1, 0]);
    const textScale = useTransform(galleryScroll, [0, 0.5], [1, 1.2]); 
    // Nuevo: El texto se desenfoca y sube ligeramente para un efecto 3D
    const textBlur = useTransform(galleryScroll, [0, 0.5], ['blur(0px)', 'blur(12px)']);
    const textY = useTransform(galleryScroll, [0, 0.5], ['0%', '-30%']);

    // ── FUNCIÓN RESPONSIVE PARA POSICIONES ──
    // Da coordenadas abiertas en celular para no pisar el texto, y mantiene el diseño exacto en PC (md:)
    const getResponsivePosition = (index: number) => {
        switch (index) {
            case 1: // Arriba a la derecha
                return "-top-[25vh] left-[10vw] w-[35vw] h-[20vh] md:-top-[30vh] md:left-[5vw] md:w-[35vw] md:h-[30vh]";
            case 2: // Arriba a la izquierda
                return "-top-[25vh] -left-[30vw] w-[40vw] h-[25vh] md:-top-[10vh] md:-left-[25vw] md:w-[20vw] md:h-[45vh]";
            case 3: // Derecha medio
                return "top-[5vh] left-[35vw] w-[30vw] h-[20vh] md:top-0 md:left-[27.5vw] md:w-[25vw] md:h-[25vh]";
            case 4: // Abajo a la derecha
                return "top-[30vh] left-[15vw] w-[35vw] h-[20vh] md:top-[27.5vh] md:left-[5vw] md:w-[20vw] md:h-[25vh]";
            case 5: // Abajo a la izquierda
                return "top-[25vh] -left-[30vw] w-[35vw] h-[20vh] md:top-[27.5vh] md:-left-[22.5vw] md:w-[30vw] md:h-[25vh]";
            case 6: // Izquierda medio
                return "top-[5vh] -left-[35vw] w-[25vw] h-[15vh] md:top-[22.5vh] md:left-[25vw] md:w-[15vw] md:h-[15vh]";
            default: // Imagen central (en caso de que exista y no sea texto)
                return "w-[50vw] h-[25vh] md:w-[25vw] md:h-[25vh]";
        }
    };

    return (
        <section ref={mainContainer} className="relative w-full bg-[#0C0A09]">
            
            {/* ── Fondo Parallax ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    style={{ y: backgroundY }}
                    className="absolute -top-[10%] left-0 w-full h-[120%]"
                >
                    <Image src="/playa.webp" alt="Fondo textura" fill className="object-cover opacity-15" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09] via-transparent to-[#0C0A09]" />
                </motion.div>
            </div>

            {/* ── Textos Principales Superiores ── */}
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 text-center">
                <motion.span 
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs font-light tracking-[0.3em] text-[#C9A962] uppercase mb-8"
                >
                    Un refugio sin precedentes
                </motion.span>
                <motion.h2 
                    initial={{ opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    // Bajé text-4xl a text-3xl/sm:text-4xl para que en móvil no reviente los márgenes
                    className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#FAFAF9] font-light max-w-5xl leading-tight"
                >
                    Cada instalación fue diseñada para que tu experiencia de vida sea <span className="italic text-[#A8A29E]">única.</span>
                </motion.h2>
            </div>

            {/* ── Galería Zoom Parallax ── */}
            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">
        
                    {/* ── TEXTO CENTRAL ANIMADO (BLUR + FADE OUT + FLOAT UP) ── */}
                    <motion.div 
                        style={{ opacity: textOpacity, scale: textScale, filter: textBlur, y: textY }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-50 pointer-events-none"
                    >
                        <span className="font-[family-name:var(--font-josefin)] text-xs md:text-base tracking-[0.4em] text-[#C9A962] uppercase mb-2 drop-shadow-md">
                            Descubrir
                        </span>
                        {/* Reduje text-4xl a text-3xl base para móvil, sube en pantallas más grandes */}
                        <h3 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAFAF9] font-light leading-snug drop-shadow-lg">
                            Conoce nuestras <br/>
                            <span className="italic text-[#A8A29E]">instalaciones</span>
                        </h3>
                    </motion.div>

                    {/* ── MAPEO DE IMÁGENES (CON POSICIONES RESPONSIVE) ── */}
                    {images.map(({ src, alt, isText }, index) => {
                        if (isText) return null;

                        const scale = scales[index % scales.length];
                        return (
                            <motion.div
                                key={index}
                                style={{ scale }}
                                className="absolute top-0 flex h-full w-full items-center justify-center will-change-transform"
                            >
                                {/* Acá inyectamos la función limpia con las posiciones */}
                                <div className={`relative ${getResponsivePosition(index)}`}>
                                    <Image 
                                        src={src || '/placeholder.svg'} 
                                        alt={alt || `Parallax image ${index + 1}`} 
                                        fill 
                                        className="object-cover shadow-2xl" 
                                        priority={true} 
                                        sizes="(max-width: 768px) 100vw, 33vw" 
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}