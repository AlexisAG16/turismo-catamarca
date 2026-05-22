"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { TOAST_EVENT, TOAST_STORAGE_KEY } from "@/components/toastBus";

export default function ToastProvider() {
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    function mostrarToast(event) {
      const detalle = event.detail || {};
      if (!detalle.mensaje) return;

      setToast({ mensaje: detalle.mensaje, tipo: detalle.tipo || "success" });
      window.localStorage.removeItem(TOAST_STORAGE_KEY);
    }

    function mostrarPendiente() {
      const pendiente = window.localStorage.getItem(TOAST_STORAGE_KEY);
      if (!pendiente) return;

      try {
        const detalle = JSON.parse(pendiente);
        if (detalle?.mensaje) {
          setToast({ mensaje: detalle.mensaje, tipo: detalle.tipo || "success" });
        }
      } catch {
        setToast({ mensaje: "", tipo: "success" });
      } finally {
        window.localStorage.removeItem(TOAST_STORAGE_KEY);
      }
    }

    mostrarPendiente();
    window.addEventListener(TOAST_EVENT, mostrarToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, mostrarToast);
    };
  }, []);

  return (
    <Toast
      mensaje={toast.mensaje}
      tipo={toast.tipo}
      onClose={() => setToast({ mensaje: "", tipo: "success" })}
    />
  );
}
