"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import LoadingState from "@/components/LoadingState";

const departamentos = [
  "Tinogasta",
  "Belen",
  "Antofagasta de la Sierra",
  "Andalgala",
  "Poman",
  "Santa Maria",
  "Capital",
];

const estadoInicial = {
  nombre: "",
  descripcion: "",
  departamento: "",
  imagenUrl: "",
  youtubeUrl: "",
  googleMapsUrl: "",
  circuitoId: "",
};

export default function CargarAtractivoPage() {
  const router = useRouter();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [circuitos, setCircuitos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" });

  useEffect(() => {
    let activo = true;

    // Verifica permisos y carga circuitos para asociar el atractivo desde el formulario.
    async function verificarAdminYCargarCircuitos() {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || sessionData.usuario?.rol !== "admin") {
          router.push("/");
          return;
        }

        const circuitosResponse = await fetch("/api/circuitos", {
          cache: "no-store",
        });
        const circuitosData = await circuitosResponse.json();

        if (!circuitosResponse.ok) {
          throw new Error(
            circuitosData.mensaje || "No se pudieron cargar los circuitos."
          );
        }

        if (activo) {
          setCircuitos(
            Array.isArray(circuitosData.circuitos) ? circuitosData.circuitos : []
          );
        }
      } catch {
        if (activo) {
          setCircuitos([]);
        }
      } finally {
        if (activo) {
          setVerificando(false);
        }
      }
    }

    verificarAdminYCargarCircuitos();

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

  // Valida campos obligatorios y envia el atractivo nuevo a la API protegida.
  async function manejarEnvio(event) {
    event.preventDefault();
    setIntentoEnviar(true);

    const camposObligatorios = [
      "nombre",
      "descripcion",
      "departamento",
      "imagenUrl",
      "circuitoId",
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
        circuito: formulario.circuitoId,
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
            mensaje="Estamos cargando los circuitos y preparando el formulario."
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
          Registra un lugar turistico con imagen, multimedia y circuito asociado.
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
              {departamentos.map((departamento) => (
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
            Circuito
            <select
              name="circuitoId"
              value={formulario.circuitoId}
              onChange={manejarCambio}
              className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition ${clasesCampo("circuitoId")}`}
            >
              <option value="">Seleccionar circuito</option>
              {circuitos.map((circuito) => (
                <option key={circuito._id} value={circuito._id}>
                  {circuito.nombre}
                </option>
              ))}
            </select>
            {campoInvalido("circuitoId") && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                Este campo es obligatorio
              </span>
            )}
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
