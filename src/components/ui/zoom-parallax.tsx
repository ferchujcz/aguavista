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

    /* ── LA MAGIA ORIGINAL RESTAURADA ── */
    // Al aplicar scale al contenedor padre, las imágenes se separan 
    // solas hacia los bordes. El centro escala a x4 (llena la pantalla perfecto).
    const scale4 = useTransform(galleryScroll, [0, 1], [1, 4]);
    const scale5 = useTransform(galleryScroll, [0, 1], [1, 5]);
    const scale6 = useTransform(galleryScroll, [0, 1], [1, 6]);
    const scale8 = useTransform(galleryScroll, [0, 1], [1, 8]);
    const scales = [scale4, scale5, scale6, scale5, scale8];

    /* ── ANIMACIÓN CENTRAL (OSCURECE AL 60%) ── */
    const centerDarkness = useTransform(galleryScroll, [0.3, 0.65], [0, 0.6]);
    const textOpacity = useTransform(galleryScroll, [0.4, 0.65], [0, 1]);
    const textY = useTransform(galleryScroll, [0.4, 0.65], [40, 0]);

    /* 
     * ── DIMENSIONES INICIALES COMPACTAS (EL PUZZLE) ──
     * Arrancan chicas para que al multiplicarse x4 llenen la pantalla 
     * sin verse pixeladas ni extremadamente zomeadas.
     */
    const getInitialClasses = (isCenter?: boolean, orbitIndex: number = 0) => {
        if (isCenter) {
            // El collage central (es horizontal, lo hacemos apaisado)
            return '[&>div]:!top-0 [&>div]:!left-0 [&>div]:!w-[55vw] [&>div]:!h-[25vh] md:[&>div]:!w-[32vw] md:[&>div]:!h-[28vh]';
        }
        switch (orbitIndex) {
            case 0: return '[&>div]:!-top-[26vh] [&>div]:!-left-[16vw] [&>div]:!w-[24vw] [&>div]:!h-[16vh] md:[&>div]:!-top-[28vh] md:[&>div]:!-left-[14vw] md:[&>div]:!w-[16vw] md:[&>div]:!h-[20vh]'; 
            case 1: return '[&>div]:!-top-[22vh] [&>div]:!left-[22vw] [&>div]:!w-[28vw] [&>div]:!h-[12vh] md:[&>div]:!-top-[20vh] md:[&>div]:!left-[18vw] md:[&>div]:!w-[18vw] md:[&>div]:!h-[16vh]'; 
            case 2: return '[&>div]:!top-[26vh] [&>div]:!-left-[16vw] [&>div]:!w-[24vw] [&>div]:!h-[16vh] md:[&>div]:!top-[28vh] md:[&>div]:!-left-[14vw] md:[&>div]:!w-[16vw] md:[&>div]:!h-[20vh]'; 
            case 3: return '[&>div]:!top-[22vh] [&>div]:!left-[22vw] [&>div]:!w-[28vw] [&>div]:!h-[12vh] md:[&>div]:!top-[20vh] md:[&>div]:!left-[18vw] md:[&>div]:!w-[18vw] md:[&>div]:!h-[16vh]'; 
            case 4: return 'hidden md:flex md:[&>div]:!top-0 md:[&>div]:!-left-[32vw] md:[&>div]:!w-[12vw] md:[&>div]:!h-[22vh]'; 
            default: return '';
        }
    };

    let orbitCounter = 0;

    return (
        <section ref={mainContainer} className="relative w-full bg-[color:var(--av-base)]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div style={{ y: backgroundY }} className="absolute -top-[10%] left-0 w-full h-[120%]">
                    <Image src="/playa.webp" alt="Fondo textura" fill className="object-cover opacity-15" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--av-base)] via-transparent to-[color:var(--av-base)]" />
                </motion.div>
            </div>

            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-6 text-center md:px-10">
                <SlideUp className="relative" innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs font-light tracking-[0.3em] text-[color:var(--av-lux)] uppercase mb-8">
                    Una categoría propia
                </SlideUp>

                <SplitText as="h2" text="Hay lugares para vivir. Y lugares que definen cómo querés vivir." delay={0.15} className="relative font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto" />
            </div>

            <div ref={galleryContainer} className="relative h-[250vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    <motion.div
                        style={{ opacity: reduceMotion ? 1 : textOpacity, y: reduceMotion ? 0 : textY }}
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

                    {images.map((img, index) => {
                        const isCenter = !!img.isCenter;
                        const currentOrbit = isCenter ? -1 : orbitCounter++;
                        const scale = isCenter ? scale4 : scales[currentOrbit % scales.length];

                        return (
                            <motion.div
                                key={index}
                                style={reduceMotion ? {} : { scale }}
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
                                        {isCenter && (
                                            <motion.div style={{ opacity: centerDarkness }} className="absolute inset-0 bg-black z-10" />
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