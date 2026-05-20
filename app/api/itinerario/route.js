import { verificarToken } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export const runtime = "nodejs";

async function obtenerUsuarioConItinerario(usuarioId) {
  return User.findById(usuarioId).populate("itinerario");
}

function validarUsuarioComun(auth) {
  return auth.autorizado && auth.usuario?.rol === "usuario";
}

export async function GET(request) {
  try {
    const auth = verificarToken(request);

    if (!validarUsuarioComun(auth)) {
      return Response.json({ mensaje: "No autorizado." }, { status: 401 });
    }

    await connectDB();

    const usuario = await obtenerUsuarioConItinerario(auth.usuario.id);

    if (!usuario) {
      return Response.json({ mensaje: "Usuario no encontrado." }, { status: 404 });
    }

    return Response.json({ itinerario: usuario.itinerario || [] }, { status: 200 });
  } catch (error) {
    return Response.json(
      { mensaje: "Error al obtener el itinerario.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = verificarToken(request);

    if (!validarUsuarioComun(auth)) {
      return Response.json({ mensaje: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const atractivoId =
      typeof body?.atractivoId === "string" ? body.atractivoId.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(atractivoId)) {
      return Response.json(
        { mensaje: "ID de atractivo invalido." },
        { status: 400 }
      );
    }

    await connectDB();

    await User.findByIdAndUpdate(auth.usuario.id, {
      $addToSet: { itinerario: atractivoId },
    });

    const usuario = await obtenerUsuarioConItinerario(auth.usuario.id);

    if (!usuario) {
      return Response.json({ mensaje: "Usuario no encontrado." }, { status: 404 });
    }

    return Response.json(
      {
        mensaje: "Atractivo agregado al itinerario.",
        itinerario: usuario.itinerario || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { mensaje: "Error al actualizar el itinerario.", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const auth = verificarToken(request);

    if (!validarUsuarioComun(auth)) {
      return Response.json({ mensaje: "No autorizado." }, { status: 401 });
    }

    const atractivoId = new URL(request.url).searchParams.get("atractivoId");

    if (!mongoose.Types.ObjectId.isValid(atractivoId)) {
      return Response.json(
        { mensaje: "ID de atractivo invalido." },
        { status: 400 }
      );
    }

    await connectDB();

    await User.findByIdAndUpdate(auth.usuario.id, {
      $pull: { itinerario: atractivoId },
    });

    const usuario = await obtenerUsuarioConItinerario(auth.usuario.id);

    if (!usuario) {
      return Response.json({ mensaje: "Usuario no encontrado." }, { status: 404 });
    }

    return Response.json(
      {
        mensaje: "Atractivo quitado del itinerario.",
        itinerario: usuario.itinerario || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { mensaje: "Error al actualizar el itinerario.", error: error.message },
      { status: 500 }
    );
  }
}
