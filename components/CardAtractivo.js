"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const ITINERARIO_KEY = "itinerario";

function leerItinerarioSerializado() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(ITINERARIO_KEY) || "[]";
}

function leerItinerario() {
  try {
    return JSON.parse(leerItinerarioSerializado());
  } catch {
    return [];
  }
}

function leerUsuarioLocal() {
  if (typeof window === "undefined") return null;

  try {
    const guardado = window.localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function suscribirItinerario(callback) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("itinerario-actualizado", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("itinerario-actualizado", callback);
    window.removeEventListener("storage", callback);
  };
}

function obtenerYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  } catch {
    return "";
  }
}

export default function CardAtractivo({
  atractivo,
  onToggleItinerario,
  onToast,
}) {
  const [modalActivo, setModalActivo] = useState(null);
  const [guardandoItinerario, setGuardandoItinerario] = useState(false);
  const [usuario, setUsuario] = useState(() => leerUsuarioLocal());
  const itinerarioSerializado = useSyncExternalStore(
    suscribirItinerario,
    leerItinerarioSerializado,
    () => "[]"
  );

  useEffect(() => {
    function sincronizarUsuario() {
      setUsuario(leerUsuarioLocal());
    }

    window.addEventListener("focus", sincronizarUsuario);
    window.addEventListener("storage", sincronizarUsuario);
    window.addEventListener("itinerario-actualizado", sincronizarUsuario);

    return () => {
      window.removeEventListener("focus", sincronizarUsuario);
      window.removeEventListener("storage", sincronizarUsuario);
      window.removeEventListener("itinerario-actualizado", sincronizarUsuario);
    };
  }, []);

  const {
    _id,
    nombre = "Atractivo turistico",
    departamento = "Catamarca",
    descripcion = "",
    imagen,
    youtubeUrl = "",
    googleMapsUrl = "",
  } = atractivo || {};

  const imagenUrl =
    imagen?.url || "https://placehold.co/900x600?text=Catamarca";
  const descripcionCorta =
    descripcion.length > 145 ? `${descripcion.slice(0, 142).trim()}...` : descripcion;
  const youtubeEmbedUrl = useMemo(
    () => obtenerYouTubeEmbedUrl(youtubeUrl),
    [youtubeUrl]
  );
  const itinerario = useMemo(() => {
    try {
      return JSON.parse(itinerarioSerializado);
    } catch {
      return [];
    }
  }, [itinerarioSerializado]);
  const estaEnItinerario = useMemo(
    () => itinerario.some((item) => String(item._id) === String(_id)),
    [itinerario, _id]
  );
  const puedeAbrirMapa = Boolean(googleMapsUrl);
  const puedeAbrirVideo = Boolean(youtubeEmbedUrl);
  const puedeGuardarItinerario = usuario?.rol === "usuario";

  async function alternarItinerario() {
    if (!_id || typeof window === "undefined") return;

    setGuardandoItinerario(true);

    try {
      const response = await fetch(
        estaEnItinerario
          ? `/api/itinerario?atractivoId=${encodeURIComponent(_id)}`
          : "/api/itinerario",
        {
          method: estaEnItinerario ? "DELETE" : "POST",
          headers: estaEnItinerario
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          body: estaEnItinerario
            ? undefined
            : JSON.stringify({ atractivoId: _id }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo actualizar el itinerario.");
      }

      const nuevoItinerario = Array.isArray(data.itinerario)
        ? data.itinerario
        : leerItinerario();

      window.localStorage.setItem(ITINERARIO_KEY, JSON.stringify(nuevoItinerario));
      window.dispatchEvent(new Event("itinerario-actualizado"));
      onToggleItinerario?.(nuevoItinerario);
      onToast?.(
        estaEnItinerario
          ? "Atractivo quitado del itinerario."
          : "Atractivo agregado al itinerario.",
        "success"
      );
    } catch (err) {
      onToast?.(err.message || "No se pudo actualizar tu itinerario.", "error");
    } finally {
      setGuardandoItinerario(false);
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/atractivos/${_id}`} className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
        <Image
          src={imagenUrl}
          alt={nombre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition hover:scale-105"
          loading="lazy"
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 shadow-sm">
          {departamento}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <Link href={`/atractivos/${_id}`} className="block text-xl font-bold leading-tight text-zinc-950 hover:text-emerald-700">
            {nombre}
          </Link>
          <p className="min-h-16 text-sm leading-6 text-zinc-600">
            {descripcionCorta || "Una experiencia destacada para sumar al recorrido por Catamarca."}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          {puedeGuardarItinerario && (
            <button
              type="button"
              onClick={alternarItinerario}
              disabled={guardandoItinerario}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                estaEnItinerario
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "border border-emerald-700 text-emerald-800 hover:bg-emerald-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
              aria-pressed={estaEnItinerario}
            >
              <span aria-hidden="true">{estaEnItinerario ? "*" : "+"}</span>
              {guardandoItinerario
                ? "Guardando..."
                : estaEnItinerario
                  ? "En mi itinerario"
                  : "Agregar a mi itinerario"}
            </button>
          )}

          {!usuario && (
            <Link
              href="/login?aviso=itinerario"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-emerald-700 px-4 py-2 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Inicia sesion para guardar
            </Link>
          )}

          <div className="grid flex-1 grid-cols-2 gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setModalActivo("mapa")}
              disabled={!puedeAbrirMapa}
              className="min-h-11 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setModalActivo("video")}
              disabled={!puedeAbrirVideo}
              className="min-h-11 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Video
            </button>
          </div>
        </div>
      </div>

      {modalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3">
          <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div>
                <h4 className="text-base font-bold text-zinc-950">{nombre}</h4>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {modalActivo === "mapa" ? "Ubicacion interactiva" : "Video de muestra"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 text-xl leading-none text-zinc-700 transition hover:bg-zinc-100"
                aria-label="Cerrar multimedia"
              >
                x
              </button>
            </div>

            <div className="aspect-video w-full bg-zinc-950">
              {modalActivo === "mapa" ? (
                <iframe
                  src={googleMapsUrl}
                  title={`Mapa de ${nombre}`}
                  className="h-full w-full"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <iframe
                  src={youtubeEmbedUrl}
                  title={`Video de ${nombre}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
