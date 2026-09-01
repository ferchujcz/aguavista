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

    // Detectamos cuando la sección entra en pantalla para mostrar las fotos y el texto
    const revealed = useInView(galleryContainer, { once: true, amount: 0.2 });

    // Coordenadas calculadas: En celular están más separadas y son más chicas. En PC (md:) retoman su tamaño.
    const getPositionClass = (index: number) => {
        switch (index) {
            case 0: return '[&>div]:!-top-[25vh] [&>div]:!-left-[28vw] [&>div]:!h-[18vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[28vh] md:[&>div]:!-left-[22vw] md:[&>div]:!h-[35vh] md:[&>div]:!w-[25vw]'; // Arriba Izquierda
            case 1: return '[&>div]:!-top-[28vh] [&>div]:!left-[28vw] [&>div]:!h-[15vh] [&>div]:!w-[35vw] md:[&>div]:!-top-[22vh] md:[&>div]:!left-[26vw] md:[&>div]:!h-[25vh] md:[&>div]:!w-[30vw]'; // Arriba Derecha
            case 2: return '[&>div]:!top-[25vh] [&>div]:!-left-[28vw] [&>div]:!h-[18vh] [&>div]:!w-[35vw] md:[&>div]:!top-[28vh] md:[&>div]:!-left-[25vw] md:[&>div]:!h-[30vh] md:[&>div]:!w-[25vw]'; // Abajo Izquierda
            case 3: return '[&>div]:!top-[28vh] [&>div]:!left-[28vw] [&>div]:!h-[16vh] [&>div]:!w-[35vw] md:[&>div]:!top-[26vh] md:[&>div]:!left-[22vw] md:[&>div]:!h-[30vh] md:[&>div]:!w-[22vw]'; // Abajo Derecha
            // La 5ta foto la escondemos en el celular para no saturar la pantalla pequeña, pero en PC aparece por la izquierda.
            case 4: return 'hidden md:flex [&>div]:!-top-[2vh] [&>div]:!-left-[42vw] [&>div]:!h-[20vh] [&>div]:!w-[15vw]'; 
            default: return '';
        }
    };

    return (
        <section ref={mainContainer} className="relative w-full bg-[color:var(--av-base)]">

            {/* ── Fondo Parallax ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute -top-[10%] left-0 w-full h-[120%]"
                >
                    <Image src="/playa.webp" alt="Fondo textura" fill className="object-cover opacity-15" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--av-base)] via-transparent to-[color:var(--av-base)]" />
                </motion.div>
            </div>

            {/* ── Textos Principales Superiores ── */}
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

            {/* ── Galería Zoom Parallax ── */}
            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO CENTRAL (AHORA APARECE INMEDIATAMENTE) ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: revealed ? 1 : 0 }}
                        transition={{ duration: 1.2, delay: 0.1 }}
                        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center sm:px-10"
                    >
                        {/* Sombra de contraste para asegurar la legibilidad del texto en móviles */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--av-base)_25%,transparent_75%)] md:bg-[radial-gradient(42%_32%_at_50%_50%,color-mix(in_oklab,var(--av-base)_95%,transparent)_0%,transparent_100%)] opacity-95" />
                        
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            <SlideUp
                                innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs lg:text-sm tracking-[0.25em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-4"
                            >
                                Hay mucho más por descubrir
                            </SlideUp>

                            <SplitText
                                as="h3"
                                text="Explorá cada espacio y empezá a imaginar tu vida en AguaVista"
                                delay={0.3}
                                className="w-full max-w-[100%] md:max-w-3xl text-balance font-[family-name:var(--font-cormorant)] text-[clamp(1.85rem,6.5vw,3.5rem)] text-[color:var(--av-text)] font-light leading-[1.1] md:leading-[1.15] drop-shadow-[0_4px_24px_rgba(10,26,20,0.95)] mx-auto"
                            />
                        </div>
                    </motion.div>

                    {/* ── 5 IMÁGENES EN ÓRBITA ── */}
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
                                        // Bordes redondeados sutiles para darle el toque premium
                                        className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl shadow-2xl shadow-black/50"
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