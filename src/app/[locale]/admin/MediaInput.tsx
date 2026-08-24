"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadMedia } from "@/app/actions/admin-cms";
import { AdminButton } from "./AdminUI";

/** Resultado de una acción del panel, para mostrarlo al lado del botón. */
export type Feedback = { ok: boolean; message: string } | null;

/**
 * Campo de medio: acepta una ruta escrita a mano o un archivo subido.
 *
 * Vive en su propio módulo porque lo usan tanto el editor de amenities
 * (donde la URL se persiste al guardar la ficha completa) como el
 * gestor de medios (donde se guarda de inmediato). Renderiza un input
 * de texto REAL con `name`, así el contenedor puede leerlo por FormData
 * sin que este componente tenga que saber cómo se persiste.
 *
 * La subida y el guardado están separados a propósito: subir un archivo
 * de 20 MB y descubrir después que era el campo equivocado obliga a
 * poder revisar la URL antes de aplicarla.
 */
export function MediaInput({
  label,
  name,
  defaultValue,
  accept,
  hint,
  onFeedback,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  accept: string;
  hint?: string;
  onFeedback: (f: Feedback) => void;
  /** Espejo del valor, para que el padre pueda previsualizarlo. */
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    onFeedback(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadMedia(fd);
    setUploading(false);

    if (result.ok && result.url) {
      // La URL devuelta se escribe en el input de texto: recién se
      // persiste cuando el usuario guarda.
      update(result.url);
      onFeedback({ ok: true, message: `${result.message} Acordate de guardar.` });
    } else {
      onFeedback({ ok: false, message: result.message });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal opacity-70">{hint}</span>}
      </span>

      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => update(e.target.value)}
          placeholder="/foto.webp o https://…"
          className="min-w-0 flex-1 rounded-xl border border-[color:var(--av-border)] bg-[color:var(--av-base)] px-3.5 py-2.5 font-sans text-[13px] font-light text-ink outline-none transition-colors duration-200 focus:border-[color:var(--av-vivo)] placeholder:text-ink-faint"
        />

        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            // Se limpia para poder volver a elegir el mismo archivo.
            e.target.value = "";
          }}
        />

        <AdminButton
          type="button"
          variant="ghost"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          <Upload className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          {uploading ? "Subiendo…" : "Subir"}
        </AdminButton>
      </div>
    </div>
  );
}
