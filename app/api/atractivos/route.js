import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Atractivo from "@/models/Atractivo";
import Circuito from "@/models/Circuito";
import "@/models/Actividad";

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
  const imagenUrl = obtenerImagenUrl(body?.imagen);
  const actividades = Array.isArray(body?.actividadIds)
    ? body.actividadIds
    : Array.isArray(body?.actividades)
      ? body.actividades
      : [];

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
    actividades: actividades.filter((id) => mongoose.Types.ObjectId.isValid(id)),
    youtubeUrl:
      typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "",
    googleMapsUrl:
      typeof body?.googleMapsUrl === "string" ? body.googleMapsUrl.trim() : "",
  };
}

function obtenerEnteroPositivo(valor, fallback) {
  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) && numero > 0 ? numero : fallback;
}

function escaparRegex(valor) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const circuito = searchParams.get("circuito");
    const nombre = searchParams.get("nombre")?.trim();
    const departamento = searchParams.get("departamento")?.trim();
    const paginaSolicitada = obtenerEnteroPositivo(searchParams.get("page"), 1);
    const limite = Math.min(
      obtenerEnteroPositivo(searchParams.get("limit"), 6),
      100
    );
    const filtros = {};

    if (nombre) {
      filtros.nombre = { $regex: escaparRegex(nombre), $options: "i" };
    }

    if (departamento) {
      filtros.departamento = departamento;
    }

    await connectDB();

    if (circuito) {
      if (!mongoose.Types.ObjectId.isValid(circuito)) {
        return NextResponse.json(
          { error: "ID de circuito invalido." },
          { status: 400 }
        );
      }

      const circuitoDocumento = await Circuito.findById(circuito).select("atractivos");
      filtros._id = { $in: circuitoDocumento?.atractivos || [] };
    }

    const totalRegistros = await Atractivo.countDocuments(filtros);
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
    const pagina = Math.min(paginaSolicitada, totalPaginas);
    const saltar = (pagina - 1) * limite;

    const atractivos = await Atractivo.find(filtros)
      .populate("actividades")
      .sort({ nombre: 1 })
      .skip(saltar)
      .limit(limite);

    return NextResponse.json(
      {
        atractivos,
        paginacion: {
          pagina,
          limite,
          totalRegistros,
          totalPaginas,
          tieneAnterior: pagina > 1,
          tieneSiguiente: pagina < totalPaginas,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los atractivos." },
      { status: 500 }
    );
  }
}

// Crea un atractivo con datos multimedia y actividades asociadas.
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
    !datos.imagen.url
  ) {
    return NextResponse.json(
      {
        error:
          "El nombre, descripcion, departamento e imagen son obligatorios.",
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const atractivoCreado = await Atractivo.create(datos);
    const atractivo = await Atractivo.findById(atractivoCreado._id).populate(
      "actividades"
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

// Actualiza un atractivo validando permisos, datos obligatorios y actividades asociadas.
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

    await connectDB();

    const atractivo = await Atractivo.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    }).populate("actividades");

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
