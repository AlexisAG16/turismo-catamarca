"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

export default function CircuitosPage() {
  const router = useRouter();
  const [circuitos, setCircuitos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [circuitoEditando, setCircuitoEditando] = useState(null);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Consulta la sesion actual para mostrar creacion a usuarios logueados y gestion a administradores.
    async function verificarSesion() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await response.json();

        if (activo) {
          setEstaLogueado(response.ok);
          setEsAdmin(response.ok && data.usuario?.rol === "admin");
        }
      } catch {
        if (activo) {
          setEstaLogueado(false);
          setEsAdmin(false);
        }
      }
    }

    // Obtiene la lista completa de circuitos y maneja errores sin congelar la vista.
    async function cargarCircuitos() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch("/api/circuitos");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensaje || "No se pudieron cargar los circuitos.");
        }

        if (activo) {
          setCircuitos(Array.isArray(data.circuitos) ? data.circuitos : []);
        }
      } catch (err) {
        if (activo) {
          setError(err.message || "Ocurrio un error al cargar los circuitos.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    verificarSesion();
    cargarCircuitos();

    return () => {
      activo = false;
    };
  }, []);

  // Confirma y ejecuta el borrado seguro de un circuito desde la API protegida.
  async function borrarCircuito(id) {
    const confirmacion = await Swal.fire({
      title: "Confirmar eliminacion",
      text: "¿Estás seguro de que deseas eliminar este registro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    setToast({ mensaje: "Eliminando circuito en la base de datos...", tipo: "loading" });
    const response = await fetch(`/api/circuitos/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo borrar el circuito.", tipo: "error" });
      return;
    }
    setCircuitos((valores) => valores.filter((circuito) => circuito._id !== id));
    setToast({ mensaje: "Circuito eliminado correctamente.", tipo: "success" });
    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Registro eliminado",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    });
    router.push("/circuitos");
    router.refresh();
  }

  async function guardarCircuito(event) {
    event.preventDefault();
    setToast({ mensaje: "Actualizando circuito en la base de datos...", tipo: "loading" });
    const response = await fetch(`/api/circuitos/${circuitoEditando._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(circuitoEditando),
    });
    const data = await response.json();
    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo actualizar el circuito.", tipo: "error" });
      return;
    }
    setCircuitos((valores) =>
      valores.map((circuito) => (circuito._id === data.circuito._id ? data.circuito : circuito))
    );
    setCircuitoEditando(null);
    setToast({ mensaje: "Circuito actualizado correctamente.", tipo: "success" });
    router.push("/circuitos");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast({ mensaje: "", tipo: "success" })} />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Planificacion regional
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Circuitos de Catamarca
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Recorre regiones como la Ruta del Adobe, la Puna y los Valles con informacion organizada para planificar tu viaje.
          </p>
          {estaLogueado && (
            <Link
              href="/admin/cargar-circuito"
              className="mb-6 mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700"
            >
              ➕ Crear Nuevo Circuito
            </Link>
          )}
          {!estaLogueado && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">
                Solo los usuarios registrados pueden crear circuitos.
              </p>
              <p className="mt-1 text-emerald-800">
                Podes explorar la informacion libremente. Para proponer un circuito,
                inicia sesion o crea una cuenta.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href="/register"
                  className="rounded-md border border-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </header>

        <section className="mt-8">
          {cargando && (
            <LoadingState
              titulo="Cargando circuitos"
              mensaje="Estamos recuperando los circuitos regionales de Catamarca."
            />
          )}

          {!cargando && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && circuitos.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold">No hay circuitos cargados</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Las regiones disponibles apareceran aca cuando se registren en la plataforma.
              </p>
            </div>
          )}

          {!cargando && !error && circuitos.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {circuitos.map((circuito) => (
                <article
                  key={circuito._id}
                  className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
                >
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                    {circuito.nombre}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">
                    {circuito.descripcion || "Region turistica de Catamarca con atractivos para descubrir y combinar en tu recorrido."}
                  </p>
                  {esAdmin && (
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCircuitoEditando(circuito)}
                        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => borrarCircuito(circuito._id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {circuitoEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <form onSubmit={guardarCircuito} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Editar circuito</h2>
              <input
                value={circuitoEditando.nombre}
                onChange={(event) => setCircuitoEditando((valor) => ({ ...valor, nombre: event.target.value }))}
                className="mt-5 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
              <textarea
                value={circuitoEditando.descripcion}
                onChange={(event) => setCircuitoEditando((valor) => ({ ...valor, descripcion: event.target.value }))}
                className="mt-3 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setCircuitoEditando(null)} className="rounded-md border px-4 py-2 text-sm">
                  Cancelar
                </button>
                <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
