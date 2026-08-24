"use server";

import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { contactServerSchema } from "@/lib/contact-schema";

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "validation" | "rate-limit" | "server" };

/* ── Rate limit en memoria ─────────────────────────────────────────
   Suficiente para un formulario de contacto en una sola instancia.
   Si el sitio pasa a correr en varias regiones o en edge, esto hay que
   moverlo a Upstash/Redis: cada instancia tiene su propio Map. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Poda perezosa para que el Map no crezca sin límite.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Recibe una consulta del formulario de contacto.
 *
 * Server action y no route handler: el payload no queda expuesto como
 * endpoint público y la validación vive junto al schema compartido.
 * Se revalida TODO acá — la validación del cliente es UX, no seguridad.
 */
export async function submitContact(
  raw: Record<string, unknown>
): Promise<ContactResult> {
  const parsed = contactServerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "validation" };

  const data = parsed.data;

  // Honeypot lleno: se responde ok para no enseñarle al bot qué falló.
  if (data.company) return { ok: true };

  if (rateLimited(await clientIp())) {
    return { ok: false, reason: "rate-limit" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service role: solo existe en el servidor. Permite escribir en `leads`
  // con RLS activo sin abrir la tabla a la anon key del navegador.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Sin backend configurado la consulta no se pierde en silencio.
    console.error("[contacto] Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    return { ok: false, reason: "server" };
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const h = await headers();

    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      interest: data.interest,
      message: data.message || null,
      locale: h.get("x-next-intl-locale") ?? null,
      user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[contacto] Error de Supabase:", error.message);
      return { ok: false, reason: "server" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[contacto] Error inesperado:", err);
    return { ok: false, reason: "server" };
  }
}
