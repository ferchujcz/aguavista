
}'use client';

import {
    useScroll,
    useTransform,
    motion,
    useInView,
    useReducedMotion,
} from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

import { SplitText } from '@/components/motion/SplitText';
import { SlideUp } from '@/components/motion/SlideUp';
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

    const sectionRef = useRef<HTMLElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: galleryRef,
        offset: ['start start', 'end end'],
    });

    const revealed = useInView(galleryRef, {
        once: true,
        amount: 0.15,
    });

    /*
    |--------------------------------------------------------------------------
    | FONDO
    |--------------------------------------------------------------------------
    */

    const backgroundY = useTransform(
        scrollYProgress,
        [0, 1],
        ['0%', '12%']
    );

    /*
    |--------------------------------------------------------------------------
    | IMAGEN CENTRAL
    |--------------------------------------------------------------------------
    |
    | NO hacemos scale x4/x5/x8.
    |
    | El collage central crece de forma moderada.
    | El propio viewport se encarga de darle protagonismo.
    |
    */

    const centerScale = useTransform(
        scrollYProgress,
        [0, 0.35, 0.65, 1],
        [1, 1.08, 1.16, 1.2]
    );

    const centerY = useTransform(
        scrollYProgress,
        [0, 1],
        ['0%', '-1%']
    );

    /*
    |--------------------------------------------------------------------------
    | OSCURECIMIENTO
    |--------------------------------------------------------------------------
    |
    | Máximo: 60%
    |
    */

    const centerDarkness = useTransform(
        scrollYProgress,
        [0.42, 0.7],
        [0, 0.6]
    );

    /*
    |--------------------------------------------------------------------------
    | TEXTO
    |--------------------------------------------------------------------------
    */

    const textOpacity = useTransform(
        scrollYProgress,
        [0.54, 0.72],
        [0, 1]
    );

    const textY = useTransform(
        scrollYProgress,
        [0.54, 0.72],
        [35, 0]
    );

    /*
    |--------------------------------------------------------------------------
    | CONFIGURACIÓN DEL COLLAGE
    |--------------------------------------------------------------------------
    |
    | Estas posiciones son deliberadamente limpias.
    | Las imágenes NO se escalan brutalmente.
    |
    */

    const peripheralConfig = [
        {
            // GOLF — arriba izquierda
            className:
                'left-[7%] top-[8%] w-[25vw] max-w-[360px] aspect-[16/10] md:left-[25%] md:top-[7%] md:w-[17vw]',
            exitX: '-48vw',
            exitY: '-38vh',
            exitRotate: -8,
        },
        {
            // NÁUTICA — arriba derecha
            className:
                'right-[7%] top-[11%] w-[28vw] max-w-[390px] aspect-[16/9] md:right-[22%] md:top-[13%] md:w-[19vw]',
            exitX: '48vw',
            exitY: '-38vh',
            exitRotate: 8,
        },
        {
            // PLAYA — abajo izquierda
            className:
                'left-[7%] bottom-[10%] w-[29vw] max-w-[400px] aspect-[16/10] md:left-[24%] md:bottom-[8%] md:w-[18vw]',
            exitX: '-48vw',
            exitY: '40vh',
            exitRotate: -7,
        },
        {
            // SPA — abajo derecha
            className:
                'right-[7%] bottom-[12%] w-[28vw] max-w-[390px] aspect-[16/10] md:right-[22%] md:bottom-[10%] md:w-[18vw]',
            exitX: '48vw',
            exitY: '40vh',
            exitRotate: 7,
        },
        {
            // EVENTOS — lateral izquierdo
            className:
                'hidden md:block left-[5%] top-1/2 -translate-y-1/2 w-[14vw] max-w-[260px] aspect-[4/3]',
            exitX: '-55vw',
            exitY: '0vh',
            exitRotate: -10,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | PROGRESIÓN DE SALIDA
    |--------------------------------------------------------------------------
    |
    | Las imágenes exteriores empiezan a salir gradualmente.
    | No desaparecen de golpe.
    |
    */

    const getPeripheralMotion = (config: (typeof peripheralConfig)[number]) => {
        const x = useTransform(
            scrollYProgress,
            [0, 0.3, 0.72],
            ['0vw', '0vw', config.exitX]
        );

        const y = useTransform(
            scrollYProgress,
            [0, 0.3, 0.72],
            ['0vh', '0vh', config.exitY]
        );

        const opacity = useTransform(
            scrollYProgress,
            [0, 0.38, 0.72],
            [1, 1, 0]
        );

        const rotate = useTransform(
            scrollYProgress,
            [0, 0.72],
            [0, config.exitRotate]
        );

        const scale = useTransform(
            scrollYProgress,
            [0, 0.72],
            [1, 0.92]
        );

        return {
            x,
            y,
            opacity,
            rotate,
            scale,
        };
    };

    /*
    |--------------------------------------------------------------------------
    | SECCIÓN
    |--------------------------------------------------------------------------
    */

    return (
        <section
            ref={sectionRef}
            className="relative w-full bg-[color:var(--av-base)]"
        >
            {/* Fondo */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    style={{ y: reduceMotion ? 0 : backgroundY }}
                    className="absolute -top-[8%] left-0 h-[116%] w-full"
                >
                    <Image
                        src="/playa.webp"
                        alt=""
                        fill
                        priority={false}
                        className="object-cover opacity-[0.12]"
                        sizes="100vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--av-base)] via-transparent to-[color:var(--av-base)]" />
                </motion.div>
            </div>

            {/* Intro */}
            <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center md:px-10">
                <SlideUp
                    className="relative"
                    innerClassName="mb-8 font-[family-name:var(--font-josefin)] text-[10px] font-light uppercase tracking-[0.3em] text-[color:var(--av-lux)] md:text-xs"
                >
                    Una categoría propia
                </SlideUp>

                <div className="relative mx-auto flex max-w-[95%] flex-col items-center md:max-w-4xl">
                    <SplitText
                        as="h2"
                        text="No se trata de tenerlo todo."
                        delay={0.15}
                        className="relative text-balance font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,6vw,4.5rem)] font-light leading-tight text-[color:var(--av-text)]"
                    />

                    <p className="mt-4 font-[family-name:var(--font-josefin)] text-[0.7rem] font-light uppercase tracking-[0.2em] text-[color:var(--av-text)]/80 md:text-xs">
                        Se trata de vivir donde todo es posible.
                    </p>
                </div>
            </div>

            {/* 
            |--------------------------------------------------------------------------
            | GALERÍA
            |--------------------------------------------------------------------------
            */}

            <div
                ref={galleryRef}
                className="relative z-10 h-[230vh] md:h-[250vh]"
            >
                <div className="sticky top-0 h-screen w-full overflow-hidden">

                    {/* 
                    |--------------------------------------------------------------------------
                    | TEXTO FINAL
                    |--------------------------------------------------------------------------
                    */}

                    <motion.div
                        style={{
                            opacity: reduceMotion ? 1 : textOpacity,
                            y: reduceMotion ? 0 : textY,
                        }}
                        className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-6 text-center md:px-10"
                    >
                        <div className="flex w-full max-w-5xl flex-col items-center">

                            <span className="mb-5 font-[family-name:var(--font-josefin)] text-[9px] font-light uppercase tracking-[0.28em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] md:mb-7 md:text-sm md:tracking-[0.42em]">
                                Una experiencia integral
                            </span>

                            <h3 className="max-w-[900px] text-balance font-[family-name:var(--font-cormorant)] text-[clamp(2rem,6.5vw,4.8rem)] font-light leading-[1.05] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                                Todo lo que buscabas por separado,
                                <br className="hidden md:block" />
                                {' '}acá sucede en un mismo lugar.
                            </h3>

                        </div>
                    </motion.div>

                    {/* 
                    |--------------------------------------------------------------------------
                    | IMAGEN CENTRAL
                    |--------------------------------------------------------------------------
                    |
                    | IMPORTANTE:
                    | El collage ya contiene varias imágenes.
                    | No lo hacemos x4.
                    |
                    */}

                    {images
                        .filter((img) => img.isCenter)
                        .map((img, index) => (
                            <motion.div
                                key={`center-${index}`}
                                style={
                                    reduceMotion
                                        ? {}
                                        : {
                                              scale: centerScale,
                                              y: centerY,
                                          }
                                }
                                className="absolute inset-0 z-20 flex items-center justify-center"
                            >
                                <div className="relative h-[31vh] w-[88vw] overflow-hidden rounded-2xl shadow-av-lg sm:h-[34vh] sm:w-[82vw] md:h-[42vh] md:w-[68vw] md:max-w-[1100px]">
                                    <Image
                                        src={img.src}
                                        alt={img.alt || 'Experiencia AguaVista'}
                                        fill
                                        priority
                                        quality={90}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 88vw, 68vw"
                                    />

                                    {/* Oscurecimiento máximo 60% */}
                                    <motion.div
                                        style={{
                                            opacity: reduceMotion
                                                ? 0.6
                                                : centerDarkness,
                                        }}
                                        className="absolute inset-0 z-10 bg-black"
                                    />
                                </div>
                            </motion.div>
                        ))}

                    {/* 
                    |--------------------------------------------------------------------------
                    | IMÁGENES PERIFÉRICAS
                    |--------------------------------------------------------------------------
                    */}

                    {images
                        .filter((img) => !img.isCenter)
                        .slice(0, peripheralConfig.length)
                        .map((img, index) => {
                            const config = peripheralConfig[index];
                            const motionValues =
                                getPeripheralMotion(config);

                            return (
                                <motion.div
                                    key={`peripheral-${index}`}
                                    style={
                                        reduceMotion
                                            ? {}
                                            : {
                                                  x: motionValues.x,
                                                  y: motionValues.y,
                                                  opacity:
                                                      motionValues.opacity,
                                                  rotate:
                                                      motionValues.rotate,
                                                  scale:
                                                      motionValues.scale,
                                              }
                                    }
                                    initial={
                                        reduceMotion
                                            ? false
                                            : {
                                                  opacity: 0,
                                                  scale: 0.94,
                                              }
                                    }
                                    animate={
                                        revealed || reduceMotion
                                            ? {
                                                  opacity: 1,
                                                  scale: 1,
                                              }
                                            : {
                                                  opacity: 0,
                                                  scale: 0.94,
                                              }
                                    }
                                    transition={{
                                        duration: 1,
                                        ease: EASE_LUX,
                                        delay: index * 0.08,
                                    }}
                                    className={`absolute z-30 overflow-hidden rounded-xl shadow-av-lg md:rounded-2xl ${config.className}`}
                                >
                                    <Image
                                        src={img.src}
                                        alt={
                                            img.alt ||
                                            `Amenity ${index + 1}`
                                        }
                                        fill
                                        quality={88}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 32vw, 20vw"
                                    />
                                </motion.div>
                            );
                        })}
                </div>
            </div>
        </section>
    );
}