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

    /* ── TRAYECTORIAS EXACTAS (NO SE PISAN JAMÁS) ── */
    const scaleCenter = useTransform(galleryScroll, [0, 1], [1, 4.5]);
    const scalePeripherals = useTransform(galleryScroll, [0, 1], [1, 3]);
    
    // Diagonales para que huyan hacia las esquinas
    const flyTopLeftX = useTransform(galleryScroll, [0, 1], ['0vw', '-40vw']);
    const flyTopLeftY = useTransform(galleryScroll, [0, 1], ['0vh', '-40vh']);
    
    const flyTopRightX = useTransform(galleryScroll, [0, 1], ['0vw', '40vw']);
    const flyTopRightY = useTransform(galleryScroll, [0, 1], ['0vh', '-40vh']);
    
    const flyBottomLeftX = useTransform(galleryScroll, [0, 1], ['0vw', '-40vw']);
    const flyBottomLeftY = useTransform(galleryScroll, [0, 1], ['0vh', '40vh']);
    
    const flyBottomRightX = useTransform(galleryScroll, [0, 1], ['0vw', '40vw']);
    const flyBottomRightY = useTransform(galleryScroll, [0, 1], ['0vh', '40vh']);
    
    const flyLeft = useTransform(galleryScroll, [0, 1], ['0vw', '-60vw']);

    /* ── ANIMACIÓN CENTRAL (OSCURECE AL 60%) ── */
    const centerDarkness = useTransform(galleryScroll, [0.3, 0.7], [0, 0.6]);
    const textOpacity = useTransform(galleryScroll, [0.4, 0.7], [0, 1]);
    const textScale = useTransform(galleryScroll, [0.4, 0.7], [0.95, 1]);

    const getLayout = (isCenter?: boolean, index?: number) => {
        // El collage central clavado exactamente en el medio:
        if (isCenter) return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[25vh] md:w-[45vw] md:h-[35vh] z-20';
        
        // Las demás ancladas a las esquinas absolutas de la pantalla:
        switch (index) {
            case 0: return 'top-[8vh] left-[5vw] w-[35vw] h-[15vh] md:top-[12vh] md:left-[10vw] md:w-[20vw] md:h-[22vh] z-10';
            case 1: return 'top-[8vh] right-[5vw] w-[35vw] h-[15vh] md:top-[12vh] md:right-[10vw] md:w-[20vw] md:h-[22vh] z-10';
            case 2: return 'bottom-[8vh] left-[5vw] w-[35vw] h-[15vh] md:bottom-[12vh] md:left-[10vw] md:w-[20vw] md:h-[22vh] z-10';
            case 3: return 'bottom-[8vh] right-[5vw] w-[35vw] h-[15vh] md:bottom-[12vh] md:right-[10vw] md:w-[20vw] md:h-[22vh] z-10';
            case 4: return 'hidden md:flex top-1/2 -translate-y-1/2 left-[2vw] w-[12vw] h-[18vh] z-10';
            default: return 'hidden';
        }
    };

    const getTransform = (isCenter?: boolean, index?: number) => {
        if (reduceMotion) return { scale: 1, x: 0, y: 0 };
        if (isCenter) return { scale: scaleCenter };
        
        switch (index) {
            case 0: return { scale: scalePeripherals, x: flyTopLeftX, y: flyTopLeftY };
            case 1: return { scale: scalePeripherals, x: flyTopRightX, y: flyTopRightY };
            case 2: return { scale: scalePeripherals, x: flyBottomLeftX, y: flyBottomLeftY };
            case 3: return { scale: scalePeripherals, x: flyBottomRightX, y: flyBottomRightY };
            case 4: return { scale: scalePeripherals, x: flyLeft, y: 0 };
            default: return { scale: 1 };
        }
    };

    let peripheralIndex = 0;

    return (
        <section ref={mainContainer} className="relative w-full bg-[color:var(--av-base)]">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div style={{ y: backgroundY }} className="absolute -top-[10%] left-0 w-full h-[120%]">
                    <Image src="/playa.webp" alt="Fondo textura" fill className="object-cover opacity-15" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--av-base)] via-transparent to-[color:var(--av-base)]" />
                </motion.div>
            </div>

            {/* ── KICKER ANTES DEL ZOOM ── */}
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-6 text-center md:px-10">
                <SlideUp
                    className="relative"
                    innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs font-light tracking-[0.3em] text-[color:var(--av-lux)] uppercase mb-8"
                >
                    Una categoría propia
                </SlideUp>

                <SplitText
                    as="h2"
                    text="Hay lugares para vivir. Y lugares que definen cómo querés vivir."
                    delay={0.15}
                    className="relative font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto"
                />
            </div>

            <div ref={galleryContainer} className="relative h-[250vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO FINAL QUE APARECE EN EL MEDIO ── */}
                    <motion.div
                        style={{ opacity: reduceMotion ? 1 : textOpacity, scale: reduceMotion ? 1 : textScale }}
                        className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center md:px-10"
                    >
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <span className="font-[family-name:var(--font-josefin)] text-[10px] md:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-4 md:mb-6 drop-shadow-lg">
                                Una experiencia integral
                            </span>

                            <h3 className="w-full max-w-[95%] md:max-w-4xl text-balance font-[family-name:var(--font-cormorant)] text-[clamp(1.75rem,6.5vw,4.5rem)] text-white font-light leading-[1.1] md:leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mx-auto">
                                Todo lo que buscabas por separado,<br className="hidden md:block"/> acá sucede en un mismo lugar.
                            </h3>
                        </div>
                    </motion.div>

                    {/* ── RENDERIZADO DE LAS IMÁGENES ── */}
                    {images.map((img, index) => {
                        const isCenter = !!img.isCenter;
                        const currentOrbit = isCenter ? -1 : peripheralIndex++;

                        return (
                            <motion.div
                                key={index}
                                style={getTransform(isCenter, currentOrbit)}
                                className={`absolute flex items-center justify-center will-change-transform ${getLayout(isCenter, currentOrbit)}`}
                            >
                                <div className="relative w-full h-full">
                                    <motion.div
                                        className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl shadow-av-lg"
                                        initial={reduceMotion ? false : 'hidden'}
                                        animate={revealed || reduceMotion ? 'visible' : 'hidden'}
                                        variants={{
                                            hidden: { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 },
                                            visible: {
                                                clipPath: 'inset(0% 0% 0% 0%)',
                                                opacity: 1,
                                                transition: { duration: 1.15, ease: EASE_LUX, delay: organicDelay(index, 0.09) },
                                            },
                                        }}
                                    >
                                        <Image
                                            src={img.src || '/placeholder.svg'}
                                            alt={img.alt || `Parallax image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes={isCenter ? "100vw" : "(max-width: 768px) 50vw, 35vw"}
                                        />
                                        
                                        {/* OSCURECIMIENTO SOLO EN LA IMAGEN CENTRAL */}
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