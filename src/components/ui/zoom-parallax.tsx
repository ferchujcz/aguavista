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
                    className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl lg:text-7xl text-[#FAFAF9] font-light max-w-5xl leading-tight"
                >
                    Cada instalación fue diseñada para que tu experiencia de vida sea <span className="italic text-[#A8A29E]">única.</span>
                </motion.h2>
            </div>

            {/* ── Galería Zoom Parallax ── */}
            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">
        
                    {/* ── TEXTO CENTRAL FIJO (Sin animaciones raras, adaptado a celular) ── */}
                    {/* Al estar primero en el código, queda naturalmente "detrás" de las fotos, evitando que las pise */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none z-0">
                        <span className="font-[family-name:var(--font-josefin)] text-[10px] md:text-base tracking-[0.4em] text-[#C9A962] uppercase mb-2 drop-shadow-md">
                            Descubrir
                        </span>
                        {/* Reduje a text-2xl/3xl en móvil para que entre perfecto en el hueco del medio */}
                        <h3 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-[#FAFAF9] font-light leading-snug drop-shadow-lg">
                            Conoce nuestras <br/>
                            <span className="italic text-[#A8A29E]">instalaciones</span>
                        </h3>
                    </div>

                    {/* ── MAPEO DE IMÁGENES (POSICIONES ORIGINALES INTACTAS) ── */}
                    {images.map(({ src, alt, isText }, index) => {
                        if (isText) return null;

                        const scale = scales[index % scales.length];
                        return (
                            <motion.div
                                key={index}
                                style={{ scale }}
                                className={`absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
                            >
                                <div className="relative h-[25vh] w-[25vw]">
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