"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type LotStatus = "available" | "reserved" | "sold";

interface LotPin {
  id: string;
  /** Label shown on the pin */
  label: string;
  /** Position as percentage of the map image (0-100) */
  x: number;
  y: number;
  status: LotStatus;
  /** Lot details shown in the modal */
  lotNumber: string;
  surface: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  /** Gallery images for the modal */
  images: string[];
  /** Optional 360 embed URL */
  tour360Url?: string;
}

interface InteractiveMapProps {
  /** High-res render/plan image of the neighborhood */
  mapImageSrc?: string;
  mapImageAlt?: string;
  headline?: string;
  headlineItalic?: string;
  overline?: string;
  pins?: LotPin[];
  className?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  LotStatus,
  { label: string; color: string; ring: string; dot: string }
> = {
  available: {
    label: "Disponible",
    color: "text-[#C9A962]",
    ring: "ring-[#C9A962]/60",
    dot: "bg-[#C9A962]",
  },
  reserved: {
    label: "Reservado",
    color: "text-[#A8A29E]",
    ring: "ring-[#A8A29E]/40",
    dot: "bg-[#A8A29E]",
  },
  sold: {
    label: "Vendido",
    color: "text-[#44403C]",
    ring: "ring-[#44403C]/40",
    dot: "bg-[#44403C]",
  },
};

// ─── Default data (placeholders) ─────────────────────────────────────────────

const DEFAULT_PINS: LotPin[] = [
  {
    id: "lot-01",
    label: "01",
    x: 22,
    y: 35,
    status: "available",
    lotNumber: "Lote 01",
    surface: "1.200 m²",
    price: "USD 2.400.000",
    bedrooms: 5,
    bathrooms: 6,
    description:
      "Residencia de esquina con orientación norte. Amplias terrazas, piscina desbordante y jardín privado de 400 m². Vistas directas al campo de golf.",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80",
    ],
  },
  {
    id: "lot-02",
    label: "02",
    x: 38,
    y: 28,
    status: "available",
    lotNumber: "Lote 02",
    surface: "980 m²",
    price: "USD 1.850.000",
    bedrooms: 4,
    bathrooms: 5,
    description:
      "Diseño contemporáneo con doble altura en living. Bodega climatizada, sala de cine y acceso directo al sendero ecuestre.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
    ],
  },
  {
    id: "lot-03",
    label: "03",
    x: 55,
    y: 42,
    status: "reserved",
    lotNumber: "Lote 03",
    surface: "1.450 m²",
    price: "USD 3.100.000",
    bedrooms: 6,
    bathrooms: 7,
    description:
      "La residencia más grande del barrio. Pabellón de invitados independiente, cancha de tenis privada y helipuerto propio.",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=900&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=80",
    ],
  },
  {
    id: "lot-04",
    label: "04",
    x: 68,
    y: 30,
    status: "available",
    lotNumber: "Lote 04",
    surface: "820 m²",
    price: "USD 1.600.000",
    bedrooms: 4,
    bathrooms: 4,
    description:
      "Arquitectura minimalista con materiales nobles. Frente al lago artificial con muelle privado para kayaks y veleros.",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=900&q=80",
    ],
  },
  {
    id: "lot-05",
    label: "05",
    x: 45,
    y: 62,
    status: "sold",
    lotNumber: "Lote 05",
    surface: "1.100 m²",
    price: "USD 2.200.000",
    bedrooms: 5,
    bathrooms: 5,
    description:
      "Residencia vendida. Diseño de autor con jardín botánico privado y spa interior de 200 m².",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80",
    ],
  },
  {
    id: "lot-06",
    label: "06",
    x: 78,
    y: 55,
    status: "available",
    lotNumber: "Lote 06",
    surface: "760 m²",
    price: "USD 1.450.000",
    bedrooms: 3,
    bathrooms: 4,
    description:
      "Residencia compacta de lujo. Ideal para parejas o familias pequeñas. Terraza rooftop con jacuzzi y vistas a 360°.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=900&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80",
    ],
  },
];

// ─── Modal Component ──────────────────────────────────────────────────────────

interface LotModalProps {
  lot: LotPin;
  onClose: () => void;
}

