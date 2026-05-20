"use client";

import Navbar from "@/components/Navbar";

const faqs = [
  {
    pregunta: "Como exploro la plataforma?",
    respuesta: "Desde Inicio podes ver atractivos destacados. Tambien podes entrar a Circuitos y Actividades para planificar por region, temporada y tipo de experiencia.",
  },
  {
    pregunta: "Como guardo mi itinerario?",
    respuesta: "En la tarjeta de un atractivo, presiona la estrella. El Navbar lo mostrara en Mi Itinerario para que puedas revisar tu seleccion.",
  },
  {
    pregunta: "A quienes esta dirigida?",
    respuesta: "Esta dirigida a turistas que planifican su viaje, residentes que buscan propuestas cercanas, prestadores turisticos y equipos de administracion provincial o municipal.",
  },
  {
    pregunta: "Quien puede cargar o actualizar informacion?",
    respuesta: "Solo usuarios con rol administrador pueden crear, editar o eliminar atractivos, circuitos y actividades para mantener datos confiables.",
  },
  {
    pregunta: "Que hago si falta informacion de un lugar?",
    respuesta: "Podes usar la pagina de Contacto para enviar sugerencias, datos de ubicacion, temporadas recomendadas o actividades vinculadas.",
  },
];

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Soporte
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Preguntas frecuentes</h1>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            Una guia rapida para visitantes, prestadores y administradores que usan Turismo Catamarca para organizar informacion y planificar recorridos.
          </p>
        </section>

        <section className="space-y-4">
          {faqs.map((faq) => (
            <article key={faq.pregunta} className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold">{faq.pregunta}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{faq.respuesta}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
