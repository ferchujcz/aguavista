/**
 * Testimonios de propietarios.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TODO — INYECTAR LOS TESTIMONIOS REALES                          ║
 * ║                                                                  ║
 * ║  Las tres entradas de abajo son ESTRUCTURA, no contenido: el     ║
 * ║  texto es de relleno y los nombres están vacíos a propósito      ║
 * ║  (no se inventan personas).                                      ║
 * ║                                                                  ║
 * ║  Para publicarlos:                                               ║
 * ║   1. Completá `quote`, `name`, `role` y `since` de cada entrada. ║
 * ║      Si falta la traducción a en/pt, dejá la clave vacía: el     ║
 * ║      carrusel cae al español solo.                               ║
 * ║   2. Agregá `avatar: "/ruta.webp"` si hay foto (opcional).       ║
 * ║   3. Poné TESTIMONIALS_PUBLISHED = true en src/config/features.  ║
 * ║                                                                  ║
 * ║  Mientras el flag esté en false la sección no se renderiza, así  ║
 * ║  que este relleno no puede salir a producción por descuido.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export interface Testimonial {
  id: string;
  /** Cita por idioma. Si falta una traducción, cae al español. */
  quote: Record<string, string>;
  name: string;
  role: Record<string, string>;
  /** Año en que se sumaron al condominio. */
  since: string;
  avatar?: string;
}

const PLACEHOLDER_QUOTE = {
  es: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Reemplazar por la cita real del propietario, autorizada por escrito.",
  en: "",
  pt: "",
};

const PLACEHOLDER_ROLE = { es: "", en: "", pt: "" };

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t1",
    quote: PLACEHOLDER_QUOTE,
    name: "",
    role: PLACEHOLDER_ROLE,
    since: "",
  },
  {
    id: "t2",
    quote: PLACEHOLDER_QUOTE,
    name: "",
    role: PLACEHOLDER_ROLE,
    since: "",
  },
  {
    id: "t3",
    quote: PLACEHOLDER_QUOTE,
    name: "",
    role: PLACEHOLDER_ROLE,
    since: "",
  },
] as const;
