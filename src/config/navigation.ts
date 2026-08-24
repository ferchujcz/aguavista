import { TESTIMONIALS_PUBLISHED } from "./features";

/**
 * Enlaces de navegación, compartidos por el navbar, el drawer mobile y
 * el footer.
 *
 * Vive en su propio módulo (sin "use client") a propósito: cuando estaba
 * exportado desde Navbar.tsx, el Footer —que es server component— recibía
 * una referencia de cliente en vez del array y el build reventaba con
 * "NAV_LINKS.map is not a function".
 *
 * `key` es la clave de traducción bajo el namespace `nav`.
 */

interface NavLinkDef {
  key: string;
  href: string;
  /** Si es false, el enlace no se renderiza en ningún menú. */
  enabled?: boolean;
}

const ALL_LINKS: readonly NavLinkDef[] = [
  { key: "inicio", href: "#inicio" },
  { key: "amenities", href: "#amenities" },
  { key: "lotes", href: "#lotes" },
  // El ancla solo existe cuando la sección se renderiza; si no, el link
  // llevaría a la nada y el scroll-spy nunca lo marcaría.
  { key: "testimonios", href: "#testimonios", enabled: TESTIMONIALS_PUBLISHED },
  { key: "faq", href: "#faq" },
];

export const NAV_LINKS = ALL_LINKS.filter((l) => l.enabled !== false);

export type NavLink = (typeof NAV_LINKS)[number];
