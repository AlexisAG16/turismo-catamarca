"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import CardAtractivo from "@/components/CardAtractivo";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";
import { departamentosCatamarca } from "@/lib/departamentos";

const LIMITE_ATRACTIVOS = 6;

function AtractivosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paginaInicial = Math.max(1, Number(searchParams.get("page")) || 1);
  const [atractivos, setAtractivos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: LIMITE_ATRACTIVOS,
    totalRegistros: 0,
    totalPaginas: 1,
    tieneAnterior: false,
    tieneSiguiente: false,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [circuitos, setCircuitos] = useState([]);
  const [atractivoEditando, setAtractivoEditando] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState(
    searchParams.get("nombre") || ""
  );
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(
    searchParams.get("departamento") || ""
  );
  const [circuitoSeleccionado, setCircuitoSeleccionado] = useState(
    searchParams.get("circuito") || ""
  );
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Consulta la sesion actual para habilitar controles administrativos cuando corresponde.
    async function verificarAdmin() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await response.json();

        if (activo) {
          setEsAdmin(response.ok && data.usuario?.rol === "admin");
        }
      } catch {
        if (activo) {
          setEsAdmin(false);
        }
      }
    }

    // Carga los circuitos usados por el selector de filtros y el formulario de edicion.
    async function cargarCircuitos() {
      try {
        const response = await fetch("/api/circuitos", { cache: "no-store" });
        const data = await response.json();

        if (activo && response.ok) {
          setCircuitos(Array.isArray(data.circuitos) ? data.circuitos : []);
        }
      } catch {
        if (activo) {
          setCircuitos([]);
        }
      }
    }

    verificarAdmin();
    cargarCircuitos();

    return () => {
      activo = false;
    };
  }, [router]);

  useEffect(() => {
    let activo = true;

    // Obtiene los atractivos paginados desde el backend con los filtros activos.
    async function cargarAtractivos() {
      try {
        setCargando(true);
        setError("");

        const params = new URLSearchParams({
          page: String(paginaActual),
          limit: String(LIMITE_ATRACTIVOS),
        });

        if (busquedaNombre.trim()) {
          params.set("nombre", busquedaNombre.trim());
        }

        if (departamentoSeleccionado) {
          params.set("departamento", departamentoSeleccionado);
        }

        if (circuitoSeleccionado) {
          params.set("circuito", circuitoSeleccionado);
        }

        const response = await fetch(`/api/atractivos?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.mensaje || "No se pudieron cargar los atractivos.");
        }

        if (activo) {
          setAtractivos(Array.isArray(data.atractivos) ? data.atractivos : []);
          setPaginacion(
            data.paginacion || {
              pagina: 1,
              limite: LIMITE_ATRACTIVOS,
              totalRegistros: 0,
              totalPaginas: 1,
              tieneAnterior: false,
              tieneSiguiente: false,
            }
          );
        }
      } catch (err) {
        if (activo) {
          setError(err.message || "Ocurrio un error al cargar los atractivos.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarAtractivos();

    return () => {
      activo = false;
    };
  }, [paginaActual, busquedaNombre, departamentoSeleccionado, circuitoSeleccionado]);

  // Confirma y ejecuta el borrado seguro de un atractivo desde la API protegida.
  async function borrarAtractivo(id) {
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

    setToast({ mensaje: "Eliminando atractivo en la base de datos...", tipo: "loading" });
    const response = await fetch(`/api/atractivos/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo borrar el atractivo.", tipo: "error" });
      return;
    }

    setAtractivos((valores) =>
      valores.filter((atractivo) => atractivo._id !== id)
    );
    if (atractivos.length === 1 && paginaActual > 1) {
      setPaginaActual((valor) => valor - 1);
    }
    setToast({ mensaje: "Atractivo eliminado correctamente.", tipo: "success" });
    await Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Registro eliminado",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    });
    router.push("/atractivos");
    router.refresh();
  }

  async function guardarAtractivo(event) {
    event.preventDefault();
    setToast({ mensaje: "Actualizando atractivo en la base de datos...", tipo: "loading" });

    const payload = {
      ...atractivoEditando,
      circuitoId: atractivoEditando.circuitoId,
      imagen: {
        url: atractivoEditando.imagenUrl,
        public_id: atractivoEditando.imagen?.public_id || "",
      },
    };
    const response = await fetch(`/api/atractivos/${atractivoEditando._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      setToast({ mensaje: data.error || "No se pudo actualizar el atractivo.", tipo: "error" });
      return;
    }

    setAtractivos((valores) =>
      valores.map((atractivo) =>
        atractivo._id === data.atractivo._id ? data.atractivo : atractivo
      )
    );
    setAtractivoEditando(null);
    setToast({ mensaje: "Atractivo actualizado correctamente.", tipo: "success" });
    router.push("/atractivos");
    router.refresh();
  }

  function abrirEdicionAtractivo(atractivo) {
    setAtractivoEditando({
      ...atractivo,
      circuitoId: atractivo.circuito?._id || atractivo.circuito || "",
      imagenUrl: atractivo.imagen?.url || "",
    });
  }

  function irAPagina(pagina) {
    const paginaDestino = Math.min(Math.max(1, pagina), paginacion.totalPaginas);
    setPaginaActual(paginaDestino);
    const params = construirParametrosListado(paginaDestino);
    router.replace(`/atractivos?${params.toString()}`, { scroll: false });
  }

  function construirParametrosListado(pagina = paginaActual) {
    const params = new URLSearchParams({
      page: String(pagina),
      limit: String(LIMITE_ATRACTIVOS),
    });

    if (busquedaNombre.trim()) {
      params.set("nombre", busquedaNombre.trim());
    }

    if (departamentoSeleccionado) {
      params.set("departamento", departamentoSeleccionado);
    }

    if (circuitoSeleccionado) {
      params.set("circuito", circuitoSeleccionado);
    }

    return params;
  }

  function construirHrefDetalle(id) {
    const volver = `/atractivos?${construirParametrosListado().toString()}`;
    return `/atractivos/${id}?volver=${encodeURIComponent(volver)}`;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast({ mensaje: "", tipo: "success" })} />

      <main className="mx-auto w-full max-w-7xl px-5 py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Explorar destinos
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Atractivos Turisticos de Catamarca
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Descubri paisajes, pueblos, rutas escenicas y experiencias para sumar a tu itinerario personal.
          </p>
          {esAdmin && (
            <Link
              href="/admin/cargar-atractivo"
              className="mb-6 mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700"
            >
              + Cargar Nuevo Atractivo
            </Link>
          )}
        </header>

        <section className="mt-8">
          {!cargando && !error && (
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-zinc-800">
                Buscar por nombre
                <input
                  type="text"
                  value={busquedaNombre}
                  onChange={(event) => {
                    setBusquedaNombre(event.target.value);
                    setPaginaActual(1);
                  }}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ej: adobe, puna, valle"
                />
              </label>

              <label className="block text-sm font-medium text-zinc-800">
                Departamento
                <select
                  value={departamentoSeleccionado}
                  onChange={(event) => {
                    setDepartamentoSeleccionado(event.target.value);
                    setPaginaActual(1);
                  }}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentosCatamarca.map((departamento) => (
                    <option key={departamento} value={departamento}>
                      {departamento}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-zinc-800">
                Circuito
                <select
                  value={circuitoSeleccionado}
                  onChange={(event) => {
                    setCircuitoSeleccionado(event.target.value);
                    setPaginaActual(1);
                  }}
                  className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Todos los circuitos</option>
                  {circuitos.map((circuito) => (
                    <option key={circuito._id} value={circuito._id}>
                      {circuito.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {cargando && (
            <LoadingState
              titulo="Cargando atractivos"
              mensaje="Estamos buscando paisajes, lugares y experiencias para mostrar."
            />
          )}

          {!cargando && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && paginacion.totalRegistros === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold">No hay atractivos para mostrar</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Cuando se agregue contenido turistico o ajustes los filtros, lo vas a ver en esta seccion.
              </p>
            </div>
          )}

          {!cargando &&
            !error &&
            paginacion.totalRegistros > 0 &&
            (atractivos.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {atractivos.map((atractivo) => (
                    <div key={atractivo._id} className="flex flex-col gap-3">
                      <CardAtractivo
                        atractivo={atractivo}
                        detalleHref={construirHrefDetalle(atractivo._id)}
                      />
                      {esAdmin && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEdicionAtractivo(atractivo)}
                            className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarAtractivo(atractivo._id)}
                            className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <nav className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-zinc-600">
                    Pagina {paginacion.pagina} de {paginacion.totalPaginas} · {paginacion.totalRegistros} atractivos
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => irAPagina(1)}
                      disabled={!paginacion.tieneAnterior}
                      className="min-h-10 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Primera
                    </button>
                    <button
                      type="button"
                      onClick={() => irAPagina(paginacion.pagina - 1)}
                      disabled={!paginacion.tieneAnterior}
                      className="min-h-10 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => irAPagina(paginacion.pagina + 1)}
                      disabled={!paginacion.tieneSiguiente}
                      className="min-h-10 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Siguiente
                    </button>
                    <button
                      type="button"
                      onClick={() => irAPagina(paginacion.totalPaginas)}
                      disabled={!paginacion.tieneSiguiente}
                      className="min-h-10 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Ultima
                    </button>
                  </div>
                </nav>
              </>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">
                  No se encontraron atractivos en esta pagina.
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Volve a la primera pagina o ajusta los filtros para ampliar la busqueda.
                </p>
              </div>
            ))}
        </section>

        {atractivoEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <form
              onSubmit={guardarAtractivo}
              className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold">Editar atractivo</h2>
              {[
                ["nombre", "Nombre"],
                ["departamento", "Departamento"],
                ["imagenUrl", "URL de imagen"],
                ["youtubeUrl", "URL de YouTube"],
                ["googleMapsUrl", "URL de Google Maps"],
              ].map(([name, label]) => (
                <label key={name} className="mt-3 block text-sm font-medium text-zinc-800">
                  {label}
                  <input
                    value={atractivoEditando[name] || ""}
                    onChange={(event) =>
                      setAtractivoEditando((valor) => ({
                        ...valor,
                        [name]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required={["nombre", "departamento", "imagenUrl"].includes(name)}
                  />
                </label>
              ))}
              <label className="mt-3 block text-sm font-medium text-zinc-800">
                Descripcion
                <textarea
                  value={atractivoEditando.descripcion || ""}
                  onChange={(event) =>
                    setAtractivoEditando((valor) => ({
                      ...valor,
                      descripcion: event.target.value,
                    }))
                  }
                  className="mt-1 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAtractivoEditando(null)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
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

export default function AtractivosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-950">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-5 py-10">
            <LoadingState
              titulo="Cargando atractivos"
              mensaje="Estamos preparando la lista de atractivos."
            />
          </main>
        </div>
      }
    >
      <AtractivosContenido />
    </Suspense>
  );
}
