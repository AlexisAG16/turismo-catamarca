"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardAtractivo from "@/components/CardAtractivo";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

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
          setItinerario(Array.isArray(data.itinerario) ? data.itinerario : []);
          localStorage.setItem("itinerario", JSON.stringify(data.itinerario || []));
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
                Todavía no armaste tu itinerario. ¡Explorá Catamarca y agregá tus lugares favoritos!
              </h2>
            </div>
          )}

          {!cargando && !error && itinerario.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {itinerario.map((atractivo) => (
                <CardAtractivo
                  key={atractivo._id}
                  atractivo={atractivo}
                  onToggleItinerario={(nuevoItinerario) =>
                    setItinerario(nuevoItinerario)
                  }
                  onToast={(mensaje, tipo) => setToast({ mensaje, tipo })}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
