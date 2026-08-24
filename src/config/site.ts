/**
 * Fuente única de verdad para datos de marca, contacto y RRSS.
 * Todo lo que aparezca en más de un lugar (footer, metadata, JSON-LD,
 * botón de WhatsApp) sale de acá para que no se desincronice.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TODO — DATOS PENDIENTES DE REEMPLAZO                            ║
 * ║                                                                  ║
 * ║  Los valores marcados con PENDIENTE son provisorios. Cambiá los  ║
 * ║  de abajo y listo: se propagan solos al footer, a la sección de  ║
 * ║  contacto, al botón flotante de WhatsApp, al JSON-LD de Google   ║
 * ║  y a los enlaces del drawer mobile.                              ║
 * ║                                                                  ║
 * ║  Checklist:                                                      ║
 * ║   [ ] contact.phone      teléfono con formato legible            ║
 * ║   [ ] contact.phoneRaw   el mismo, solo dígitos y +              ║
 * ║   [ ] contact.whatsapp   solo dígitos, sin + ni espacios         ║
 * ║   [ ] contact.email                                              ║
 * ║   [ ] contact.address    dirección real del predio               ║
 * ║   [ ] social[].href      URL exacta de cada perfil               ║
 * ║   [ ] geo                coordenadas reales (Google Maps →       ║
 * ║                          clic derecho sobre el predio)           ║
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
    // PENDIENTE — formato visible en pantalla
    phone: "+595 985 123 456",
    // PENDIENTE — para el enlace tel:, solo + y dígitos
    phoneRaw: "+595985123456",
    // PENDIENTE — para wa.me/, solo dígitos (sin +, sin espacios)
    whatsapp: "595985123456",
    // PENDIENTE
    email: "info@aguavista.com.py",
    // PENDIENTE
    address: "Ruta PY02 km 32, Paraguarí, Paraguay",
  },

  /* PENDIENTE — reemplazar cada href por la URL exacta del perfil.
     Para quitar una red que no se use, borrá su objeto: los íconos del
     footer, del contacto y del drawer se recalculan solos. */
  social: [
    { name: "Instagram", href: "https://instagram.com/aguavista", icon: "instagram" },
    { name: "Facebook", href: "https://facebook.com/aguavista", icon: "facebook" },
    { name: "YouTube", href: "https://youtube.com/@aguavista", icon: "youtube" },
    { name: "LinkedIn", href: "https://linkedin.com/company/aguavista", icon: "linkedin" },
  ] as const,

  /* PENDIENTE — coordenadas aproximadas. Alimentan el JSON-LD de negocio
     local, así que conviene que apunten a la entrada real del predio. */
  geo: { lat: -25.6236, lng: -57.1505 },
} as const;

export type SiteConfig = typeof siteConfig;
