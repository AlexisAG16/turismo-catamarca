"use client";

import { useEffect, useState } from "react";

const departamentos = [
  "Ambato",
  "Ancasti",
  "Andalgala",
  "Antofagasta de la Sierra",
  "Belen",
  "Capayan",
  "Capital",
  "El Alto",
  "Fray Mamerto Esquiu",
  "La Paz",
  "Paclin",
  "Poman",
  "Santa Maria",
  "Santa Rosa",
  "Tinogasta",
  "Valle Viejo",
];

const estadoInicial = {
  nombre: "",
  departamento: "",
  descripcion: "",
  circuito: "",
  youtubeUrl: "",
  googleMapsUrl: "",
};

async function subirImagenACloudinary(archivo) {
  if (!archivo) {
    return null;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Faltan las variables publicas de Cloudinary para subir la imagen."
    );
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "No se pudo subir la imagen.");
  }

  return {
    public_id: data.public_id,
    url: data.secure_url,
  };
}

export default function FormAtractivo({ onAtractivoCreado }) {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [circuitos, setCircuitos] = useState([]);
  const [cargandoCircuitos, setCargandoCircuitos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarCircuitos() {
      try {
        setCargandoCircuitos(true);
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
          setCargandoCircuitos(false);
        }
      }
    }

    cargarCircuitos();

    return () => {
      activo = false;
    };
  }, []);

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
      const imagen = await subirImagenACloudinary(archivoImagen);
      const payload = {
        ...formulario,
        imagen,
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
        throw new Error(data.mensaje || "No se pudo crear el atractivo.");
      }

      setFormulario(estadoInicial);
      setArchivoImagen(null);
      event.currentTarget.reset();
      setMensaje(data.mensaje || "Atractivo creado correctamente.");
      onAtractivoCreado?.(data.atractivo);
    } catch (err) {
      setError(err.message || "Ocurrio un error al guardar el atractivo.");
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
        <h2 className="text-xl font-semibold text-zinc-950">Cargar Atractivo</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Agrega informacion turistica, multimedia y ubicacion para que el visitante pueda planificar su itinerario.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Nombre
          <input
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Campo de Piedra Pomez"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Departamento
          <select
            name="departamento"
            value={formulario.departamento}
            onChange={manejarCambio}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Seleccionar departamento</option>
            {departamentos.map((departamento) => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Descripcion
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={manejarCambio}
          className="min-h-32 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Describe el atractivo, accesos recomendados y puntos de interes."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Imagen
          <input
            name="imagen"
            type="file"
            accept="image/*"
            onChange={(event) => setArchivoImagen(event.target.files?.[0] || null)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Circuito relacionado
          <select
            name="circuito"
            value={formulario.circuito}
            onChange={manejarCambio}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            disabled={cargandoCircuitos}
            required
          >
            <option value="">
              {cargandoCircuitos ? "Cargando circuitos..." : "Seleccionar circuito"}
            </option>
            {circuitos.map((circuito) => (
              <option key={circuito._id} value={circuito._id}>
                {circuito.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          URL de YouTube
          <input
            name="youtubeUrl"
            value={formulario.youtubeUrl}
            onChange={manejarCambio}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          URL de Google Maps
          <input
            name="googleMapsUrl"
            value={formulario.googleMapsUrl}
            onChange={manejarCambio}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Guardando..." : "Guardar atractivo"}
        </button>
        {mensaje && <p className="text-sm font-medium text-emerald-700">{mensaje}</p>}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
    </form>
  );
}
