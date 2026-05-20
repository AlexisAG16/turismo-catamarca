import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Circuito from "@/models/Circuito";

export const runtime = "nodejs";

function noAutorizado(request) {
  const auth = verificarAdmin(request);
  return auth.autorizado ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

function datosCircuito(body = {}) {
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion: typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
  };
}

// Actualiza un circuito puntual desde la ruta dinamica protegida para administradores.
export async function PUT(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de circuito invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const datos = datosCircuito(body);
  if (!datos.nombre || !datos.descripcion) {
    return NextResponse.json({ error: "El nombre y la descripcion son obligatorios." }, { status: 400 });
  }

  try {
    await connectDB();
    const circuito = await Circuito.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    if (!circuito) return NextResponse.json({ error: "Circuito no encontrado." }, { status: 404 });
    return NextResponse.json({ mensaje: "Circuito actualizado correctamente.", circuito }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el circuito." }, { status: 500 });
  }
}

// Borra un circuito puntual usando el ID de la URL y validando permisos.
export async function DELETE(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de circuito invalido." }, { status: 400 });
  }

  try {
    await connectDB();
    const circuito = await Circuito.findByIdAndDelete(id);
    if (!circuito) return NextResponse.json({ error: "Circuito no encontrado." }, { status: 404 });
    return NextResponse.json({ mensaje: "Circuito borrado correctamente." }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo borrar el circuito." }, { status: 500 });
  }
}
