"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";

const estadoInicial = {
  nombre: "",
  descripcion: "",
  atractivoId: "",
};

export default function CargarActividadPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [atractivos, setAtractivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Verifica permisos y carga atractivos para asociar la actividad desde el formulario.
    async function verificarAdminYCargarAtractivos() {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || sessionData.usuario?.rol !== "admin") {
          router.push("/");
          return;
        }

        const atractivosResponse = await fetch("/api/atractivos", {
          cache: "no-store",
        });
        const atractivosData = await atractivosResponse.json();

        if (!atractivosResponse.ok) {
          throw new Error(
            atractivosData.mensaje || "No se pudieron cargar los atractivos."
          );
        }

        if (activo) {
          setAtractivos(
            Array.isArray(atractivosData.atractivos)
              ? atractivosData.atractivos
              : []
          );
        }
      } catch {
        if (activo) {
          setAtractivos([]);
        }
      } finally {
        if (activo) {
          setVerificando(false);
        }
      }
    }

    verificarAdminYCargarAtractivos();

    return () => {
      activo = false;
    };
  }, [router]);

  function manejarCambio(event) {
    const { name, value } = event.target;
    setFormulario((valores) => ({ ...valores, [name]: value }));
  }

  function campoInvalido(nombreCampo) {
    return intentoEnviar && !formulario[nombreCampo].trim();
  }

  function clasesCampo(nombreCampo) {
    return campoInvalido(nombreCampo)
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
  }

  // Valida campos obligatorios y envia la actividad nueva a la API protegida.
  async function manejarEnvio(event) {
    event.preventDefault();
    setIntentoEnviar(true);

    if (
      !formulario.nombre.trim() ||
      !formulario.descripcion.trim() ||
      !formulario.atractivoId.trim()
    ) {
      setToast({ mensaje: "Completa los campos obligatorios.", tipo: "error" });
      return;
    }

    setCargando(true);

    try {
      const payload = {
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        atractivo: formulario.atractivoId,
      };

      const response = await fetch("/api/actividades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.mensaje || "No se pudo cargar la actividad.");
      }

      setToast({ mensaje: "Actividad cargada con exito.", tipo: "success" });
      setFormulario(estadoInicial);
      setIntentoEnviar(false);
      window.setTimeout(() => {
        router.push("/actividades");
        router.refresh();
      }, 600);
    } catch (error) {
      setToast({
        mensaje: error.message || "No se pudo cargar la actividad.",
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
          <p className="text-sm text-zinc-600">Verificando permisos...</p>
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
          Cargar Actividad
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Asocia una experiencia o excursion a un atractivo disponible.
        </p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-zinc-800">
            Nombre
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("nombre")}`}
              placeholder="Trekking guiado"
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
              className={`mt-2 min-h-32 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("descripcion")}`}
              placeholder="Describe la actividad, recomendaciones y condiciones generales."
            />
            {campoInvalido("descripcion") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Atractivo asociado
            <select
              name="atractivoId"
              value={formulario.atractivoId}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("atractivoId")}`}
            >
              <option value="">Seleccionar atractivo</option>
              {atractivos.map((atractivo) => (
                <option key={atractivo._id} value={atractivo._id}>
                  {atractivo.nombre}
                </option>
              ))}
            </select>
            {campoInvalido("atractivoId") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
          </label>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Cargando..." : "Guardar actividad"}
          </button>
        </form>
      </main>
    </div>
  );
}
