'use client';

import { useScroll, useTransform, motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

import { SplitText } from '@/components/motion/SplitText';
import { SlideUp, organicDelay } from '@/components/motion/SlideUp';
import { EASE_LUX } from '@/components/motion/Reveal';

interface ImgData {
    src: string;
    alt?: string;
}

interface ZoomParallaxProps {
    images: ImgData[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
    const reduceMotion = useReducedMotion();

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

    const revealed = useInView(galleryContainer, { once: true, amount: 0.2 });

    /* 
     * ── ANIMACIONES DE EXPANSIÓN Y ZOOM ──
     * Las fotos crecen y se separan violentamente hacia los extremos 
     * liberando todo el lienzo central.
     */
    const globalScale = useTransform(galleryScroll, [0, 0.75], [1, 3.8]);
    
    const spreadX_FarLeft = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '-45vw']);
    const spreadX_Left = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '-25vw']);
    const spreadX_Right = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '25vw']);
    const spreadX_FarRight = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '45vw']);
    
    const spreadY_Top = useTransform(galleryScroll, [0.15, 0.65], ['0vh', '-45vh']);
    const spreadY_Bottom = useTransform(galleryScroll, [0.15, 0.65], ['0vh', '45vh']);

    /* 
     * ── ANIMACIÓN DEL TEXTO ──
     * Aparece en el hueco perfecto que dejan las fotos al volar.
     */
    const textOpacity = useTransform(galleryScroll, [0.45, 0.65], [0, 1]);
    const textScale = useTransform(galleryScroll, [0.45, 0.65], [0.9, 1]);

    /* 
     * ── EFECTO PUZZLE (MASONRY LAYOUT) ──
     * Matemática estricta: Mezcla de formatos verticales y horizontales 
     * con una separación perfecta de 2vw/2vh entre bordes.
     */
    const getInitialClasses = (index: number) => {
        switch (index) {
            // 1. Izquierda: Rectángulo vertical alto
            case 0: return '[&>div]:!-top-[11vh] [&>div]:!-left-[20vw] [&>div]:!h-[20vh] [&>div]:!w-[38vw] md:[&>div]:!top-[0vh] md:[&>div]:!-left-[19vw] md:[&>div]:!h-[36vh] md:[&>div]:!w-[16vw]'; 
            // 2. Centro Arriba: Cuadrado/Rectángulo apaisado
            case 1: return '[&>div]:!-top-[6vh] [&>div]:!left-[20vw] [&>div]:!h-[30vh] [&>div]:!w-[38vw] md:[&>div]:!-top-[10vh] md:[&>div]:!left-[0vw] md:[&>div]:!h-[20vh] md:[&>div]:!w-[18vw]'; 
            // 3. Centro Abajo: Rectángulo muy horizontal
            case 2: return '[&>div]:!top-[11vh] [&>div]:!-left-[20vw] [&>div]:!h-[20vh] [&>div]:!w-[38vw] md:[&>div]:!top-[10vh] md:[&>div]:!left-[0vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[18vw]'; 
            // 4. Derecha Arriba: Cuadrado chico
            case 3: return '[&>div]:!top-[18vh] [&>div]:!left-[20vw] [&>div]:!h-[14vh] [&>div]:!w-[38vw] md:[&>div]:!-top-[12vh] md:[&>div]:!left-[19vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[16vw]'; 
            // 5. Derecha Abajo: Rectángulo vertical
            case 4: return 'hidden md:flex md:[&>div]:!top-[7vh] md:[&>div]:!left-[19vw] md:[&>div]:!h-[18vh] md:[&>div]:!w-[16vw]'; 
            default: return '';
        }
    };

    // Asignamos trayectorias únicas para que no choquen al expandirse
    const getTransforms = (index: number) => {
        if (reduceMotion) return { scale: 1, x: '0vw', y: '0vh' };
        switch (index) {
            case 0: return { scale: globalScale, x: spreadX_FarLeft, y: spreadY_Top };
            case 1: return { scale: globalScale, x: spreadX_Left, y: spreadY_Top };
            case 2: return { scale: globalScale, x: spreadX_Left, y: spreadY_Bottom };
            case 3: return { scale: globalScale, x: spreadX_FarRight, y: spreadY_Top };
            case 4: return { scale: globalScale, x: spreadX_FarRight, y: spreadY_Bottom };
            default: return { scale: 1, x: '0vw', y: '0vh' };
        }
    };

    return (
        <section ref={mainContainer} className="relative w-full bg-[color:var(--av-base)]">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute -top-[10%] left-0 w-full h-[120%]"
                >
                    <Image src="/playa.webp" alt="Fondo textura" fill className="object-cover opacity-15" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--av-base)] via-transparent to-[color:var(--av-base)]" />
                </motion.div>
            </div>

            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-6 text-center md:px-10">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(50% 40% at 50% 50%, color-mix(in oklab, var(--av-base) 80%, transparent) 0%, transparent 70%)',
                    }}
                />

                <SlideUp
                    className="relative"
                    innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs font-light tracking-[0.3em] text-[color:var(--av-lux)] uppercase mb-8"
                >
                    Un refugio sin precedentes
                </SlideUp>

                <SplitText
                    as="h2"
                    text="No se trata solo de todo lo que AguaVista tiene, sino de todo lo que te permite vivir"
                    delay={0.15}
                    className="relative font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto"
                />
            </div>

            <div ref={galleryContainer} className="relative h-[250vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO CENTRAL QUE APARECE CON EL SCROLL ── */}
                    <motion.div
                        style={{ opacity: reduceMotion ? 1 : textOpacity, scale: reduceMotion ? 1 : textScale }}
                        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center md:px-10"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_95%,transparent)_0%,transparent_70%)] md:bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_80%,transparent)_0%,transparent_50%)] opacity-100" />
                        
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <span className="font-[family-name:var(--font-josefin)] text-[10px] md:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-4 md:mb-6">
                                Hay mucho más por descubrir
                            </span>

                            <h3 className="w-full max-w-[95%] md:max-w-4xl text-balance font-[family-name:var(--font-cormorant)] text-[clamp(1.75rem,7vw,4.5rem)] text-[color:var(--av-text)] font-light leading-[1.1] md:leading-[1.15] drop-shadow-[0_4px_24px_rgba(10,26,20,0.95)] mx-auto">
                                Explorá cada espacio y empezá<br className="hidden md:block"/> a imaginar tu vida en AguaVista
                            </h3>
                        </div>
                    </motion.div>

                    {/* ── IMÁGENES ── */}
                    {images.map(({ src, alt }, index) => {
                        return (
                            <motion.div
                                key={index}
                                style={getTransforms(index)}
                                className={`absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${getInitialClasses(index)}`}
                            >
                                <div className="relative">
                                    <motion.div
                                        className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl shadow-av-lg"
                                        initial={reduceMotion ? false : 'hidden'}
                                        animate={revealed || reduceMotion ? 'visible' : 'hidden'}
                                        variants={{
                                            hidden: { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 },
                                            visible: {
                                                clipPath: 'inset(0% 0% 0% 0%)',
                                                opacity: 1,
                                                transition: {
                                                    duration: 1.15,
                                                    ease: EASE_LUX,
                                                    delay: organicDelay(index, 0.09),
                                                },
                                            },
                                        }}
                                    >
                                        <Image
                                            src={src || '/placeholder.svg'}
                                            alt={alt || `Parallax image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 35vw"
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}