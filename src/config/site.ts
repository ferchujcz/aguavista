/**
 * Fuente única de verdad para datos de marca, contacto y RRSS.
 * Todo lo que aparezca en más de un lugar (footer, metadata, JSON-LD,
 * botón de WhatsApp) sale de acá para que no se desincronice.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TODO — LO ÚNICO QUE SIGUE PENDIENTE                             ║
 * ║   [ ] contact.address   dirección postal real del predio         ║
 * ║   [ ] geo               coordenadas reales (Google Maps → clic   ║
 * ║                         derecho sobre la entrada → copiar)       ║
 * ║  Ambas alimentan el JSON-LD de negocio local que lee Google.     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export const siteConfig = {
  name: "AguaVista",
  legalName: "AguaVista S.A.",
  tagline: "Condominio privado a orillas del Río Paraná",
  description:
    "Condominio privado de 1.200 hectáreas sobre el Río Paraná. Golf profesional, náutica, aeropuerto ejecutivo y lotes desde 800 m² con financiación a 84 cuotas.",

  /* Sin barra final: se concatena con las rutas. Configurable por entorno
     para que los OG y el sitemap apunten bien en preview y en producción. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://aguavista.com.py",

  ogImage: "/og/aguavista-og.jpg",

  contact: {
    /** Formato visible en pantalla. */
    phone: "+595 982 190 911",
    /** Para el enlace tel:. Solo + y dígitos. */
    phoneRaw: "+595982190911",
    /** Para wa.me/. Solo dígitos, sin + ni espacios. */
    whatsapp: "595982190911",
    email: "comercial@aguavista.com.py",
    // PENDIENTE — dirección postal real del predio.
    address: "Ruta PY02 km 32, Paraguarí, Paraguay",
  },

  /* Para quitar una red que no se use, borrá su objeto: los íconos del
     footer, de la sección de contacto y del drawer se recalculan solos. */
  social: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/aguavistapy/",
      icon: "instagram",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/aguavista/?locale=es_LA",
      icon: "facebook",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/aguavista",
      icon: "linkedin",
    },
  ] as const,

  /* PENDIENTE — coordenadas aproximadas. Alimentan el JSON-LD de negocio
     local, así que conviene que apunten a la entrada real del predio. */
  geo: { lat: -25.6236, lng: -57.1505 },
} as const;

export type SiteConfig = typeof siteConfig;
