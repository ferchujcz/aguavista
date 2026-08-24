/**
 * Catálogo de amenities.
 *
 * Solo los datos estructurales viven acá — títulos y descripciones salen
 * de messages/*.json bajo `amenities.items.<id>`. Todas las rutas de
 * imagen están verificadas contra /public: la versión anterior del sitio
 * referenciaba 11 archivos inexistentes (spa1, club1, nautica1…) que
 * salían rotos en producción.
 */

export interface Amenity {
  id: string;
  image: string;
  /** Reel opcional que se reproduce en hover sobre desktop. */
  video?: string;
  /** Peso en el grid asimétrico: las destacadas ocupan dos columnas. */
  featured?: boolean;
}

export const AMENITIES: readonly Amenity[] = [
  { id: "golf", image: "/golf1.webp", video: "/golfreel.mp4", featured: true },
  { id: "nautica", image: "/nautica.webp" },
  { id: "playa", image: "/playa.webp" },
  { id: "tenis", image: "/tenis1.webp", video: "/tenisreel.mp4" },
  { id: "spa", image: "/spa.webp" },
  { id: "aeropuerto", image: "/aero1.webp", video: "/aeropuertoreel.mp4", featured: true },
  { id: "jardin", image: "/foto-5.webp" },
  { id: "agua", image: "/foto-7.webp" },
] as const;
