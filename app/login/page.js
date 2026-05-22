"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { emitirToast } from "@/components/toastBus";

function ContenidoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aviso = searchParams.get("aviso");
  const [formulario, setFormulario] = useState({ correo: "", contrasena: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });
  const [cargando, setCargando] = useState(false);

  function manejarCambio(event) {
    const { name, value } = event.target;
    setFormulario((valores) => ({ ...valores, [name]: value }));
  }

  async function manejarEnvio(event) {
    event.preventDefault();
    setCargando(true);
    setErrores({});
    setMensaje("");
    setToast({ mensaje: "Validando credenciales...", tipo: "loading" });

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
      const data = await respuesta.json();

      if (!respuesta.ok) {
        setErrores(data.errores || {});
        setMensaje(data.mensaje || "No se pudo iniciar sesion.");
        setToast({ mensaje: data.mensaje || "No se pudo iniciar sesion.", tipo: "error" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
      emitirToast("Sesion iniciada correctamente.", "success");
      router.push("/");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      setToast({ mensaje: "No se pudo conectar con el servidor.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 text-zinc-950">
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast({ mensaje: "", tipo: "success" })} />
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Turismo Catamarca
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesion</h1>
        </div>

        {aviso === "itinerario" && (
          <p className="mb-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Inicia sesion para agregar atractivos a tu itinerario.
          </p>
        )}

        <form onSubmit={manejarEnvio} className="space-y-5">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-zinc-800">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
              className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            {errores.correo && <p className="mt-2 text-sm text-red-600">{errores.correo}</p>}
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-zinc-800">
              Contrasena
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={formulario.contrasena}
              onChange={manejarCambio}
              className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            {errores.contrasena && <p className="mt-2 text-sm text-red-600">{errores.contrasena}</p>}
          </div>

          {mensaje && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mensaje}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargando ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
            Registrate
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">Cargando...</div>}>
      <ContenidoLogin />
    </Suspense>
  );
}
