"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

const ITINERARIO_KEY = "itinerario";

function obtenerYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/live/")) {
        const videoId = parsedUrl.pathname.replace("/live/", "");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  } catch {
    return "";
  }
}

function obtenerGoogleMapsEmbedUrl(url, nombre, departamento) {
  if (!url || typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.pathname.includes("/maps/embed")) {
      return url;
    }

    const coordenadasArroba = parsedUrl.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const coordenadasPlace = parsedUrl.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const coordenadas = coordenadasArroba || coordenadasPlace;

    if (coordenadas) {
      return `https://maps.google.com/maps?q=${coordenadas[1]},${coordenadas[2]}&z=14&output=embed`;
    }
  } catch {
    return "";
  }

  const busqueda = encodeURIComponent(
    `${nombre || "Atractivo turistico"} ${departamento || ""} Catamarca`
  );

  return `https://maps.google.com/maps?q=${busqueda}&z=14&output=embed`;
}

export default function DetalleAtractivoPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const volverA = searchParams.get("volver") || "/atractivos";
  const [atractivo, setAtractivo] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });
  const youtubeEmbedUrl = useMemo(
    () => obtenerYouTubeEmbedUrl(atractivo?.youtubeUrl),
    [atractivo?.youtubeUrl]
  );
  const googleMapsEmbedUrl = useMemo(
    () =>
      obtenerGoogleMapsEmbedUrl(
        atractivo?.googleMapsUrl,
        atractivo?.nombre,
        atractivo?.departamento
      ),
    [atractivo?.googleMapsUrl, atractivo?.nombre, atractivo?.departamento]
  );

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError("");

        const [atractivoResponse, actividadesResponse, sessionResponse] =
          await Promise.all([
            fetch(`/api/atractivos/${id}`, { cache: "no-store" }),
            fetch(`/api/actividades?atractivoId=${id}`, { cache: "no-store" }),
            fetch("/api/auth/session", { cache: "no-store" }).catch(() => null),
          ]);

        const atractivoData = await atractivoResponse.json();
        const actividadesData = await actividadesResponse.json();

        if (!atractivoResponse.ok) {
          throw new Error(atractivoData.error || "No se pudo cargar el atractivo.");
        }

        if (!actividadesResponse.ok) {
          throw new Error(actividadesData.error || "No se pudieron cargar las actividades.");
        }

        if (activo) {
          setAtractivo(atractivoData.atractivo);
          setActividades(
            Array.isArray(actividadesData.actividades)
              ? actividadesData.actividades
              : []
          );
        }

        if (sessionResponse?.ok) {
          const sessionData = await sessionResponse.json();
          if (activo) setUsuario(sessionData.usuario);
        }
      } catch (err) {
        if (activo) {
          setError(err.message || "No se pudo cargar el detalle.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (id) cargarDetalle();

    return () => {
      activo = false;
    };
  }, [id]);

  async function agregarItinerario() {
    try {
      const response = await fetch("/api/itinerario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atractivoId: id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo agregar al itinerario.");
      }

      localStorage.setItem(ITINERARIO_KEY, JSON.stringify(data.itinerario || []));
      window.dispatchEvent(new Event("itinerario-actualizado"));
      setToast({ mensaje: "Atractivo agregado al itinerario.", tipo: "success" });
    } catch (err) {
      setToast({
        mensaje: err.message || "No se pudo agregar al itinerario.",
        tipo: "error",
      });
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-5 py-10">
          <LoadingState
            titulo="Cargando detalle del atractivo"
            mensaje="Estamos preparando la informacion completa, multimedia y actividades asociadas."
          />
        </main>
      </div>
    );
  }

  if (error || !atractivo) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Atractivo no encontrado."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onClose={() => setToast({ mensaje: "", tipo: "success" })}
      />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <Link
          href={volverA}
          className="mb-5 inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100"
        >
          Volver a la lista
        </Link>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative min-h-[360px]">
            <Image
              src={atractivo.imagen?.url || "https://placehold.co/1400x700?text=Catamarca"}
              alt={atractivo.nombre}
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-10">
              <span className="inline-flex rounded-md bg-white/95 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                {atractivo.departamento}
              </span>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                {atractivo.nombre}
              </h1>
              {usuario?.rol === "usuario" && (
                <button
                  type="button"
                  onClick={agregarItinerario}
                  className="mt-5 rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                >
                  + Agregar a mi Itinerario
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-semibold">Descripcion</h2>
              <p className="mt-3 leading-7 text-zinc-600">
                {atractivo.descripcion}
              </p>
              <div className="mt-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Actividades disponibles
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {actividades.length > 0
                    ? actividades.map((actividad) => actividad.nombre).join(", ")
                    : "Todavia no hay actividades asociadas a este atractivo."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {atractivo.googleMapsUrl && googleMapsEmbedUrl && (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm">
                  <div className="border-b border-zinc-200 bg-white px-4 py-3">
                    <h2 className="text-base font-semibold text-zinc-950">
                      Ubicacion
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Mapa interactivo del atractivo.
                    </p>
                  </div>
                  <iframe
                    src={googleMapsEmbedUrl}
                    title={`Ubicacion de ${atractivo.nombre}`}
                    className="aspect-video w-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="bg-white px-4 py-3">
                    <a
                      href={atractivo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>
              )}

              {youtubeEmbedUrl && (
                <div className="overflow-hidden rounded-lg bg-zinc-950">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`Video de ${atractivo.nombre}`}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Actividades asociadas
          </h2>
          {actividades.length === 0 ? (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Todavia no hay actividades cargadas para este atractivo.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {actividades.map((actividad) => (
                <article
                  key={actividad._id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{actividad.nombre}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {actividad.descripcion}
                      </p>
                    </div>
                    {actividad.duracionEstimada && (
                      <p className="w-fit rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {actividad.duracionEstimada}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
