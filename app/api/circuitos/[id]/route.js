import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Circuito from "@/models/Circuito";
import Atractivo from "@/models/Atractivo";
import "@/models/Actividad";
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

function datosCircuito(body = {}) {
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion: typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    atractivoIds: Array.isArray(body?.atractivoIds)
      ? body.atractivoIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [],
  };
}

function validarDatosCircuito(datos) {
  const errores = [];
  validarTexto(errores, "nombre", datos.nombre, { min: 3, max: 100 });
  validarTexto(errores, "descripcion", datos.descripcion, { min: 20, max: 1200 });
  return errores;
}

async function validarAtractivosExistentes(ids) {
  if (ids.length === 0) return true;
  const total = await Atractivo.countDocuments({ _id: { $in: ids } });
  return total === ids.length;
}

// Actualiza un circuito puntual desde la ruta dinamica protegida para administradores.
export async function GET(_request, { params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de circuito inválido." }, { status: 400 });
  }

  try {
    await connectDB();
    const circuito = await Circuito.findById(id).populate({
      path: "atractivos",
      populate: {
        path: "actividades",
      },
    });

    if (!circuito) {
      return NextResponse.json({ error: "Circuito no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ circuito }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener el circuito." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const bloqueo = noAutorizado(request);
  if (bloqueo) return bloqueo;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de circuito invalido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const datos = datosCircuito(body);
  const errores = validarDatosCircuito(datos);
  if (errores.length > 0) return respuestaValidacion(NextResponse, errores);

  try {
    await connectDB();
    const existente = await Circuito.findOne({
      _id: { $ne: id },
      nombre: crearRegexNombreExacto(datos.nombre),
    }).select("_id");
    if (existente) {
      return respuestaValidacion(NextResponse, [
        { campo: "nombre", mensaje: "Ya existe un circuito con ese nombre." },
      ]);
    }

    if (!(await validarAtractivosExistentes(datos.atractivoIds))) {
      return respuestaValidacion(NextResponse, [
        { campo: "atractivoIds", mensaje: "Uno o más atractivos asociados no existen." },
      ]);
    }

    const circuito = await Circuito.findByIdAndUpdate(
      id,
      {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        atractivos: datos.atractivoIds,
      },
      { new: true, runValidators: true }
    );
    if (!circuito) return NextResponse.json({ error: "Circuito no encontrado." }, { status: 404 });

    if (datos.atractivoIds.length > 0) {
      await Atractivo.updateMany(
        { _id: { $in: datos.atractivoIds } },
        { $set: { circuito: circuito._id } }
      );
    }

    const circuitoActualizado = await Circuito.findById(circuito._id).populate(
      "atractivos",
      "nombre departamento"
    );

    return NextResponse.json({
      mensaje: "Circuito actualizado correctamente.",
      circuito: circuitoActualizado,
    }, { status: 200 });
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
