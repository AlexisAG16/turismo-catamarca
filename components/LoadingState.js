"use client";

export default function LoadingState({
  titulo = "Cargando informacion",
  mensaje = "Estamos preparando los datos. Un momento, por favor.",
  compacto = false,
}) {
  return (
    <div className={`flex w-full flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-center shadow-sm ${compacto ? "p-6" : "min-h-64 p-8"}`}>
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-600" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-950">{titulo}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">{mensaje}</p>
    </div>
  );
}
