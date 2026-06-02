import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Atractivo from "@/models/Atractivo";
import "@/models/Actividad";
import {
  crearRegexNombreExacto,
  respuestaValidacion,
  validarTexto,
  validarUrl,
} from "@/lib/serverValidation";

export const runtime = "nodejs";

function noAutorizado(request) {
  const auth = verificarAdmin(request);
  return auth.autorizado ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function imagenUrl(imagen) {
  if (typeof imagen === "string") return imagen.trim();
  if (imagen && typeof imagen === "object" && typeof imagen.url === "string") return imagen.url.trim();
  return "";
}

function datosAtractivo(body = {}) {
  const actividades = Array.isArray(body?.actividadIds)
    ? body.actividadIds
    : Array.isArray(body?.actividades)
      ? body.actividades
      : [];

  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion: typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    departamento: typeof body?.departamento === "string" ? body.departamento.trim() : "",
    imagen: { public_id: typeof body?.imagen?.public_id === "string" ? body.imagen.public_id.trim() : "", url: imagenUrl(body?.imagen) },
    actividades: actividades.filter((id) => mongoose.Types.ObjectId.isValid(id)),
    youtubeUrl: typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "",
    googleMapsUrl: typeof body?.googleMapsUrl === "string" ? body.googleMapsUrl.trim() : "",
  };
}

function validarDatosAtractivo(datos) {
  const errores = [];
  validarTexto(errores, "nombre", datos.nombre, { min: 3, max: 90 });
  validarTexto(errores, "descripcion", datos.descripcion, { min: 20, max: 1200 });
  validarTexto(errores, "departamento", datos.departamento, { min: 3, max: 80 });
  validarUrl(errores, "imagen.url", datos.imagen.url, { requerido: true });
  validarUrl(errores, "youtubeUrl", datos.youtubeUrl);
  validarUrl(errores, "googleMapsUrl", datos.googleMapsUrl);
  return errores;
}

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de atractivo invalido." }, { status: 400 });
  }

  try {
    await connectDB();
    const atractivo = await Atractivo.findById(id).populate("actividades");
    if (!atractivo) return NextResponse.json({ error: "Atractivo no encontrado." }, { status: 404 });
    return NextResponse.json({ atractivo }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener el atractivo." }, { status: 500 });
  }
}

// Actualiza un atractivo puntual y conserva la validacion multimedia obligatoria.
export async function PUT(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de atractivo invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const datos = datosAtractivo(body);
  const errores = validarDatosAtractivo(datos);
  if (errores.length > 0) return respuestaValidacion(NextResponse, errores);

  try {
    await connectDB();
    const existente = await Atractivo.findOne({
      _id: { $ne: id },
      nombre: crearRegexNombreExacto(datos.nombre),
    }).select("_id");
    if (existente) {
      return respuestaValidacion(NextResponse, [
        { campo: "nombre", mensaje: "Ya existe un atractivo con ese nombre." },
      ]);
    }

    const atractivo = await Atractivo.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).populate("actividades");
    if (!atractivo) return NextResponse.json({ error: "Atractivo no encontrado." }, { status: 404 });
    return NextResponse.json({ mensaje: "Atractivo actualizado correctamente.", atractivo }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el atractivo." }, { status: 500 });
  }
}

// Borra un atractivo puntual desde la ruta dinamica solo para administradores.
export async function DELETE(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de atractivo invalido." }, { status: 400 });
  }

  try {
    await connectDB();
    const atractivo = await Atractivo.findByIdAndDelete(id);
    if (!atractivo) return NextResponse.json({ error: "Atractivo no encontrado." }, { status: 404 });
    return NextResponse.json({ mensaje: "Atractivo borrado correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo borrar el atractivo." }, { status: 500 });
  }
}
