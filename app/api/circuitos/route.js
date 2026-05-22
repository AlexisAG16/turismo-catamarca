import { NextResponse } from "next/server";
import { verificarAdmin, verificarToken } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Circuito from "@/models/Circuito";
import mongoose from "mongoose";

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

function validarSesion(request) {
  const auth = verificarToken(request);

  if (!auth.autorizado) {
    return {
      autorizado: false,
      respuesta: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { autorizado: true };
}

function normalizarCircuito(body = {}) {
  return {
    nombre: typeof body?.nombre === "string" ? body.nombre.trim() : "",
    descripcion:
      typeof body?.descripcion === "string" ? body.descripcion.trim() : "",
  };
}

export async function GET() {
  try {
    await connectDB();

    const circuitos = await Circuito.find().sort({ nombre: 1 });

    return NextResponse.json({ circuitos }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los circuitos." },
      { status: 500 }
    );
  }
}

// Crea un circuito nuevo si la sesion pertenece a un usuario autenticado.
export async function POST(request) {
  const sesion = validarSesion(request);

  if (!sesion.autorizado) {
    return sesion.respuesta;
  }

  const body = await request.json().catch(() => null);
  const datos = normalizarCircuito(body);

  if (!datos.nombre || !datos.descripcion) {
    return NextResponse.json(
      { error: "El nombre y la descripcion son obligatorios." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const circuito = await Circuito.create(datos);

    return NextResponse.json(
      {
        mensaje: "Circuito creado correctamente.",
        circuito,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el circuito." },
      { status: 500 }
    );
  }
}

// Actualiza un circuito existente validando ID, permisos y campos obligatorios.
export async function PUT(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de circuito invalido." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const datos = normalizarCircuito(body);

    if (!datos.nombre || !datos.descripcion) {
      return NextResponse.json(
        { error: "El nombre y la descripcion son obligatorios." },
        { status: 400 }
      );
    }

    await connectDB();

    const circuito = await Circuito.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    });

    if (!circuito) {
      return NextResponse.json(
        { error: "Circuito no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mensaje: "Circuito actualizado correctamente.", circuito },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el circuito." },
      { status: 500 }
    );
  }
}

// Elimina un circuito por ID y evita borrar datos sin permisos de administrador.
export async function DELETE(request) {
  try {
    const admin = validarAdmin(request);

    if (!admin.autorizado) {
      return admin.respuesta;
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de circuito invalido." },
        { status: 400 }
      );
    }

    await connectDB();

    const circuito = await Circuito.findByIdAndDelete(id);

    if (!circuito) {
      return NextResponse.json(
        { error: "Circuito no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mensaje: "Circuito borrado correctamente." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo borrar el circuito." },
      { status: 500 }
    );
  }
}
