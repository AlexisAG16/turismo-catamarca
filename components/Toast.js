"use client";

import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "success", onClose }) {
  useEffect(() => {
    if (!mensaje) return;

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const estilos =
    tipo === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";
  const icono = tipo === "error" ? "!" : "✓";

  return (
    <div className={`fixed right-5 top-5 z-[80] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${estilos}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">
        {icono}
      </span>
      <p className="text-sm font-medium leading-6">{mensaje}</p>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto text-sm font-bold opacity-70 hover:opacity-100"
        aria-label="Cerrar notificacion"
      >
        x
      </button>
    </div>
  );
}
