"use client";

import { useState } from "react";

const estadoInicial = {
  nombre: "",
  descripcion: "",
};

export default function FormCircuito({ onCircuitoCreado }) {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function manejarCambio(event) {
    const { name, value } = event.target;
    setFormulario((valores) => ({ ...valores, [name]: value }));
  }

  async function manejarEnvio(event) {
    event.preventDefault();
    setEnviando(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch("/api/circuitos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo crear el circuito.");
      }

      setFormulario(estadoInicial);
      setMensaje(data.mensaje || "Circuito creado correctamente.");
      onCircuitoCreado?.(data.circuito);
    } catch (err) {
      setError(err.message || "Ocurrio un error al guardar el circuito.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-zinc-950">Cargar Circuito</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Define una region turistica para ordenar atractivos y facilitar la planificacion del recorrido.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Nombre del circuito
        <input
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Ruta del Adobe"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Descripcion
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={manejarCambio}
          className="min-h-32 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Describe la region, sus principales atractivos y recomendaciones de recorrido."
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Guardando..." : "Guardar circuito"}
        </button>
        {mensaje && <p className="text-sm font-medium text-emerald-700">{mensaje}</p>}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
    </form>
  );
}
