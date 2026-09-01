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

    // Como ahora arrancan más chicas, el efecto de zoom hacia el final va a ser mucho más notorio.
    const scale4 = useTransform(galleryScroll, [0, 1], [1, 4]);
    const scale5 = useTransform(galleryScroll, [0, 1], [1, 5]);
    const scale6 = useTransform(galleryScroll, [0, 1], [1, 6]);
    const scale8 = useTransform(galleryScroll, [0, 1], [1, 8]);

    const scales = [scale4, scale5, scale6, scale5, scale8];

    const revealed = useInView(galleryContainer, { once: true, amount: 0.2 });

    /* 
     * ── POSICIONES MILIMÉTRICAS ──
     * Achicamos el width (w-) y el height (h-) inicial de todas las fotos.
     * Las empujamos violentamente hacia los extremos (-top, -left) para crear
     * un "lienzo vacío" gigante en el centro para el texto.
     */
    const getPositionClass = (index: number) => {
        switch (index) {
            // 1. Golf (Arriba Izquierda) - Empujada bien a la esquina
            case 0: return '[&>div]:!-top-[35vh] [&>div]:!-left-[30vw] [&>div]:!h-[12vh] [&>div]:!w-[25vw] md:[&>div]:!-top-[32vh] md:[&>div]:!-left-[32vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[18vw]'; 
            // 2. Náutica (Arriba Derecha) - Más apaisada y arrinconada
            case 1: return '[&>div]:!-top-[38vh] [&>div]:!left-[30vw] [&>div]:!h-[10vh] [&>div]:!w-[25vw] md:[&>div]:!-top-[28vh] md:[&>div]:!left-[34vw] md:[&>div]:!h-[14vh] md:[&>div]:!w-[20vw]'; 
            // 3. Playa (Abajo Izquierda) - Retraída
            case 2: return '[&>div]:!top-[35vh] [&>div]:!-left-[30vw] [&>div]:!h-[12vh] [&>div]:!w-[25vw] md:[&>div]:!top-[34vh] md:[&>div]:!-left-[34vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[22vw]'; 
            // 4. Spa (Abajo Derecha)
            case 3: return '[&>div]:!top-[38vh] [&>div]:!left-[30vw] [&>div]:!h-[14vh] [&>div]:!w-[25vw] md:[&>div]:!top-[32vh] md:[&>div]:!left-[32vw] md:[&>div]:!h-[16vh] md:[&>div]:!w-[16vw]'; 
            // 5. Eventos (Extremo Centro-Izquierda en PC)
            case 4: return 'hidden md:flex md:[&>div]:!top-[4vh] md:[&>div]:!-left-[46vw] md:[&>div]:!h-[14vh] md:[&>div]:!w-[10vw]'; 
            default: return '';
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
                    className="relative font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto"
                />
            </div>

            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: revealed ? 1 : 0 }}
                        transition={{ duration: 1.2, delay: 0.1 }}
                        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center md:px-10"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_95%,transparent)_0%,transparent_60%)] md:bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_80%,transparent)_0%,transparent_50%)] opacity-100" />
                        
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <SlideUp
                                innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-4 md:mb-6"
                            >
                                Hay mucho más por descubrir
                            </SlideUp>

                            <SplitText
                                as="h3"
                                text="Explorá cada espacio y empezá a imaginar tu vida en AguaVista"
                                delay={0.2}
                                className="w-full max-w-[95%] md:max-w-4xl text-balance font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[color:var(--av-text)] font-light leading-tight drop-shadow-[0_4px_24px_rgba(10,26,20,0.95)] mx-auto"
                            />
                        </div>
                    </motion.div>

                    {images.map(({ src, alt }, index) => {
                        const scale = scales[index % scales.length];
                        return (
                            <motion.div
                                key={index}
                                style={{ scale }}
                                className={`absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${getPositionClass(index)}`}
                            >
                                <div className="relative">
                                    <motion.div
                                        className="absolute inset-0 overflow-hidden rounded-lg md:rounded-xl shadow-2xl shadow-black/80"
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
                                            sizes="(max-width: 768px) 40vw, 25vw"
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