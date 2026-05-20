import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Actividad from "@/models/Actividad";

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
        : "";
  const costoNumerico = Number(body?.costoAproximado);
  const datos = {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion:
      typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    duracionEstimada:
      typeof body?.duracionEstimada === "string"
        ? body.duracionEstimada.trim()
        : "",
    atractivo: atractivoId,
  };

  if (
    body?.costoAproximado !== undefined &&
    body?.costoAproximado !== null &&
    body?.costoAproximado !== ""
  ) {
    datos.costoAproximado = costoNumerico;
  }

  return datos;
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

  if (!datos.nombre || !datos.descripcion || !datos.atractivo) {
    return NextResponse.json(
      { error: "El nombre, descripcion y atractivo son obligatorios." },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(datos.atractivo)) {
    return NextResponse.json(
      { error: "El atractivo debe ser un ID valido de MongoDB." },
      { status: 400 }
    );
  }

  if (
    datos.costoAproximado !== undefined &&
    (!Number.isFinite(datos.costoAproximado) || datos.costoAproximado < 0)
  ) {
    return NextResponse.json(
      { error: "El costo aproximado debe ser un numero mayor o igual a 0." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const actividadCreada = await Actividad.create(datos);
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

    if (!mongoose.Types.ObjectId.isValid(datos.atractivo)) {
      return NextResponse.json(
        { error: "El atractivo debe ser un ID valido de MongoDB." },
        { status: 400 }
      );
    }

    await connectDB();

    const actividad = await Actividad.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    }).populate("atractivo");

    if (!actividad) {
      return NextResponse.json(
        { error: "Actividad no encontrada." },
        { status: 404 }
      );
    }

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
