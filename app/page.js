"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [circuitos, setCircuitos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    // Carga los circuitos destacados desde la API para mostrarlos en la landing.
    async function cargarCircuitosDestacados() {
      try {
        const response = await fetch("/api/circuitos", { cache: "no-store" });
        const data = await response.json();

        if (activo && response.ok) {
          setCircuitos(Array.isArray(data.circuitos) ? data.circuitos.slice(0, 3) : []);
        }
      } catch {
        if (activo) setCircuitos([]);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarCircuitosDestacados();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />

      <main>
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
          <Image
            src="/images/banner-catamarca.jpg"
            alt="Paisaje de Catamarca"
            fill
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-5 py-16">
            <div className="max-w-3xl text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                Turismo Catamarca
              </p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Descubrí la magia de Catamarca
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100">
                Explorá paisajes únicos, circuitos regionales y atractivos imperdibles para armar tu próximo recorrido por la provincia.
              </p>
              <Link
                href="/atractivos"
                className="mt-8 inline-flex rounded-md bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Empezar a Explorar
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-12">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Recorridos sugeridos
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Circuitos Destacados
              </h2>
            </div>
            <Link href="/circuitos" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Ver todos
            </Link>
          </div>

          {cargando ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          ) : circuitos.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Todavía no hay circuitos cargados.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {circuitos.map((circuito) => (
                <article
                  key={circuito._id}
                  className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-zinc-950">
                    {circuito.nombre}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {circuito.descripcion}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
