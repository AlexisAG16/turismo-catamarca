"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Toast from "@/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
  });
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
    setToast({ mensaje: "Creando cuenta y conectando con la base de datos...", tipo: "loading" });

    try {
      const respuesta = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
      const data = await respuesta.json();

      if (!respuesta.ok) {
        setErrores(data.errores || {});
        setMensaje(data.mensaje || "No se pudo completar el registro.");
        setToast({ mensaje: data.mensaje || "No se pudo completar el registro.", tipo: "error" });
        return;
      }

      setToast({ mensaje: "Cuenta creada correctamente.", tipo: "success" });
      router.push("/login");
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crear cuenta</h1>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-5">
          {[
            ["nombre", "Nombre", "text"],
            ["correo", "Correo", "email"],
            ["contrasena", "Contrasena", "password"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-zinc-800">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={formulario[name]}
                onChange={manejarCambio}
                className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              />
              {errores[name] && <p className="mt-2 text-sm text-red-600">{errores[name]}</p>}
            </div>
          ))}

          {mensaje && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mensaje}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargando ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Inicia sesion
          </Link>
        </p>
      </section>
    </main>
  );
}
