/**
 * Interruptores de secciones.
 *
 * Se prefieren flags a comentar bloques de JSX: el código sigue
 * compilando y tipando, así que no se pudre mientras está apagado.
 */

/**
 * Masterplan interactivo ("Nuestras áreas en venta").
 *
 * APAGADO a la espera de integrar la navegación 360 definitiva.
 * Mientras tanto se muestra <ComingSoon /> en su lugar.
 *
 * Para volver a prenderlo: poner `true`. No hace falta tocar nada más
 * — el componente, sus tipos y el panel /admin que lo alimenta siguen
 * intactos y compilando.
 */
export const SHOW_SALES_SECTION = false;

/**
 * Sección de testimonios.
 *
 * APAGADA hasta que se carguen las citas reales y autorizadas en
 * src/data/testimonials.ts (hoy tiene texto de relleno y nombres
 * vacíos). El flag existe para que ese relleno no pueda salir a
 * producción por descuido.
 *
 * Para prenderla: completar el array y poner `true`.
 */
export const TESTIMONIALS_PUBLISHED = false;
