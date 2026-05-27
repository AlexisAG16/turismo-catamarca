"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";
import { departamentosCatamarca } from "@/lib/departamentos";

const estadoInicial = {
  nombre: "",
  descripcion: "",
  departamento: "",
  imagenUrl: "",
  youtubeUrl: "",
  googleMapsUrl: "",
  actividadIds: [],
};

export default function CargarAtractivoPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Verifica permisos y carga actividades para asociarlas al atractivo nuevo.
    async function verificarAdminYCargarActividades() {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || sessionData.usuario?.rol !== "admin") {
          router.push("/");
          return;
        }

        const actividadesResponse = await fetch("/api/actividades", {
          cache: "no-store",
        });
        const actividadesData = await actividadesResponse.json();

        if (!actividadesResponse.ok) {
          throw new Error(
            actividadesData.mensaje || "No se pudieron cargar las actividades."
          );
        }

        if (activo) {
          setActividades(
            Array.isArray(actividadesData.actividades)
              ? actividadesData.actividades
              : []
          );
        }
      } catch {
        if (activo) {
          setActividades([]);
        }
      } finally {
        if (activo) {
          setVerificando(false);
        }
      }
    }

    verificarAdminYCargarActividades();

    return () => {
      activo = false;
    };
  }, [router]);

  function manejarCambio(event) {
    const { name, value } = event.target;
    setFormulario((valores) => ({ ...valores, [name]: value }));
  }

  function alternarActividad(id) {
    setFormulario((valores) => ({
      ...valores,
      actividadIds: valores.actividadIds.includes(id)
        ? valores.actividadIds.filter((actividadId) => actividadId !== id)
        : [...valores.actividadIds, id],
    }));
  }

  function campoInvalido(nombreCampo) {
    return intentoEnviar && !formulario[nombreCampo].trim();
  }

  function clasesCampo(nombreCampo) {
    return campoInvalido(nombreCampo)
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
  }

  // Valida campos obligatorios y envia el atractivo nuevo a la API protegida.
  async function manejarEnvio(event) {
    event.preventDefault();
    setIntentoEnviar(true);

    const camposObligatorios = [
      "nombre",
      "descripcion",
      "departamento",
      "imagenUrl",
    ];

    if (camposObligatorios.some((campo) => !formulario[campo].trim())) {
      setToast({ mensaje: "Completa los campos obligatorios.", tipo: "error" });
      return;
    }

    setCargando(true);
    setToast({ mensaje: "Conectando con la base de datos...", tipo: "loading" });

    try {
      const payload = {
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        departamento: formulario.departamento,
        imagen: formulario.imagenUrl
          ? {
              public_id: "",
              url: formulario.imagenUrl,
            }
          : null,
        youtubeUrl: formulario.youtubeUrl,
        googleMapsUrl: formulario.googleMapsUrl,
      };

      const response = await fetch("/api/atractivos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.mensaje || "No se pudo cargar el atractivo.");
      }

      await Promise.all(
        formulario.actividadIds.map((actividadId) => {
          const actividad = actividades.find((item) => item._id === actividadId);
          if (!actividad) return null;

          return fetch(`/api/actividades/${actividadId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: actividad.nombre,
              descripcion: actividad.descripcion,
              duracionEstimada: actividad.duracionEstimada || "",
              atractivoId: data.atractivo._id,
            }),
          });
        })
      );

      setToast({ mensaje: "Atractivo guardado correctamente en la base de datos.", tipo: "success" });
      setFormulario(estadoInicial);
      setIntentoEnviar(false);
      window.setTimeout(() => {
        router.push("/atractivos");
        router.refresh();
      }, 600);
    } catch (error) {
      setToast({
        mensaje: error.message || "No se pudo conectar con la base de datos.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <Navbar />
        <main className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
          <LoadingState
            titulo="Verificando permisos"
            mensaje="Estamos cargando las actividades y preparando el formulario."
            compacto
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast({ mensaje: "", tipo: "success" })} />

      <main className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Cargar Atractivo
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Registra un lugar turistico con imagen, multimedia y actividades asociadas.
        </p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-zinc-800">
            Nombre
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("nombre")}`}
              placeholder="Campo de Piedra Pomez"
            />
            {campoInvalido("nombre") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Descripcion
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              className={`mt-2 min-h-28 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("descripcion")}`}
              placeholder="Describe el atractivo y recomendaciones para visitarlo."
            />
            {campoInvalido("descripcion") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Departamento
            <select
              name="departamento"
              value={formulario.departamento}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("departamento")}`}
            >
              <option value="">Seleccionar departamento</option>
              {departamentosCatamarca.map((departamento) => (
                <option key={departamento} value={departamento}>
                  {departamento}
                </option>
              ))}
            </select>
            {campoInvalido("departamento") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Actividades asociadas
            <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-md border border-zinc-300 bg-white p-3">
              {actividades.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No hay actividades disponibles para asociar.
                </p>
              ) : (
                actividades.map((actividad) => (
                  <label key={actividad._id} className="flex items-start gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formulario.actividadIds.includes(actividad._id)}
                      onChange={() => alternarActividad(actividad._id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium text-zinc-900">{actividad.nombre}</span>
                      <span className="text-xs text-zinc-500">
                        {actividad.atractivo?.nombre || "Sin atractivo asignado"}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            URL de la foto
            <input
              name="imagenUrl"
              value={formulario.imagenUrl}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("imagenUrl")}`}
              placeholder="https://..."
            />
            {campoInvalido("imagenUrl") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            URL de YouTube
            <input
              name="youtubeUrl"
              value={formulario.youtubeUrl}
              onChange={manejarCambio}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            URL de Google Maps
            <input
              name="googleMapsUrl"
              value={formulario.googleMapsUrl}
              onChange={manejarCambio}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </label>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Cargando..." : "Guardar atractivo"}
          </button>
        </form>
      </main>
    </div>
  );
}
