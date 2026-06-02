"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CardAtractivo from "@/components/CardAtractivo";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

const ITINERARIO_KEY = "itinerario";

export default function ItinerarioPage() {
  const router = useRouter();
  const [itinerario, setItinerario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    async function cargarItinerario() {
      try {
        setCargando(true);
        setError("");

        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || sessionData.usuario?.rol !== "usuario") {
          router.push("/login?aviso=itinerario");
          return;
        }

        const response = await fetch("/api/itinerario", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensaje || "No se pudo cargar tu itinerario.");
        }

        if (activo) {
          sincronizarItinerario(data.itinerario);
        }
      } catch (err) {
        if (activo) {
          setError(err.message || "No se pudo cargar tu itinerario.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarItinerario();

    return () => {
      activo = false;
    };
  }, [router]);

  function sincronizarItinerario(nuevoItinerario) {
    const valores = Array.isArray(nuevoItinerario) ? nuevoItinerario : [];
    setItinerario(valores);
    localStorage.setItem(ITINERARIO_KEY, JSON.stringify(valores));
    window.dispatchEvent(new Event("itinerario-actualizado"));
  }

  async function quitarAtractivo(id) {
    try {
      const response = await fetch(
        `/api/itinerario?atractivoId=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo quitar el atractivo.");
      }

      sincronizarItinerario(data.itinerario);
      setToast({ mensaje: "Atractivo quitado del itinerario.", tipo: "success" });
    } catch (err) {
      setToast({
        mensaje: err.message || "No se pudo actualizar el itinerario.",
        tipo: "error",
      });
    }
  }

  async function vaciarItinerario() {
    try {
      const response = await fetch("/api/itinerario", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo vaciar el itinerario.");
      }

      sincronizarItinerario(data.itinerario);
      setToast({ mensaje: "Itinerario vaciado correctamente.", tipo: "success" });
    } catch (err) {
      setToast({
        mensaje: err.message || "No se pudo actualizar el itinerario.",
        tipo: "error",
      });
    }
  }

  const departamentos = Array.from(
    new Set(itinerario.map((atractivo) => atractivo.departamento).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onClose={() => setToast({ mensaje: "", tipo: "success" })}
      />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Mi plan de viaje
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Mi Itinerario
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Tus atractivos guardados para organizar un recorrido por Catamarca.
          </p>
        </header>

        <section className="mt-8">
          {cargando && (
            <LoadingState
              titulo="Cargando tu itinerario"
              mensaje="Estamos recuperando los atractivos que guardaste para tu viaje."
            />
          )}

          {!cargando && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && itinerario.length === 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">
                Todavía no armaste tu itinerario. Explorá Catamarca y agregá tus lugares favoritos.
              </h2>
              <Link
                href="/atractivos"
                className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Explorar atractivos
              </Link>
            </div>
          )}

          {!cargando && !error && itinerario.length > 0 && (
            <>
              <div className="mb-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Atractivos
                    </p>
                    <p className="mt-1 text-2xl font-bold text-zinc-950">
                      {itinerario.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Departamentos
                    </p>
                    <p className="mt-1 text-2xl font-bold text-zinc-950">
                      {departamentos.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Zonas
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                      {departamentos.join(", ") || "Catamarca"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    Imprimir
                  </button>
                  <Link
                    href="/atractivos"
                    className="rounded-md border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                  >
                    Agregar más
                  </Link>
                  <button
                    type="button"
                    onClick={vaciarItinerario}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Vaciar
                  </button>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {itinerario.map((atractivo) => (
                  <div key={atractivo._id} className="flex flex-col gap-2">
                    <CardAtractivo
                      atractivo={atractivo}
                      detalleHref={`/atractivos/${atractivo._id}?volver=${encodeURIComponent("/itinerario")}`}
                      onToggleItinerario={sincronizarItinerario}
                      onToast={(mensaje, tipo) => setToast({ mensaje, tipo })}
                    />
                    <button
                      type="button"
                      onClick={() => quitarAtractivo(atractivo._id)}
                      className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Quitar del itinerario
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
