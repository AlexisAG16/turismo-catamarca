"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

function formatearCosto(costo) {
  if (costo === undefined || costo === null || costo === "") {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(costo));
}

export default function ActividadesPage() {
  const router = useRouter();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [atractivos, setAtractivos] = useState([]);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Verifica si la sesion es administradora y carga atractivos para edicion si corresponde.
    async function verificarAdmin() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await response.json();

        if (activo) {
          setEsAdmin(response.ok && data.usuario?.rol === "admin");
        }
        if (response.ok && data.usuario?.rol === "admin") {
          const atractivosResponse = await fetch("/api/atractivos", { cache: "no-store" });
          const atractivosData = await atractivosResponse.json();
          if (activo && atractivosResponse.ok) {
            setAtractivos(Array.isArray(atractivosData.atractivos) ? atractivosData.atractivos : []);
          }
        }
      } catch {
        if (activo) {
          setEsAdmin(false);
        }
      }
    }

    // Obtiene las actividades disponibles y guarda errores controlados en pantalla.
    async function cargarActividades() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch("/api/actividades");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensaje || "No se pudieron cargar las actividades.");
        }

        if (activo) {
          setActividades(Array.isArray(data.actividades) ? data.actividades : []);
        }
      } catch (err) {
        if (activo) {
          setError(err.message || "Ocurrio un error al cargar las actividades.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    verificarAdmin();
    cargarActividades();

    return () => {
      activo = false;
    };
  }, []);

  // Confirma y ejecuta el borrado seguro de una actividad desde la API protegida.
  async function borrarActividad(id) {
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

    setToast({ mensaje: "Eliminando actividad en la base de datos...", tipo: "loading" });
    const response = await fetch(`/api/actividades/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo borrar la actividad.", tipo: "error" });
      return;
    }
    setActividades((valores) => valores.filter((actividad) => actividad._id !== id));
    setToast({ mensaje: "Actividad eliminada correctamente.", tipo: "success" });
    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Registro eliminado",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    });
    router.push("/actividades");
    router.refresh();
  }

  async function guardarActividad(event) {
    event.preventDefault();
    setToast({ mensaje: "Actualizando actividad en la base de datos...", tipo: "loading" });
    const response = await fetch(`/api/actividades/${actividadEditando._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actividadEditando),
    });
    const data = await response.json();
    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo actualizar la actividad.", tipo: "error" });
      return;
    }
    setActividades((valores) =>
      valores.map((actividad) => (actividad._id === data.actividad._id ? data.actividad : actividad))
    );
    setActividadEditando(null);
    setToast({ mensaje: "Actividad actualizada correctamente.", tipo: "success" });
    router.push("/actividades");
    router.refresh();
  }

  function abrirEdicionActividad(actividad) {
    setActividadEditando({
      ...actividad,
      atractivoId: actividad.atractivo?._id || actividad.atractivo || "",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast({ mensaje: "", tipo: "success" })} />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Experiencias disponibles
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Actividades y Excursiones
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Consulta opciones para completar tu viaje con duracion estimada, costo aproximado y atractivo vinculado.
          </p>
          {esAdmin && (
            <Link
              href="/admin/cargar-actividad"
              className="mb-6 mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700"
            >
              ➕ Cargar Nueva Actividad
            </Link>
          )}
        </header>

        <section className="mt-8">
          {cargando && (
            <LoadingState
              titulo="Cargando actividades"
              mensaje="Estamos consultando las excursiones y experiencias disponibles."
            />
          )}

          {!cargando && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && actividades.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold">No hay actividades cargadas</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Las excursiones disponibles apareceran aca cuando sean registradas.
              </p>
            </div>
          )}

          {!cargando && !error && actividades.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {actividades.map((actividad) => (
                <article
                  key={actividad._id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                        {actividad.nombre}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {actividad.atractivo?.nombre || "Atractivo a confirmar"}
                      </p>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                        {actividad.descripcion || "Sin descripcion cargada."}
                      </p>
                    </div>
                    <span className="w-fit rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      {formatearCosto(actividad.costoAproximado)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Duracion estimada
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-950">
                        {actividad.duracionEstimada || "A confirmar"}
                      </p>
                    </div>
                    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Costo aproximado
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-950">
                        {formatearCosto(actividad.costoAproximado)}
                      </p>
                    </div>
                  </div>
                  {esAdmin && (
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicionActividad(actividad)}
                        className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => borrarActividad(actividad._id)}
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

        {actividadEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <form onSubmit={guardarActividad} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Editar actividad</h2>
              <label className="mt-5 block text-sm font-medium text-zinc-800">
                Nombre
                <input
                  value={actividadEditando.nombre || ""}
                  onChange={(event) => setActividadEditando((valor) => ({ ...valor, nombre: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-zinc-800">
                Descripcion
                <textarea
                  value={actividadEditando.descripcion || ""}
                  onChange={(event) => setActividadEditando((valor) => ({ ...valor, descripcion: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-zinc-800">
                Atractivo asociado
                <select
                  value={actividadEditando.atractivoId}
                  onChange={(event) => setActividadEditando((valor) => ({ ...valor, atractivoId: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="">Seleccionar atractivo</option>
                  {atractivos.map((atractivo) => (
                    <option key={atractivo._id} value={atractivo._id}>{atractivo.nombre}</option>
                  ))}
                </select>
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setActividadEditando(null)} className="rounded-md border px-4 py-2 text-sm">
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
