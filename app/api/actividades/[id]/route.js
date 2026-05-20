import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Actividad from "@/models/Actividad";

export const runtime = "nodejs";

function noAutorizado(request) {
  const auth = verificarAdmin(request);
  return auth.autorizado ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function datosActividad(body = {}) {
  const atractivo = typeof body?.atractivoId === "string" ? body.atractivoId.trim() : typeof body?.atractivo === "string" ? body.atractivo.trim() : "";
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion: typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    duracionEstimada: typeof body?.duracionEstimada === "string" ? body.duracionEstimada.trim() : "",
    atractivo,
  };
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
  if (!datos.nombre || !datos.descripcion || !datos.atractivo) {
    return NextResponse.json({ error: "El nombre, descripcion y atractivo son obligatorios." }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(datos.atractivo)) {
    return NextResponse.json({ error: "El atractivo debe ser un ID valido de MongoDB." }, { status: 400 });
  }

  try {
    await connectDB();
    const actividad = await Actividad.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).populate("atractivo");
    if (!actividad) return NextResponse.json({ error: "Actividad no encontrada." }, { status: 404 });
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
    return NextResponse.json({ mensaje: "Actividad borrada correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo borrar la actividad." }, { status: 500 });
  }
}
