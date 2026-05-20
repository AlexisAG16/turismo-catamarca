import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Atractivo from "@/models/Atractivo";

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

function obtenerImagenUrl(imagen) {
  if (typeof imagen === "string") {
    return imagen.trim();
  }

  if (imagen && typeof imagen === "object" && typeof imagen.url === "string") {
    return imagen.url.trim();
  }

  return "";
}

function normalizarAtractivo(body = {}) {
  const circuitoId =
    typeof body?.circuitoId === "string"
      ? body.circuitoId.trim()
      : typeof body?.circuito === "string"
        ? body.circuito.trim()
        : "";
  const imagenUrl = obtenerImagenUrl(body?.imagen);

  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion:
      typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
    departamento:
      typeof body?.departamento === "string" ? body.departamento.trim() : "",
    imagen: {
      public_id:
        body?.imagen &&
        typeof body.imagen === "object" &&
        typeof body.imagen.public_id === "string"
          ? body.imagen.public_id.trim()
          : "",
      url: imagenUrl,
    },
    circuito: circuitoId,
    youtubeUrl:
      typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "",
    googleMapsUrl:
      typeof body?.googleMapsUrl === "string" ? body.googleMapsUrl.trim() : "",
  };
}

export async function GET(request) {
  try {
    const circuito = new URL(request.url).searchParams.get("circuito");
    const filtros = {};

    if (circuito) {
      if (!mongoose.Types.ObjectId.isValid(circuito)) {
        return NextResponse.json(
          { error: "ID de circuito invalido." },
          { status: 400 }
        );
      }

      filtros.circuito = circuito;
    }

    await connectDB();

    const atractivos = await Atractivo.find(filtros)
      .populate("circuito")
      .sort({ nombre: 1 });

    return NextResponse.json({ atractivos }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los atractivos." },
      { status: 500 }
    );
  }
}

// Crea un atractivo con datos multimedia y lo vincula a un circuito existente.
export async function POST(request) {
  const admin = validarAdmin(request);

  if (!admin.autorizado) {
    return admin.respuesta;
  }

  const body = await request.json().catch(() => null);
  const datos = normalizarAtractivo(body);

  if (
    !datos.nombre ||
    !datos.descripcion ||
    !datos.departamento ||
    !datos.imagen.url ||
    !datos.circuito
  ) {
    return NextResponse.json(
      {
        error:
          "El nombre, descripción, departamento, imagen y circuito son obligatorios.",
      },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(datos.circuito)) {
    return NextResponse.json(
      { error: "El circuito debe ser un ID valido de MongoDB." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const atractivoCreado = await Atractivo.create(datos);
    const atractivo = await Atractivo.findById(atractivoCreado._id).populate(
      "circuito"
    );

    return NextResponse.json(
      {
        mensaje: "Atractivo creado correctamente.",
        atractivo,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el atractivo." },
      { status: 500 }
    );
  }
}

// Actualiza un atractivo validando permisos, datos obligatorios y circuito asociado.
export async function PUT(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de atractivo invalido." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const datos = normalizarAtractivo(body);

    if (!mongoose.Types.ObjectId.isValid(datos.circuito)) {
      return NextResponse.json(
        { error: "El circuito debe ser un ID valido de MongoDB." },
        { status: 400 }
      );
    }

    await connectDB();

    const atractivo = await Atractivo.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    }).populate("circuito");

    if (!atractivo) {
      return NextResponse.json(
        { error: "Atractivo no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mensaje: "Atractivo actualizado correctamente.", atractivo },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el atractivo." },
      { status: 500 }
    );
  }
}

// Elimina un atractivo por ID con control estricto de rol administrador.
export async function DELETE(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de atractivo invalido." },
        { status: 400 }
      );
    }

    await connectDB();

    const atractivo = await Atractivo.findByIdAndDelete(id);

    if (!atractivo) {
      return NextResponse.json(
        { error: "Atractivo no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mensaje: "Atractivo borrado correctamente." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo borrar el atractivo." },
      { status: 500 }
    );
  }
}
