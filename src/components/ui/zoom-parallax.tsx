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
    isCenter?: boolean;
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
     * ── ANIMACIONES GENERALES ──
     * Todas escalan juntas. Las periféricas vuelan hacia afuera.
     */
    const globalScale = useTransform(galleryScroll, [0, 0.75], [1, 4]);
    
    const spreadX_Left = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '-45vw']);
    const spreadX_Right = useTransform(galleryScroll, [0.15, 0.65], ['0vw', '45vw']);
    const spreadY_Top = useTransform(galleryScroll, [0.15, 0.65], ['0vh', '-45vh']);
    const spreadY_Bottom = useTransform(galleryScroll, [0.15, 0.65], ['0vh', '45vh']);

    /* 
     * ── ANIMACIONES DE LA IMAGEN CENTRAL ──
     * La capa negra arranca en 0 y sube hasta 60% (0.6) de opacidad.
     * El texto arranca invisible y aparece a medida que se oscurece el fondo.
     */
    const centerDarkness = useTransform(galleryScroll, [0.25, 0.65], [0, 0.6]);
    const textOpacity = useTransform(galleryScroll, [0.4, 0.65], [0, 1]);
    const textScale = useTransform(galleryScroll, [0.4, 0.65], [0.95, 1]);

    /* 
     * ── LÓGICA DE POSICIONAMIENTO ──
     * El centro queda en 0,0. Las demás orbitan en un marco perfecto.
     */
    const getInitialClasses = (isCenter?: boolean, orbitIndex: number = 0) => {
        if (isCenter) {
            // El collage horizontal en el centro exacto
            return 'z-20 [&>div]:!top-0 [&>div]:!left-0 [&>div]:!h-[22vh] [&>div]:!w-[80vw] md:[&>div]:!h-[32vh] md:[&>div]:!w-[42vw]';
        }
        switch (orbitIndex) {
            // Arriba Izquierda
            case 0: return '[&>div]:!-top-[18vh] [&>div]:!-left-[20vw] [&>div]:!h-[12vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[24vh] md:[&>div]:!-left-[26vw] md:[&>div]:!h-[20vh] md:[&>div]:!w-[20vw]'; 
            // Arriba Derecha
            case 1: return '[&>div]:!-top-[20vh] [&>div]:!left-[22vw] [&>div]:!h-[14vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[22vh] md:[&>div]:!left-[26vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[22vw]'; 
            // Abajo Izquierda
            case 2: return '[&>div]:!top-[18vh] [&>div]:!-left-[20vw] [&>div]:!h-[12vh] [&>div]:!w-[35vw] md:[&>div]:!top-[24vh] md:[&>div]:!-left-[24vw] md:[&>div]:!h-[22vh] md:[&>div]:!w-[18vw]'; 
            // Abajo Derecha
            case 3: return '[&>div]:!top-[20vh] [&>div]:!left-[22vw] [&>div]:!h-[14vh] [&>div]:!w-[35vw] md:[&>div]:!top-[22vh] md:[&>div]:!left-[26vw] md:[&>div]:!h-[18vh] md:[&>div]:!w-[22vw]'; 
            // Extremo Izquierdo (Cierra el marco en PC)
            case 4: return 'hidden md:flex md:[&>div]:!top-[0vh] md:[&>div]:!-left-[42vw] md:[&>div]:!h-[26vh] md:[&>div]:!w-[12vw]'; 
            default: return '';
        }
    };

    const getTransforms = (orbitIndex: number) => {
        if (reduceMotion) return { scale: 1, x: '0vw', y: '0vh' };
        switch (orbitIndex) {
            case 0: return { scale: globalScale, x: spreadX_Left, y: spreadY_Top };
            case 1: return { scale: globalScale, x: spreadX_Right, y: spreadY_Top };
            case 2: return { scale: globalScale, x: spreadX_Left, y: spreadY_Bottom };
            case 3: return { scale: globalScale, x: spreadX_Right, y: spreadY_Bottom };
            case 4: return { scale: globalScale, x: spreadX_Left, y: '0vh' }; // Vuela a la izquierda
            default: return { scale: 1, x: '0vw', y: '0vh' };
        }
    };

    let orbitCounter = 0; // Para iterar las periféricas independientemente de la posición del centro

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
                <SlideUp
                    className="relative"
                    innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs font-light tracking-[0.3em] text-[color:var(--av-lux)] uppercase mb-8"
                >
                    Un refugio sin precedentes
                </SlideUp>

                <SplitText
                    as="h2"
                    text="No se trata de tenerlo todo. Se trata de vivir donde todo es posible."
                    delay={0.15}
                    className="relative font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto"
                />
            </div>

            <div ref={galleryContainer} className="relative h-[250vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO CENTRAL SOBRE EL COLLAGE ── */}
                    <motion.div
                        style={{ opacity: reduceMotion ? 1 : textOpacity, scale: reduceMotion ? 1 : textScale }}
                        className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center md:px-10"
                    >
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <span className="font-[family-name:var(--font-josefin)] text-[10px] md:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-4 md:mb-6 drop-shadow-lg">
                                Una experiencia integral
                            </span>

                            <h3 className="w-full max-w-[95%] md:max-w-4xl text-balance font-[family-name:var(--font-cormorant)] text-[clamp(1.75rem,6.5vw,4rem)] text-white font-light leading-[1.1] md:leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mx-auto">
                                Todo lo que buscabas por separado,<br className="hidden md:block"/> acá sucede en un mismo lugar.
                            </h3>
                        </div>
                    </motion.div>

                    {/* ── IMÁGENES ── */}
                    {images.map(({ src, alt, isCenter }, index) => {
                        const currentOrbit = isCenter ? -1 : orbitCounter++;

                        return (
                            <motion.div
                                key={index}
                                style={isCenter ? { scale: globalScale } : getTransforms(currentOrbit)}
                                className={`absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${getInitialClasses(isCenter, currentOrbit)}`}
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
                                            sizes={isCenter ? "100vw" : "(max-width: 768px) 50vw, 35vw"}
                                        />
                                        
                                        {/* ── CAPA DE OSCURECIMIENTO (SOLO CENTRO) ── */}
                                        {isCenter && (
                                            <motion.div 
                                                style={{ opacity: centerDarkness }}
                                                className="absolute inset-0 bg-black z-10"
                                            />
                                        )}
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