"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingState from "@/components/LoadingState";

const IMAGEN_FALLBACK = "https://placehold.co/1400x700?text=Catamarca";

function obtenerGoogleMapsEmbedUrl(url, nombre, departamento) {
  if (!url || typeof url !== "string") {
    const busqueda = encodeURIComponent(`${nombre || "Catamarca"} ${departamento || ""}`);
    return `https://maps.google.com/maps?q=${busqueda}&z=11&output=embed`;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname.includes("/maps/embed")) return url;

    const coordenadasArroba = parsedUrl.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const coordenadasPlace = parsedUrl.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const coordenadas = coordenadasArroba || coordenadasPlace;

    if (coordenadas) {
      return `https://maps.google.com/maps?q=${coordenadas[1]},${coordenadas[2]}&z=13&output=embed`;
    }
  } catch {
    return "";
  }

  const busqueda = encodeURIComponent(`${nombre || "Atractivo turístico"} ${departamento || ""} Catamarca`);
  return `https://maps.google.com/maps?q=${busqueda}&z=13&output=embed`;
}

export default function DetalleCircuitoPage() {
  const { id } = useParams();
  const [circuito, setCircuito] = useState(null);
  const [imagenFallidaUrl, setImagenFallidaUrl] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarCircuito() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(`/api/circuitos/${id}`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudo cargar el circuito.");
        }

        if (activo) setCircuito(data.circuito);
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar el circuito.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargarCircuito();

    return () => {
      activo = false;
    };
  }, [id]);

  const atractivos = useMemo(
    () => (Array.isArray(circuito?.atractivos) ? circuito.atractivos : []),
    [circuito]
  );
  const actividades = useMemo(
    () =>
      atractivos.flatMap((atractivo) =>
        Array.isArray(atractivo.actividades)
          ? atractivo.actividades.map((actividad) => ({
              ...actividad,
              atractivoNombre: atractivo.nombre,
            }))
          : []
      ),
    [atractivos]
  );
  const atractivoPrincipal = atractivos[0];

  if (cargando) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-5 py-10">
          <LoadingState
            titulo="Cargando circuito"
            mensaje="Estamos preparando los atractivos y actividades del recorrido."
          />
        </main>
      </div>
    );
  }

  if (error || !circuito) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 py-10">
          <Link href="/circuitos" className="text-sm font-semibold text-emerald-700">
            Volver a circuitos
          </Link>
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Circuito no encontrado."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <Link href="/circuitos" className="text-sm font-semibold text-emerald-700">
          Volver a circuitos
        </Link>

        <section className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative min-h-[340px] bg-zinc-900">
            <Image
              src={
                imagenFallidaUrl === atractivoPrincipal?.imagen?.url
                  ? IMAGEN_FALLBACK
                  : atractivoPrincipal?.imagen?.url || IMAGEN_FALLBACK
              }
              alt={circuito.nombre}
              fill
              priority
              unoptimized
              onError={() => setImagenFallidaUrl(atractivoPrincipal?.imagen?.url || "")}
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                Circuito turístico
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                {circuito.nombre}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-100">
                {circuito.descripcion}
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-b border-zinc-200 p-6 md:grid-cols-3 md:p-8">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Atractivos
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{atractivos.length}</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Actividades sugeridas
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">{actividades.length}</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Departamentos
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                {Array.from(new Set(atractivos.map((atractivo) => atractivo.departamento))).join(", ") || "Catamarca"}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-semibold">Atractivos del recorrido</h2>
              <div className="mt-5 space-y-4">
                {atractivos.length === 0 ? (
                  <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
                    Todavía no hay atractivos asociados a este circuito.
                  </p>
                ) : (
                  atractivos.map((atractivo, index) => (
                    <article key={atractivo._id} className="rounded-lg border border-zinc-200 p-4">
                      <div className="flex gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/atractivos/${atractivo._id}`}
                            className="text-lg font-semibold text-zinc-950 transition hover:text-emerald-700"
                          >
                            {atractivo.nombre}
                          </Link>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            {atractivo.departamento}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {atractivo.descripcion}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-4 py-3">
                  <h2 className="text-base font-semibold">Mapa orientativo</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Ubicación del primer atractivo del circuito.
                  </p>
                </div>
                <iframe
                  src={obtenerGoogleMapsEmbedUrl(
                    atractivoPrincipal?.googleMapsUrl,
                    atractivoPrincipal?.nombre || circuito.nombre,
                    atractivoPrincipal?.departamento
                  )}
                  title={`Mapa de ${circuito.nombre}`}
                  className="aspect-video w-full"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="text-base font-semibold">Actividades asociadas</h2>
                {actividades.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-600">
                    Todavía no hay actividades asociadas.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {actividades.map((actividad) => (
                      <li key={actividad._id} className="rounded-md bg-zinc-50 p-3">
                        <p className="text-sm font-semibold text-zinc-950">
                          {actividad.nombre}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {actividad.atractivoNombre}
                        </p>
                        {actividad.duracionEstimada && (
                          <p className="mt-2 text-xs font-medium text-emerald-700">
                            {actividad.duracionEstimada}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
