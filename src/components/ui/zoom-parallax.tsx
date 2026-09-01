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

    const scale4 = useTransform(galleryScroll, [0, 1], [1, 4]);
    const scale5 = useTransform(galleryScroll, [0, 1], [1, 5]);
    const scale6 = useTransform(galleryScroll, [0, 1], [1, 6]);
    const scale8 = useTransform(galleryScroll, [0, 1], [1, 8]);

    const scales = [scale4, scale5, scale6, scale5, scale8];

    const revealed = useInView(galleryContainer, { once: true, amount: 0.2 });

    const textOpacity = useTransform(galleryScroll, [0.35, 0.6], [0, 1]);
    const textY = useTransform(galleryScroll, [0.35, 0.6], [30, 0]);

    /* 
     * ── GRILLA MATEMÁTICA PERFECTA (CERO SUPERPOSICIÓN) ──
     * Calculado para que los bordes de cada imagen mantengan 
     * una distancia exacta y simétrica de las demás.
     */
    const getPositionClass = (index: number) => {
        switch (index) {
            // 1. Arriba Izquierda
            case 0: return '[&>div]:!-top-[20vh] [&>div]:!-left-[18vw] [&>div]:!h-[18vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[18vh] md:[&>div]:!-left-[18vw] md:[&>div]:!h-[26vh] md:[&>div]:!w-[24vw]'; 
            // 2. Arriba Derecha (alineada a la derecha de la 1)
            case 1: return '[&>div]:!-top-[24vh] [&>div]:!left-[20vw] [&>div]:!h-[15vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[20vh] md:[&>div]:!left-[8vw] md:[&>div]:!h-[22vh] md:[&>div]:!w-[24vw]'; 
            // 3. Abajo Izquierda (exactamente debajo de la 1)
            case 2: return '[&>div]:!top-[16vh] [&>div]:!-left-[20vw] [&>div]:!h-[16vh] [&>div]:!w-[38vw] md:[&>div]:!top-[14vh] md:[&>div]:!-left-[16vw] md:[&>div]:!h-[24vh] md:[&>div]:!w-[28vw]'; 
            // 4. Abajo Derecha (exactamente debajo de la 2)
            case 3: return '[&>div]:!top-[18vh] [&>div]:!left-[18vw] [&>div]:!h-[18vh] [&>div]:!w-[32vw] md:[&>div]:!top-[12vh] md:[&>div]:!left-[10vw] md:[&>div]:!h-[20vh] md:[&>div]:!w-[20vw]'; 
            // 5. Centro Extremo Derecho (cierra el bloque a la derecha)
            case 4: return 'hidden md:flex md:[&>div]:!top-[4vh] md:[&>div]:!left-[32vw] md:[&>div]:!h-[28vh] md:[&>div]:!w-[16vw]'; 
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
                    className="relative font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] text-[color:var(--av-text)] font-light max-w-[95%] md:max-w-4xl text-balance leading-tight mx-auto"
                />
            </div>

            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    <motion.div
                        style={{ opacity: reduceMotion ? 1 : textOpacity, y: reduceMotion ? 0 : textY }}
                        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center md:px-10"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_95%,transparent)_0%,transparent_60%)] md:bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--av-base)_90%,transparent)_0%,transparent_45%)] opacity-100" />
                        
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <span className="font-[family-name:var(--font-josefin)] text-[10px] md:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-3 md:mb-5 drop-shadow-md">
                                Hay mucho más por descubrir
                            </span>

                            <h3 className="w-full max-w-[95%] md:max-w-4xl text-balance font-[family-name:var(--font-cormorant)] text-[clamp(1.75rem,7vw,4.5rem)] text-[color:var(--av-text)] font-light leading-[1.1] md:leading-[1.15] drop-shadow-[0_4px_24px_rgba(10,26,20,0.95)] mx-auto">
                                Explorá cada espacio y empezá<br className="hidden md:block"/> a imaginar tu vida en AguaVista
                            </h3>
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
                                        className="absolute inset-0 overflow-hidden rounded-lg shadow-2xl shadow-black/80"
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