'use client';

import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

import { SplitText } from '@/components/motion/SplitText';
import { SlideUp, organicDelay } from '@/components/motion/SlideUp';
import { EASE_LUX } from '@/components/motion/Reveal';

interface ImgData {
    src: string;
    alt?: string;
    isText?: boolean;
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
    const scale9 = useTransform(galleryScroll, [0, 1], [1, 9]);

    const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

    /**
     * El texto central se desvanece en el primer tercio del zoom.
     *
     * Antes vivia en `z-0`, debajo de las fotos, asi que en cuanto estas
     * empezaban a crecer le pasaban por encima y lo dejaban cortado a la
     * mitad. Ahora va arriba de todo (`z-20`) y en vez de competir con las
     * imagenes se retira: se lee limpio mientras la galeria esta en reposo
     * y libera la pantalla justo cuando el zoom se vuelve protagonista.
     */
    const centerTextOpacity = useTransform(galleryScroll, [0.04, 0.3], [1, 0]);

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
                {/* Luz radial detras del texto: el fondo de esta seccion es
                    una foto, asi que sin este colchon la tipografia clara
                    pierde contraste sobre las zonas mas iluminadas. */}
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
                    text="Cada instalación fue diseñada para que tu experiencia de vida sea única."
                    delay={0.15}
                    className="relative font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl lg:text-7xl text-[color:var(--av-text)] font-light max-w-4xl text-balance leading-tight"
                />
            </div>

            {/* ── Galería Zoom Parallax ── */}
            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO CENTRAL ──
                        `z-20` lo pone por encima de las fotos y `max-w-2xl`
                        + padding lateral le dan un ancho de medida propio,
                        para que la frase quiebre donde tiene sentido y no
                        contra el borde de la imagen de al lado. */}
                    <motion.div
                        style={reduceMotion ? undefined : { opacity: centerTextOpacity }}
                        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center sm:px-10"
                    >
                        {/* Colchon de luz: aunque el texto ya no queda tapado,
                            sigue habiendo foto detras en todo momento. */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    'radial-gradient(42% 32% at 50% 50%, color-mix(in oklab, var(--av-base) 88%, transparent) 0%, color-mix(in oklab, var(--av-base) 45%, transparent) 55%, transparent 100%)',
                            }}
                        />

                        <SlideUp
                            className="relative"
                            innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs lg:text-sm tracking-[0.3em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-3"
                        >
                            Hay mucho más por descubrir
                        </SlideUp>

                        <SplitText
                            as="h3"
                            text="Explorá cada espacio y empezá a imaginar tu vida en AguaVista"
                            delay={0.12}
                            className="relative mt-1 max-w-2xl text-balance font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[color:var(--av-text)] font-light leading-snug drop-shadow-[0_2px_16px_rgba(10,26,20,0.9)]"
                        />
                    </motion.div>

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
                                {/* ── Reveal de entrada ──
                                    Disparado por viewport, no por progreso de
                                    scroll: al llegar la seccion cada foto se
                                    abre desde su centro hacia los costados
                                    (clip-path de 50/50 a 0/0) con un
                                    escalonado organico. El zoom continuo vive
                                    en el `scale` del padre, asi que los dos
                                    efectos no se pisan: uno anima clip-path,
                                    el otro transform. */}
                                <motion.div
                                    className="relative h-[25vh] w-[25vw]"
                                    initial={
                                        reduceMotion
                                            ? undefined
                                            : { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 }
                                    }
                                    whileInView={
                                        reduceMotion
                                            ? undefined
                                            : { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }
                                    }
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{
                                        duration: 1.15,
                                        ease: EASE_LUX,
                                        delay: organicDelay(index, 0.09),
                                    }}
                                >
                                    <Image
                                        src={src || '/placeholder.svg'}
                                        alt={alt || `Parallax image ${index + 1}`}
                                        fill
                                        className="object-cover shadow-2xl"
                                        loading="lazy"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
