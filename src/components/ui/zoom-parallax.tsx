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
    /**
     * Marca el slot del centro. Antes significaba "no dibujar nada aca, el
     * texto ocupa este lugar" y la imagen se descartaba. Ahora la imagen SI
     * se dibuja, participa del zoom como cualquier otra, y se cruza con el
     * texto a mitad del recorrido.
     */
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

    const scale4 = useTransform(galleryScroll, [0, 1], [1, 4]);
    const scale5 = useTransform(galleryScroll, [0, 1], [1, 5]);
    const scale6 = useTransform(galleryScroll, [0, 1], [1, 6]);
    const scale8 = useTransform(galleryScroll, [0, 1], [1, 8]);
    const scale9 = useTransform(galleryScroll, [0, 1], [1, 9]);

    const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

    /**
     * Disparador unico del barrido de entrada.
     *
     * Se observa el CONTENEDOR de la galeria, no cada foto. Dos razones:
     *
     * 1. Un observador por foto no es fiable aca. Las tres ultimas recien
     *    superan el 15% de visibilidad muy cerca del punto en que la
     *    seccion se fija arriba; pasado ese punto el `scale` empieza a
     *    agrandarlas y se van de pantalla, asi que pueden no llegar nunca
     *    a cruzar el umbral. Medido: a scrollY 1500 estaban en 0.07.
     *
     * 2. Es lo que se pidio: el barrido ocurre "al llegar a la seccion",
     *    de una, y no foto por foto segun donde quede cada una.
     *
     * El contenedor mide 150vh, asi que entra en viewport bastante antes
     * de fijarse: el barrido termina antes de que arranque el zoom.
     */
    const revealed = useInView(galleryContainer, { once: true, amount: 0.2 });

    /**
     * ── CROSSFADE CENTRAL ──
     *
     * Al llegar a la seccion, el centro es una FOTO que hace zoom con el
     * resto. A mitad del recorrido esa foto se apaga y el texto se
     * enciende ocupando el mismo lugar.
     *
     * La franja es simetrica alrededor de 0.5, asi que el cruce —el punto
     * donde ambos valen 0.5 de opacidad— cae exactamente en el 50% del
     * progreso, que es el disparador pedido. El ancho de 0.16 es lo que
     * hace que se lea como un fundido y no como un corte seco.
     *
     * Va atado a `galleryScroll` y no a un estado de React: el valor sale
     * de un MotionValue, asi que framer lo escribe directo en el estilo
     * sin re-renderizar el arbol en cada frame del scroll, y como es una
     * funcion pura del progreso el efecto se revierte solo al subir.
     *
     * ── Por que la version de FUNCION y no `useTransform(v, [a,b], [1,0])` ──
     *
     * Con la forma de arrays, framer reconoce los tramos como keyframes y
     * "acelera" la opacidad: se la entrega al navegador como animacion
     * nativa de scroll. El problema es con QUE reloj se la entrega. Medido
     * en el navegador: arma un `ViewTimeline` con `rangeName: "contain"`,
     * que no mide el progreso del scroll de la seccion sino cuanto entro y
     * salio el elemento de la pantalla. Ese valor sube y despues BAJA, asi
     * que la foto se desvanecia bien hasta el 60% y despues reaparecia
     * sola hasta volver a opacidad 1 al final. Ademas la animacion nativa
     * pisa el estilo inline, asi que el nodo decia `opacity: 1` mientras se
     * veia al 5%: el inline dejaba de ser la fuente de verdad.
     *
     * Una funcion no se puede expresar como keyframes, asi que framer no
     * la puede delegar y la resuelve en JS contra `galleryScroll`, que es
     * el progreso que realmente queremos. Es el mismo camino por el que ya
     * pasa el `scale` de las fotos, que siempre funciono bien.
     */
    const CROSS_START = 0.42;
    const CROSS_END = 0.58;

    /** 1 antes de la franja, 0 despues, lineal entre medio. */
    const fadeOutAt = (progress: number) => {
        const t = (progress - CROSS_START) / (CROSS_END - CROSS_START);
        if (t <= 0) return 1;
        if (t >= 1) return 0;
        return 1 - t;
    };

    /*
     * `reduceMotion` se resuelve DENTRO de la transformada, no en el
     * `style` del elemento.
     *
     * Hacerlo afuera —`style={reduceMotion ? { opacity: 1 } : { opacity: mv }}`—
     * parecia lo natural y estaba roto: `useReducedMotion()` devuelve
     * `null` en el primer render y recien despues el valor real, asi que
     * framer alcanza a enlazar el MotionValue, escribe su valor inicial y,
     * cuando el prop pasa a ser un numero fijo, se desuscribe pero ya no
     * vuelve a escribir. Resultado medido: la opacidad quedaba congelada en
     * la del progreso 0 —foto en 1, texto en 0— y quien tenia la
     * preferencia activada no veia nunca el texto. Mientras el binding no
     * cambie de forma, eso no puede pasar.
     */
    const centerImageOpacity = useTransform(galleryScroll, (p) =>
        reduceMotion ? 0 : fadeOutAt(p)
    );
    const centerTextOpacity = useTransform(galleryScroll, (p) =>
        reduceMotion ? 1 : 1 - fadeOutAt(p)
    );

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
                    text="No se trata solo de todo lo que AguaVista tiene, sino de todo lo que te permite vivir"
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
                        // Siempre el mismo MotionValue: la decision de
                        // movimiento reducido ya vino resuelta adentro.
                        style={{ opacity: centerTextOpacity }}
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
                    {images.map(({ src, alt, isCenter }, index) => {
                        const scale = scales[index % scales.length];
                        return (
                            <motion.div
                                key={index}
                                style={{ scale }}
                                className={`absolute top-0 flex h-full w-full items-center justify-center will-change-transform ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
                            >
                                {/* ── Reveal de entrada ──
                                    DOS elementos y no uno, a proposito.

                                    El de afuera es el que observa el viewport:
                                    conserva siempre su tamano real, asi que el
                                    IntersectionObserver puede verlo. El de
                                    adentro es el unico que lleva el clip-path.

                                    Fusionarlos —que el mismo nodo tenga el
                                    `whileInView` y el clip-path inicial— es un
                                    bloqueo mutuo: `inset(0% 50% 0% 50%)` recorta
                                    50% por izquierda y 50% por derecha, o sea
                                    deja el elemento con area CERO, y un elemento
                                    de area cero nunca intersecta el viewport. El
                                    disparador no llega a dispararse nunca y la
                                    foto se queda invisible para siempre. Es
                                    exactamente lo que habia pasado aca.

                                    El zoom continuo sigue viviendo en el `scale`
                                    del padre, asi que los dos efectos no se
                                    pisan: uno anima clip-path, el otro
                                    transform. Y como el `scale` esta clavado en
                                    1 hasta que la galeria se fija arriba, la
                                    secuencia sale sola: primero el barrido
                                    mientras la seccion sube, despues el zoom. */}
                                <div className="relative h-[25vh] w-[25vw]">
                                    {/* Capa del crossfade.
                                
                                        Es un nodo aparte del que lleva el clip-path a
                                        proposito: los dos animan `opacity` y si compartieran
                                        elemento se pisarian —el MotionValue del scroll le
                                        ganaria al variant del barrido de entrada y la foto
                                        apareceria de golpe—. Separados, las dos opacidades se
                                        multiplican solas: primero barre, despues se cruza.
                                
                                        Solo la del centro se desvanece; las demas quedan sin
                                        `style`, o sea sin capa extra que animar. */}
                                    <motion.div
                                        className="absolute inset-0"
                                        style={
                                            isCenter ? { opacity: centerImageOpacity } : undefined
                                        }
                                    >
                                        {/* El clip-path va en un nodo INTERNO y el
                                            disparador vive afuera, en la seccion.

                                            No es cosmetico: si el mismo nodo lleva
                                            el `whileInView` y el clip inicial, se
                                            bloquean entre si. `inset(0% 50% 0% 50%)`
                                            recorta 50% por izquierda y 50% por
                                            derecha, o sea deja el elemento con area
                                            CERO, y un elemento de area cero nunca
                                            intersecta el viewport: el disparador no
                                            llega a dispararse nunca y la foto queda
                                            invisible para siempre. Es lo que habia
                                            pasado aca, verificado con un
                                            IntersectionObserver de control que
                                            devolvia ratio 0 con la foto entera en
                                            pantalla.

                                            `initial={false}` con movimiento reducido
                                            pinta el estado final directo: sin eso el
                                            variant `hidden` se quedaba aplicado y la
                                            galeria entera era invisible para quien
                                            tiene la preferencia activada. */}
                                        <motion.div
                                            className="absolute inset-0 overflow-hidden"
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
                                                className="object-cover shadow-2xl"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </motion.div>
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
