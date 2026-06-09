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

function validarAdmin(request) {
  const auth = verificarAdmin(request);

  if (!auth.autorizado) {
    return {
      autorizado: false,
      respuesta: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { autorizado: true };
}

function normalizarActividad(body = {}) {
  const atractivoId =
    typeof body?.atractivoId === "string"
      ? body.atractivoId.trim()
      : typeof body?.atractivo === "string"
        ? body.atractivo.trim()
        : typeof body?.atractivo?._id === "string"
          ? body.atractivo._id.trim()
        : "";
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion:
      typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    duracionEstimada:
      typeof body?.duracionEstimada === "string"
        ? body.duracionEstimada.trim()
        : "",
    atractivo: atractivoId,
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

export async function GET(request) {
  try {
    const atractivoId = new URL(request.url).searchParams.get("atractivoId");
    const filtros = {};

    if (atractivoId) {
      if (!mongoose.Types.ObjectId.isValid(atractivoId)) {
        return NextResponse.json(
          { error: "ID de atractivo invalido." },
          { status: 400 }
        );
      }

      filtros.atractivo = atractivoId;
    }

    await connectDB();

    const actividades = await Actividad.find(filtros)
      .populate("atractivo")
      .sort({ nombre: 1 });

    return NextResponse.json({ actividades }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener las actividades." },
      { status: 500 }
    );
  }
}

// Crea una actividad y la asocia a un atractivo existente si el usuario es administrador.
export async function POST(request) {
  const admin = validarAdmin(request);

  if (!admin.autorizado) {
    return admin.respuesta;
  }

  const body = await request.json().catch(() => null);
  const datos = normalizarActividad(body);

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
      nombre: crearRegexNombreExacto(datos.nombre),
      atractivo: datos.atractivo,
    }).select("_id");
    if (existente) {
      return respuestaValidacion(NextResponse, [
        { campo: "nombre", mensaje: "Ese atractivo ya tiene una actividad con ese nombre." },
      ]);
    }

    const actividadCreada = await Actividad.create(datos);
    await Atractivo.findByIdAndUpdate(datos.atractivo, {
      $addToSet: { actividades: actividadCreada._id },
    });
    const actividad = await Actividad.findById(actividadCreada._id).populate(
      "atractivo"
    );

    return NextResponse.json(
      {
        mensaje: "Actividad creada correctamente.",
        actividad,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la actividad." },
      { status: 500 }
    );
  }
}

// Actualiza una actividad con validacion de permisos, datos y atractivo asociado.
export async function PUT(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de actividad invalido." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const datos = normalizarActividad(body);
    const errores = validarDatosActividad(datos);
    if (errores.length > 0) return respuestaValidacion(NextResponse, errores);

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
      return NextResponse.json(
        { error: "Actividad no encontrada." },
        { status: 404 }
      );
    }

    const actividad = await Actividad.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    }).populate("atractivo");

    await Atractivo.findByIdAndUpdate(actividadAnterior.atractivo, {
      $pull: { actividades: actividad._id },
    });
    await Atractivo.findByIdAndUpdate(datos.atractivo, {
      $addToSet: { actividades: actividad._id },
    });

    return NextResponse.json(
      { mensaje: "Actividad actualizada correctamente.", actividad },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la actividad." },
      { status: 500 }
    );
  }
}

// Elimina una actividad por ID y responde con errores limpios si MongoDB falla.
export async function DELETE(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de actividad invalido." },
        { status: 400 }
      );
    }

    await connectDB();

    const actividad = await Actividad.findByIdAndDelete(id);

    if (!actividad) {
      return NextResponse.json(
        { error: "Actividad no encontrada." },
        { status: 404 }
      );
    }

    await Atractivo.findByIdAndUpdate(actividad.atractivo, {
      $pull: { actividades: actividad._id },
    });

    return NextResponse.json(
      { mensaje: "Actividad borrada correctamente." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo borrar la actividad." },
      { status: 500 }
    );
  }
}
