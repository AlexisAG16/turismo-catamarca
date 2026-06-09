import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Actividad from "@/models/Actividad";
import Atractivo from "@/models/Atractivo";
import {
  crearRegexNombreExacto,
  respuestaValidacion,
  validarTexto,
} from "@/lib/serverValidation";

export const runtime = "nodejs";

function noAutorizado(request) {
  const auth = verificarAdmin(request);
  return auth.autorizado ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function datosActividad(body = {}) {
  const atractivo =
    typeof body?.atractivoId === "string"
      ? body.atractivoId.trim()
      : typeof body?.atractivo === "string"
        ? body.atractivo.trim()
        : typeof body?.atractivo?._id === "string"
          ? body.atractivo._id.trim()
          : "";
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion: typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    duracionEstimada: typeof body?.duracionEstimada === "string" ? body.duracionEstimada.trim() : "",
    atractivo,
  };
}

function validarDatosActividad(datos) {
  const errores = [];
  validarTexto(errores, "nombre", datos.nombre, { min: 3, max: 100 });
  validarTexto(errores, "descripcion", datos.descripcion, { min: 20, max: 1000 });
  validarTexto(errores, "duracionEstimada", datos.duracionEstimada, {
    requerido: false,
    min: 2,
    max: 80,
  });

  if (!datos.atractivo) {
    errores.push({ campo: "atractivo", mensaje: "El atractivo es obligatorio." });
  } else if (!mongoose.Types.ObjectId.isValid(datos.atractivo)) {
    errores.push({ campo: "atractivo", mensaje: "El atractivo debe ser un ID válido de MongoDB." });
  }

  return errores;
}

// Actualiza una actividad puntual y mantiene su relacion con un atractivo valido.
export async function PUT(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de actividad invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const datos = datosActividad(body);
  const errores = validarDatosActividad(datos);
  if (errores.length > 0) return respuestaValidacion(NextResponse, errores);

  try {
    await connectDB();
    const atractivoExiste = await Atractivo.exists({ _id: datos.atractivo });
    if (!atractivoExiste) {
      return respuestaValidacion(NextResponse, [
        { campo: "atractivo", mensaje: "El atractivo asociado no existe." },
      ]);
    }

    const existente = await Actividad.findOne({
      _id: { $ne: id },
      nombre: crearRegexNombreExacto(datos.nombre),
      atractivo: datos.atractivo,
    }).select("_id");
    if (existente) {
      return respuestaValidacion(NextResponse, [
        { campo: "nombre", mensaje: "Ese atractivo ya tiene una actividad con ese nombre." },
      ]);
    }

    const actividadAnterior = await Actividad.findById(id).select("atractivo");
    if (!actividadAnterior) {
      return NextResponse.json({ error: "Actividad no encontrada." }, { status: 404 });
    }

    const actividad = await Actividad.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).populate("atractivo");
    await Atractivo.findByIdAndUpdate(actividadAnterior.atractivo, {
      $pull: { actividades: actividad._id },
    });
    await Atractivo.findByIdAndUpdate(datos.atractivo, {
      $addToSet: { actividades: actividad._id },
    });
    return NextResponse.json({ mensaje: "Actividad actualizada correctamente.", actividad }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la actividad." }, { status: 500 });
  }
}

// Borra una actividad puntual con control de rol y manejo seguro de errores.
export async function DELETE(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de actividad invalido." }, { status: 400 });
  }

  try {
    await connectDB();
    const actividad = await Actividad.findByIdAndDelete(id);
    if (!actividad) return NextResponse.json({ error: "Actividad no encontrada." }, { status: 404 });
    await Atractivo.findByIdAndUpdate(actividad.atractivo, {
      $pull: { actividades: actividad._id },
    });
    return NextResponse.json({ mensaje: "Actividad borrada correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo borrar la actividad." }, { status: 500 });
  }
}
