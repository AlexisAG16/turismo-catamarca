"use client";

export const TOAST_EVENT = "turismo-toast";
export const TOAST_STORAGE_KEY = "turismo-toast-pendiente";

export function emitirToast(mensaje, tipo = "success") {
  if (typeof window === "undefined" || !mensaje) return;

  const detalle = { mensaje, tipo, id: Date.now() };
  window.localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(detalle));
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: detalle }));
}
