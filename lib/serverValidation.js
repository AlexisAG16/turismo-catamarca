export function agregarError(errores, campo, mensaje) {
  errores.push({ campo, mensaje });
}

export function validarTexto(errores, campo, valor, opciones = {}) {
  const { requerido = true, min = 2, max = 500 } = opciones;
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (requerido && !texto) {
    agregarError(errores, campo, "Este campo es obligatorio.");
    return;
  }

  if (texto && texto.length < min) {
    agregarError(errores, campo, `Debe tener al menos ${min} caracteres.`);
  }

  if (texto && texto.length > max) {
    agregarError(errores, campo, `No puede superar los ${max} caracteres.`);
  }
}

export function validarUrl(errores, campo, valor, opciones = {}) {
  const { requerido = false, protocolos = ["http:", "https:"] } = opciones;
  const texto = typeof valor === "string" ? valor.trim() : "";

  if (!texto) {
    if (requerido) agregarError(errores, campo, "La URL es obligatoria.");
    return;
  }

  try {
    const url = new URL(texto);
    if (!protocolos.includes(url.protocol)) {
      agregarError(errores, campo, "La URL debe usar http o https.");
    }
  } catch {
    agregarError(errores, campo, "La URL no tiene un formato válido.");
  }
}

export function respuestaValidacion(NextResponse, errores) {
  return NextResponse.json(
    { error: "Datos inválidos.", errores },
    { status: 400 }
  );
}

export function crearRegexNombreExacto(nombre) {
  const escapado = nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapado}$`, "i");
}
