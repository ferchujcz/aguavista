'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import Floating, { FloatingElement } from './floating';
import ShutterImageLoader from './shutter-image';

interface Image { src: string; alt?: string; }
interface ZoomParallaxProps { images: Image[]; }

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start end', 'end start'],
	});

	const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
	const y2 = useTransform(scrollYProgress, [0, 1], [0, -350]);
	const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);

	// Fondo: Arranca con 25% de recorte a cada lado (50% visible en el centro) y se expande al 100%
	const bgClipPath = useTransform(scrollYProgress, [0, 0.7], ['inset(0% 25% 0% 25%)', 'inset(0% 0% 0% 0%)']);

	return (
		<div ref={container} className="relative w-full min-h-screen bg-black py-32 px-4 md:px-10 overflow-hidden">
			{/* Fondo dinámico expansivo (Optimizado para GPU) */}
			<motion.div 
				style={{ 
					clipPath: bgClipPath,
					willChange: 'clip-path, transform',
					transform: 'translateZ(0)' 
				}}
				className="absolute inset-0 z-0 transform-gpu"
			>
			<img 
				src="/foto-8.jpg" 
				alt="Fondo AguaVista" 
				decoding="async"
				loading="lazy"
				className="absolute inset-0 w-full h-full object-cover" 
					onError={(e) => {
						(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1280';
					}}
				/>
				<div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
			</motion.div>

			<Floating sensitivity={1.5} className="relative z-10 w-full h-full">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl mx-auto">
					
					{/* Columna Izquierda */}
					<motion.div style={{ y: y1 }} className="flex flex-col gap-10 pt-20">
						{images[0] && (
							<FloatingElement depth={1.2} className="relative w-full aspect-[4/5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[0].src} alt={images[0].alt} direction="ltr" />
							</FloatingElement>
						)}
						{images[1] && (
							<FloatingElement depth={0.8} className="relative w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[1].src} alt={images[1].alt} direction="ltr" />
							</FloatingElement>
						)}
					</motion.div>

					{/* Columna Central (Coreografía Vertical) */}
					<motion.div style={{ y: y2 }} className="flex flex-col gap-10">
						{images[2] && (
							<FloatingElement depth={1.5} className="relative w-full aspect-[3/4] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[2].src} alt={images[2].alt} direction="ttb" />
							</FloatingElement>
						)}
						{images[3] && (
							<FloatingElement depth={0.5} className="relative w-full aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[3].src} alt={images[3].alt} direction="center" />
							</FloatingElement>
						)}
						{images[6] && (
							<FloatingElement depth={1.1} className="relative w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[6].src} alt={images[6].alt} direction="btt" />
							</FloatingElement>
						)}
					</motion.div>

					{/* Columna Derecha */}
					<motion.div style={{ y: y3 }} className="flex flex-col gap-10 pt-40">
						{images[4] && (
							<FloatingElement depth={0.9} className="relative w-full aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[4].src} alt={images[4].alt} direction="rtl" />
							</FloatingElement>
						)}
						{images[5] && (
							<FloatingElement depth={1.4} className="relative w-full aspect-[4/5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
								<ShutterImageLoader src={images[5].src} alt={images[5].alt} direction="rtl" />
							</FloatingElement>
						)}
					</motion.div>

				</div>
			</Floating>
		</div>
	);
}
