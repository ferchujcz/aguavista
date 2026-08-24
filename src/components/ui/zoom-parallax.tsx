'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

import { SplitText } from '@/components/motion/SplitText';
import { SlideUp } from '@/components/motion/SlideUp';

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
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 text-center">
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
                    className="relative font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl lg:text-7xl text-[color:var(--av-text)] font-light max-w-5xl leading-tight"
                />
            </div>

            {/* ── Galería Zoom Parallax ── */}
            <div ref={galleryContainer} className="relative h-[150vh] z-10">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* ── TEXTO CENTRAL FIJO (Sin animaciones raras, adaptado a celular) ── */}
<div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none z-0">
    {/* Colchon de luz. Este texto queda DEBAJO de las imagenes que hacen
        zoom, asi que en cada frame le pasa por encima una foto distinta:
        sin el degradado la tipografia se vuelve ilegible en las claras. */}
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
        innerClassName="font-[family-name:var(--font-josefin)] text-[10px] md:text-xs lg:text-sm tracking-[0.3em] md:tracking-[0.4em] text-[color:var(--av-lux)] uppercase mb-2"
    >
        Hay mucho más por descubrir
    </SlideUp>

    {/* Tamaños ajustados para que la frase larga entre perfecta en móvil */}
    <SplitText
        as="h3"
        text="Explorá cada espacio y empezá a imaginar tu vida en AguaVista"
        delay={0.12}
        className="relative font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl md:text-4xl lg:text-5xl text-[color:var(--av-text)] font-light leading-snug drop-shadow-[0_2px_16px_rgba(10,26,20,0.9)] max-w-3xl mt-1"
    />
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
                                        loading="lazy"
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