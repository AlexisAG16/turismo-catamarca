"use client";

import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "success", onClose }) {
  useEffect(() => {
    if (!mensaje || tipo === "loading") return;

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [mensaje, tipo, onClose]);

  if (!mensaje) return null;

  const estilosPorTipo = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    loading: "border-amber-200 bg-amber-50 text-amber-900",
  };
  const iconosPorTipo = {
    success: "OK",
    error: "!",
    info: "i",
    loading: "...",
  };
  const estilos = estilosPorTipo[tipo] || estilosPorTipo.success;
  const icono = iconosPorTipo[tipo] || iconosPorTipo.success;

  return (
    <div className={`fixed right-5 top-5 z-[80] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${estilos}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm ${tipo === "loading" ? "animate-pulse" : ""}`}>
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
