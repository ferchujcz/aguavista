"use client";

import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import { uploadMedia } from "@/app/actions/admin-cms";
import { AdminButton } from "./AdminUI";
import type { Feedback } from "./MediaInput";

/** Cada foto lleva una clave estable propia. */
interface Slot {
  key: string;
  url: string;
}

let counter = 0;
const nextKey = () => `g${counter++}`;

/**
 * Editor de la galería de una amenity: una lista ordenada de fotos.
 *
 * Renderiza un `<input name="gallery">` REAL por cada foto, así la server
 * action las lee con `formData.getAll("gallery")` y este componente no
 * necesita saber cómo se persiste — mismo contrato que MediaInput.
 *
 * Por qué claves propias y no el índice del array: si la clave fuera el
 * índice, borrar la foto 2 haría que React reutilizara el input de la 3
 * para la 4, y el texto escrito y el foco saltarían de fila. Con una clave
 * estable cada input sigue a su foto.
 *
 * La portada NO se edita acá: vive en su propio MediaInput porque la
 * columna es `not null` y es lo que garantiza que la tarjeta del riel
 * siempre tenga algo que mostrar.
 */
export function GalleryInput({
  defaultValue,
  onFeedback,
}: {
  defaultValue: string[] | null | undefined;
  onFeedback: (f: Feedback) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (defaultValue ?? []).map((url) => ({ key: nextKey(), url }))
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const setUrl = (key: string, url: string) =>
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, url } : s)));

  const remove = (key: string) => setSlots((prev) => prev.filter((s) => s.key !== key));

  const move = (index: number, delta: number) =>
    setSlots((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  /** Subida múltiple: se agrega una fila por archivo, en orden. */
  const handleFiles = async (files: File[]) => {
    setUploading(true);
    onFeedback(null);
    const added: string[] = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadMedia(fd);
      if (result.ok && result.url) {
        added.push(result.url);
      } else {
        // Se corta en el primer error pero se conserva lo ya subido: hacer
        // perder cinco fotos buenas por una sexta que falló sería peor.
        onFeedback({ ok: false, message: `${file.name}: ${result.message}` });
        break;
      }
    }

    if (added.length) {
      setSlots((prev) => [...prev, ...added.map((url) => ({ key: nextKey(), url }))]);
      onFeedback({
        ok: true,
        message: `${added.length} foto${added.length > 1 ? "s" : ""} subida${
          added.length > 1 ? "s" : ""
        }. Acordate de guardar.`,
      });
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        Galería
        <span className="ml-2 normal-case tracking-normal opacity-70">
          fotos extra del detalle · la portada va primero sola
        </span>
      </span>

      {slots.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[color:var(--av-border)] px-3.5 py-3 font-sans text-[12px] font-light text-ink-faint">
          Sin fotos extra. El detalle muestra solo la portada y el carrusel no
          aparece.
        </p>
      ) : (
        <ul id={listId} className="flex flex-col gap-2">
          {slots.map((slot, i) => (
            <li key={slot.key} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center font-sans text-[11px] text-ink-faint">
                {i + 2}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element -- la URL
                  puede ser de cualquier host; acá no vale la pena pasar por
                  el optimizador. */}
              <img
                src={slot.url}
                alt=""
                className="size-10 shrink-0 rounded-lg border border-[color:var(--av-border-soft)] object-cover"
                loading="lazy"
              />

              <input
                type="text"
                name="gallery"
                value={slot.url}
                onChange={(e) => setUrl(slot.key, e.target.value)}
                placeholder="/foto.webp o https://…"
                className="min-w-0 flex-1 rounded-xl border border-[color:var(--av-border)] bg-[color:var(--av-base)] px-3.5 py-2.5 font-sans text-[13px] font-light text-ink outline-none transition-colors duration-200 focus:border-[color:var(--av-vivo)] placeholder:text-ink-faint"
              />

              <div className="flex shrink-0 items-center gap-1">
                <IconBtn
                  label={`Subir la foto ${i + 2}`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                </IconBtn>
                <IconBtn
                  label={`Bajar la foto ${i + 2}`}
                  disabled={i === slots.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                </IconBtn>
                <IconBtn label={`Quitar la foto ${i + 2}`} onClick={() => remove(slot.key)} danger>
                  <Trash2 className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 flex flex-wrap gap-2">
        <AdminButton
          type="button"
          variant="ghost"
          onClick={() => setSlots((p) => [...p, { key: nextKey(), url: "" }])}
        >
          <Plus className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          Agregar por URL
        </AdminButton>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/webp,image/jpeg,image/png,image/avif"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void handleFiles(files);
            // Se limpia para poder volver a elegir los mismos archivos.
            e.target.value = "";
          }}
        />

        <AdminButton
          type="button"
          variant="ghost"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          {uploading ? "Subiendo…" : "Subir fotos"}
        </AdminButton>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "grid size-8 place-items-center rounded-lg border border-[color:var(--av-border)]",
        "text-ink-muted transition-colors duration-200",
        "disabled:pointer-events-none disabled:opacity-35",
        danger
          ? "hover:border-[#E2725B] hover:text-[#E2725B]"
          : "hover:border-[color:var(--av-vivo)] hover:text-vivo",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
