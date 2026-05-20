"use client";

import Navbar from "@/components/Navbar";

const equipo = ["Frontend", "Backend", "Base de datos", "Experiencia de usuario"];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-5 py-12">
        <section className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Nosotros
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight">
            Ordenamos la informacion turistica para que Catamarca sea mas facil de recorrer.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
            Turismo Catamarca esta pensada para viajeros, residentes, prestadores y equipos de gestion que necesitan centralizar atractivos, circuitos y actividades en una experiencia clara, segura y facil de mantener.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Mision</h2>
            <p className="mt-3 leading-7 text-zinc-600">
              Reducir la dispersion de informacion turistica y acercar datos utiles sobre departamentos, temporadas, mapas, videos y propuestas regionales.
            </p>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Vision</h2>
            <p className="mt-3 leading-7 text-zinc-600">
              Convertir la plataforma en una herramienta de planificacion inteligente donde cada persona pueda descubrir atractivos, guardar itinerarios y combinar experiencias segun su viaje.
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Viajeros</h2>
            <p className="mt-3 leading-7 text-zinc-600">
              Encuentran informacion organizada para decidir que visitar, cuando ir y como ubicar cada atractivo.
            </p>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Prestadores</h2>
            <p className="mt-3 leading-7 text-zinc-600">
              Cuentan con un canal ordenado para visibilizar actividades y mejorar la articulacion con los circuitos.
            </p>
          </article>
          <article className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Gestion turistica</h2>
            <p className="mt-3 leading-7 text-zinc-600">
              Administra contenido validado, mantiene datos consistentes y actualiza la oferta de la provincia.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Equipo</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {equipo.map((rol) => (
              <div key={rol} className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
                <p className="font-medium">{rol}</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Area clave para que Turismo Catamarca funcione de punta a punta.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
