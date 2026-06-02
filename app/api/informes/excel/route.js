import { NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/authMiddleware";
import connectDB from "@/lib/mongodb";
import Circuito from "@/models/Circuito";
import Atractivo from "@/models/Atractivo";
import Actividad from "@/models/Actividad";

export const runtime = "nodejs";

const CONTENT_TYPES = {
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
  "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Circuitos" sheetId="1" r:id="rId1"/>
    <sheet name="Atractivos" sheetId="2" r:id="rId2"/>
    <sheet name="Actividades" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`,
  "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF047857"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
</styleSheet>`,
};

function escaparXml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnaExcel(indice) {
  let columna = "";
  let numero = indice + 1;

  while (numero > 0) {
    const resto = (numero - 1) % 26;
    columna = String.fromCharCode(65 + resto) + columna;
    numero = Math.floor((numero - 1) / 26);
  }

  return columna;
}

function normalizarValor(valor) {
  if (valor instanceof Date) return valor.toISOString();
  if (valor === undefined || valor === null) return "";
  return valor;
}

function crearHoja(filas) {
  const anchoColumnas = filas[0]
    .map((_, indice) => {
      const ancho = filas.reduce((maximo, fila) => {
        const texto = String(normalizarValor(fila[indice]) ?? "");
        return Math.max(maximo, texto.length);
      }, 10);

      return `<col min="${indice + 1}" max="${indice + 1}" width="${Math.min(Math.max(ancho + 2, 12), 45)}" customWidth="1"/>`;
    })
    .join("");

  const filasXml = filas
    .map((fila, filaIndice) => {
      const numeroFila = filaIndice + 1;
      const celdas = fila
        .map((valor, columnaIndice) => {
          const referencia = `${columnaExcel(columnaIndice)}${numeroFila}`;
          const estilo = filaIndice === 0 ? ' s="1"' : "";
          return `<c r="${referencia}" t="inlineStr"${estilo}><is><t>${escaparXml(normalizarValor(valor))}</t></is></c>`;
        })
        .join("");

      return `<row r="${numeroFila}">${celdas}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${anchoColumnas}</cols>
  <sheetData>${filasXml}</sheetData>
  <autoFilter ref="A1:${columnaExcel(filas[0].length - 1)}${filas.length}"/>
</worksheet>`;
}

function crearCrc32() {
  const tabla = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    tabla[i] = crc >>> 0;
  }

  return function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
      crc = tabla[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
}

const crc32 = crearCrc32();

function escribirUInt16(valor) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(valor);
  return buffer;
}

function escribirUInt32(valor) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(valor >>> 0);
  return buffer;
}

function crearZip(archivos) {
  const partes = [];
  const directorio = [];
  let offset = 0;

  for (const archivo of archivos) {
    const nombre = Buffer.from(archivo.nombre, "utf8");
    const contenido = Buffer.from(archivo.contenido, "utf8");
    const crc = crc32(contenido);

    const cabeceraLocal = Buffer.concat([
      escribirUInt32(0x04034b50),
      escribirUInt16(20),
      escribirUInt16(0x0800),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt32(crc),
      escribirUInt32(contenido.length),
      escribirUInt32(contenido.length),
      escribirUInt16(nombre.length),
      escribirUInt16(0),
      nombre,
    ]);

    partes.push(cabeceraLocal, contenido);

    directorio.push({
      nombre,
      crc,
      tamano: contenido.length,
      offset,
    });

    offset += cabeceraLocal.length + contenido.length;
  }

  const inicioDirectorio = offset;

  for (const entrada of directorio) {
    const cabeceraCentral = Buffer.concat([
      escribirUInt32(0x02014b50),
      escribirUInt16(20),
      escribirUInt16(20),
      escribirUInt16(0x0800),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt32(entrada.crc),
      escribirUInt32(entrada.tamano),
      escribirUInt32(entrada.tamano),
      escribirUInt16(entrada.nombre.length),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt16(0),
      escribirUInt32(0),
      escribirUInt32(entrada.offset),
      entrada.nombre,
    ]);

    partes.push(cabeceraCentral);
    offset += cabeceraCentral.length;
  }

  const finDirectorio = Buffer.concat([
    escribirUInt32(0x06054b50),
    escribirUInt16(0),
    escribirUInt16(0),
    escribirUInt16(directorio.length),
    escribirUInt16(directorio.length),
    escribirUInt32(offset - inicioDirectorio),
    escribirUInt32(inicioDirectorio),
    escribirUInt16(0),
  ]);

  partes.push(finDirectorio);
  return Buffer.concat(partes);
}

function nombres(lista = []) {
  return lista.map((item) => item?.nombre).filter(Boolean).join(", ");
}

async function obtenerFilas() {
  await connectDB();

  const [circuitos, atractivos, actividades] = await Promise.all([
    Circuito.find().populate("atractivos", "nombre departamento").sort({ nombre: 1 }).lean(),
    Atractivo.find().populate("actividades", "nombre duracionEstimada costoAproximado").sort({ nombre: 1 }).lean(),
    Actividad.find().populate("atractivo", "nombre departamento").sort({ nombre: 1 }).lean(),
  ]);

  const filasCircuitos = [
    ["ID", "Nombre", "Descripción", "Atractivos asociados", "Cantidad de atractivos", "Creado", "Actualizado"],
    ...circuitos.map((circuito) => [
      String(circuito._id),
      circuito.nombre,
      circuito.descripcion,
      nombres(circuito.atractivos),
      circuito.atractivos?.length || 0,
      circuito.createdAt,
      circuito.updatedAt,
    ]),
  ];

  const filasAtractivos = [
    ["ID", "Nombre", "Departamento", "Descripción", "Actividades asociadas", "Imagen", "YouTube", "Google Maps", "Creado", "Actualizado"],
    ...atractivos.map((atractivo) => [
      String(atractivo._id),
      atractivo.nombre,
      atractivo.departamento,
      atractivo.descripcion,
      nombres(atractivo.actividades),
      atractivo.imagen?.url || "",
      atractivo.youtubeUrl || "",
      atractivo.googleMapsUrl || "",
      atractivo.createdAt,
      atractivo.updatedAt,
    ]),
  ];

  const filasActividades = [
    ["ID", "Nombre", "Descripción", "Duración estimada", "Costo aproximado", "Atractivo", "Departamento", "Creado", "Actualizado"],
    ...actividades.map((actividad) => [
      String(actividad._id),
      actividad.nombre,
      actividad.descripcion,
      actividad.duracionEstimada || "",
      actividad.costoAproximado ?? "",
      actividad.atractivo?.nombre || "",
      actividad.atractivo?.departamento || "",
      actividad.createdAt,
      actividad.updatedAt,
    ]),
  ];

  return { filasCircuitos, filasAtractivos, filasActividades };
}

export async function GET(request) {
  const admin = verificarAdmin(request);

  if (!admin.autorizado) {
    return NextResponse.json(
      { error: admin.mensaje || "No autorizado" },
      { status: admin.status || 401 }
    );
  }

  try {
    const { filasCircuitos, filasAtractivos, filasActividades } = await obtenerFilas();
    const archivos = [
      ...Object.entries(CONTENT_TYPES).map(([nombre, contenido]) => ({ nombre, contenido })),
      { nombre: "xl/worksheets/sheet1.xml", contenido: crearHoja(filasCircuitos) },
      { nombre: "xl/worksheets/sheet2.xml", contenido: crearHoja(filasAtractivos) },
      { nombre: "xl/worksheets/sheet3.xml", contenido: crearHoja(filasActividades) },
    ];
    const excel = crearZip(archivos);
    const fecha = new Date().toISOString().slice(0, 10);

    return new NextResponse(excel, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="informe-turismo-catamarca-${fecha}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo generar el informe." },
      { status: 500 }
    );
  }
}