function LotModal({ lot, onClose }: LotModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const status = STATUS_CONFIG[lot.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${lot.lotNumber}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0C0A09]/90 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl bg-[#1C1917] border border-[#292524] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top border */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A962]/60 to-transparent" aria-hidden="true" />

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ── Left: Image gallery ── */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-[280px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={lot.images[activeImageIndex]}
                alt={`${lot.lotNumber} — imagen ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>

            {/* Image overlay gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(28,25,23,0.7) 0%, transparent 50%)",
              }}
              aria-hidden="true"
            />

            {/* Thumbnail strip */}
            {lot.images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                {lot.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "w-10 h-7 overflow-hidden border transition-all duration-300",
                      i === activeImageIndex
                        ? "border-[#C9A962] opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-pressed={i === activeImageIndex}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 360 tour button */}
            {lot.tour360Url && (
              <button
                onClick={() => setShowTour(true)}
                className="absolute top-4 left-4 font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.2em] text-[#C9A962] uppercase border border-[#C9A962]/50 px-3 py-2 hover:bg-[#C9A962]/10 transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-[#C9A962]"
              >
                360° Tour
              </button>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Status + lot number */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={cn(
                    "font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.3em] uppercase",
                    status.color
                  )}
                >
                  {status.label}
                </span>
                <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.2em] text-[#A8A29E] uppercase">
                  {lot.lotNumber}
                </span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#FAFAF9]">
                  {lot.price}
                </span>
              </div>

              {/* Gold divider */}
              <div className="w-12 h-px bg-[#C9A962] mb-6" aria-hidden="true" />

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { value: lot.surface, label: "Superficie" },
                  { value: `${lot.bedrooms}`, label: "Dormitorios" },
                  { value: `${lot.bathrooms}`, label: "Baños" },
                ].map((spec) => (
                  <div key={spec.label} className="flex flex-col gap-1">
                    <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#FAFAF9]">
                      {spec.value}
                    </span>
                    <span className="font-[family-name:var(--font-josefin)] text-[8px] font-light tracking-[0.2em] text-[#A8A29E] uppercase">
                      {spec.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="font-[family-name:var(--font-josefin)] text-[12px] font-light tracking-[0.04em] text-[#A8A29E] leading-relaxed">
                {lot.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              {lot.status === "available" && (
                <button
                  className={cn(
                    "group relative w-full py-4 overflow-hidden",
                    "font-[family-name:var(--font-josefin)] text-[11px] font-light tracking-[0.25em] uppercase",
                    "border border-[#C9A962] text-[#C9A962]",
                    "hover:text-[#0C0A09] transition-colors duration-500",
                    "focus:outline-none focus:ring-1 focus:ring-[#C9A962]"
                  )}
                >
                  <span
                    className="absolute inset-0 bg-[#C9A962] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">Solicitar Información</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.2em] text-[#A8A29E] uppercase hover:text-[#FAFAF9] transition-colors duration-300 focus:outline-none focus:text-[#FAFAF9]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 360 Tour overlay */}
      <AnimatePresence>
        {showTour && lot.tour360Url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#0C0A09]/95"
            onClick={() => setShowTour(false)}
          >
            <div className="w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={lot.tour360Url}
                className="w-full h-full border-0"
                title={`Tour 360° — ${lot.lotNumber}`}
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setShowTour(false)}
              className="absolute top-6 right-6 font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.2em] text-[#A8A29E] uppercase hover:text-[#FAFAF9] transition-colors duration-300 focus:outline-none"
            >
              Cerrar Tour
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Pin Component ────────────────────────────────────────────────────────────

interface MapPinProps {
  pin: LotPin;
  isActive: boolean;
  onClick: () => void;
}

function MapPin({ pin, isActive, onClick }: MapPinProps) {
  const status = STATUS_CONFIG[pin.status];

  return (
    <motion.button
      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 z-10",
        "flex flex-col items-center gap-1 group",
        "focus:outline-none"
      )}
      onClick={onClick}
      aria-label={`${pin.lotNumber} — ${status.label} — ${pin.price}`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Pin dot with pulse */}
      <div className="relative">
        {/* Pulse ring */}
        {pin.status === "available" && (
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 rounded-full",
              status.dot
            )}
            aria-hidden="true"
          />
        )}
        {/* Main dot */}
        <div
          className={cn(
            "relative w-4 h-4 rounded-full border-2 border-[#0C0A09] transition-all duration-300",
            status.dot,
            isActive && "ring-2 ring-offset-1 ring-offset-[#0C0A09]",
            isActive && status.ring
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] uppercase",
          "bg-[#0C0A09]/80 px-1.5 py-0.5 backdrop-blur-sm",
          "transition-colors duration-300",
          pin.status === "available"
            ? "text-[#C9A962]"
            : pin.status === "reserved"
            ? "text-[#A8A29E]"
            : "text-[#44403C]"
        )}
      >
        {pin.label}
      </span>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InteractiveMap({
  mapImageSrc = "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1600&q=80",
  mapImageAlt = "Masterplan del barrio privado — render arquitectónico",
  headline = "El Masterplan",
  headlineItalic = "Que Mereces",
  overline = "Masterplan Interactivo",
  pins = DEFAULT_PINS,
  className,
}: InteractiveMapProps) {
  const [activeLot, setActiveLot] = useState<LotPin | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  const handlePinClick = useCallback(
    (pin: LotPin) => {
      setActiveLot(pin);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setActiveLot(null);
  }, []);

  // Stats
  const available = pins.filter((p) => p.status === "available").length;
  const reserved = pins.filter((p) => p.status === "reserved").length;
  const sold = pins.filter((p) => p.status === "sold").length;

  return (
    <>
      <section
        ref={sectionRef}
        id="masterplan"
        aria-label="Masterplan interactivo del barrio"
        className={cn(
          "relative w-full bg-[#0C0A09] py-24 md:py-32 overflow-hidden",
          className
        )}
      >
        {/* ── Section header ── */}
        <div className="px-8 md:px-16 mb-12">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-josefin)] text-[10px] font-light tracking-[0.35em] text-[#C9A962] uppercase mb-5"
          >
            {overline}
          </motion.p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%" }}
                  animate={isInView ? { y: "0%" } : {}}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl lg:text-7xl font-light leading-[0.9] text-[#FAFAF9]"
                >
                  {headline}
                </motion.h2>
              </div>
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: "100%" }}
                  animate={isInView ? { y: "0%" } : {}}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl lg:text-7xl font-light leading-[0.9] text-[#FAFAF9] italic"
                >
                  {headlineItalic}
                </motion.h2>
              </div>
            </div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-6"
              aria-label="Leyenda del mapa"
            >
              {(
                [
                  { status: "available" as LotStatus, count: available },
                  { status: "reserved" as LotStatus, count: reserved },
                  { status: "sold" as LotStatus, count: sold },
                ] as { status: LotStatus; count: number }[]
              ).map(({ status, count }) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", cfg.dot)} aria-hidden="true" />
                    <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.2em] text-[#A8A29E] uppercase">
                      {cfg.label}
                    </span>
                    <span className="font-[family-name:var(--font-cormorant)] text-lg font-light text-[#FAFAF9]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* ── Map container ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-8 md:mx-16 border border-[#292524] overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Map image */}
          <img
            src={mapImageSrc}
            alt={mapImageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Dark overlay for contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(12,10,9,0.4) 0%, rgba(12,10,9,0.2) 50%, rgba(12,10,9,0.5) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,169,98,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden="true"
          />

          {/* Pins */}
          {pins.map((pin) => (
            <MapPin
              key={pin.id}
              pin={pin}
              isActive={hoveredId === pin.id || activeLot?.id === pin.id}
              onClick={() => handlePinClick(pin)}
            />
          ))}

          {/* Compass rose */}
          <div
            className="absolute bottom-4 right-4 flex flex-col items-center gap-0.5 opacity-60"
            aria-hidden="true"
          >
            <span className="font-[family-name:var(--font-josefin)] text-[8px] font-light tracking-[0.2em] text-[#C9A962] uppercase">
              N
            </span>
            <div className="w-px h-6 bg-gradient-to-b from-[#C9A962] to-transparent" />
          </div>

          {/* "Click on a pin" hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="absolute bottom-4 left-4"
          >
            <span className="font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.2em] text-[#A8A29E]/70 uppercase">
              Haga clic en un lote para ver detalles
            </span>
          </motion.div>
        </motion.div>

        {/* ── Bottom note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-6 px-8 md:px-16 font-[family-name:var(--font-josefin)] text-[9px] font-light tracking-[0.15em] text-[#44403C] uppercase"
        >
          * Render ilustrativo. Las dimensiones y ubicaciones son aproximadas. Sujeto a cambios sin previo aviso.
        </motion.p>
      </section>

      {/* ── Modal (portal-like, outside section) ── */}
      <AnimatePresence>
        {activeLot && (
          <LotModal lot={activeLot} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
}
