import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todo menos: rutas de API, internos de Next, y cualquier archivo con
  // extensión (assets de /public). Sin este filtro el middleware correría
  // en cada imagen y video, agregando latencia a 124 archivos estáticos.
  matcher: ["/((?!api|_next|_vercel|.*\..*).*)"],
};
