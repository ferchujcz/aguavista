import { getServiceClient, isServiceConfigured } from "@/lib/supabase-admin";
import { canReadAdminData } from "@/lib/admin-auth";
import { EmptyState, NotConfigured, PageHeader } from "./AdminUI";
import { LeadsTable, type Lead } from "./LeadsTable";

// Las consultas cambian todo el tiempo: nunca se cachea esta vista.
export const dynamic = "force-dynamic";

/**
 * Bandeja de consultas del formulario de contacto.
 *
 * Los datos los escribe `src/app/actions/contact.ts` en la tabla
 * `leads` de Supabase, usando el service role: la tabla tiene RLS
 * activo y ninguna política, así que es invisible para la anon key del
 * navegador. Solo se lee desde acá, en el servidor.
 */
export default async function LeadsPage() {
  // El guard del layout NO alcanza: los segmentos hermanos renderizan en
  // paralelo, asi que este cuerpo se ejecuta —y sus consultas viajan en
  // el payload RSC— aunque el layout muestre el login. Ver canReadAdminData().
  if (!(await canReadAdminData())) return null;

  if (!isServiceConfigured()) {
    return (
      <>
        <PageHeader
          title="Consultas"
          subtitle="Formularios de contacto recibidos desde el sitio."
        />
        <NotConfigured what="La bandeja de consultas" />
      </>
    );
  }

  const supabase = getServiceClient()!;
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <>
        <PageHeader title="Consultas" />
        <div className="mx-6 my-8 rounded-2xl border border-[#E2725B]/35 bg-[#E2725B]/5 p-6 md:mx-10">
          <p className="font-sans text-[13px] text-[#E2725B]">
            No se pudo leer la tabla <code>leads</code>: {error.message}
          </p>
          <p className="mt-2 font-sans text-[13px] font-light text-ink-muted">
            Si la tabla todavía no existe, corré <code>supabase/schema.sql</code> en
            el SQL Editor de tu proyecto de Supabase.
          </p>
        </div>
      </>
    );
  }

  const leads = (data ?? []) as Lead[];
  const nuevos = leads.filter((l) => l.status === "nuevo").length;

  return (
    <>
      <PageHeader
        title="Consultas"
        subtitle={
          leads.length
            ? `${leads.length} consultas recibidas · ${nuevos} sin contactar.`
            : "Formularios de contacto recibidos desde el sitio."
        }
      />

      {leads.length === 0 ? (
        <EmptyState
          title="Todavía no hay consultas"
          body="Cuando alguien complete el formulario de contacto del sitio, va a aparecer acá con su nombre, email, teléfono y el interés que eligió."
        />
      ) : (
        <LeadsTable leads={leads} />
      )}
    </>
  );
}
