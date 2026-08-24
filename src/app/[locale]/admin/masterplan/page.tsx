import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { hasValidSession } from "@/lib/admin-auth";
import { AdminLogin } from "./AdminLogin";
import { AdminPanel } from "./AdminPanel";

export const metadata: Metadata = {
  title: "Centro de Mando",
  // Aunque robots.ts ya lo excluye, el meta cubre el caso de que alguien
  // enlace la URL directamente desde afuera.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Puerta del panel de administración.
 *
 * Es un SERVER component a propósito: la validación de la sesión lee una
 * cookie httpOnly firmada con HMAC y nunca cruza al cliente. Si la sesión
 * no es válida, el árbol del panel directamente no se serializa en la
 * respuesta — no es un `display:none`, el HTML del panel no existe.
 *
 * Reemplaza al `if (pinInput === '1234')` que vivía en un client
 * component y viajaba en el bundle de JavaScript.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const authorized = await hasValidSession();
  if (!authorized) return <AdminLogin />;

  return <AdminPanel />;
}
