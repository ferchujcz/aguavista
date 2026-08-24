"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  clearAttempts,
  createSession,
  destroySession,
  isAdminConfigured,
  isLockedOut,
  registerFailedAttempt,
  verifyPassword,
} from "@/lib/admin-auth";

export type LoginState = {
  error: "credentials" | "locked" | "unconfigured" | null;
};

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown";
}

/**
 * Login del panel. Se usa con `useActionState`, por eso recibe el estado
 * previo aunque no lo lea.
 *
 * La contraseña llega por FormData y se compara del lado del servidor:
 * el bundle del cliente no contiene ni la contraseña ni la lógica de
 * comparación.
 */
export async function adminLogin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAdminConfigured()) {
    console.error(
      "[admin] Falta ADMIN_PASSWORD o ADMIN_SESSION_SECRET (min. 32 caracteres)."
    );
    return { error: "unconfigured" };
  }

  const ip = await clientIp();
  if (isLockedOut(ip)) return { error: "locked" };

  const password = formData.get("password");
  if (typeof password !== "string" || !password) {
    registerFailedAttempt(ip);
    return { error: "credentials" };
  }

  if (!verifyPassword(password)) {
    registerFailedAttempt(ip);
    return { error: "credentials" };
  }

  clearAttempts(ip);
  await createSession();
  // Fuerza a que el server component de /admin se vuelva a evaluar y
  // esta vez encuentre la sesión válida.
  revalidatePath("/[locale]/admin", "page");
  return { error: null };
}

export async function adminLogout(): Promise<void> {
  await destroySession();
  revalidatePath("/[locale]/admin", "page");
}
