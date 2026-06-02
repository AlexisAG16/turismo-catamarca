#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const projectRoot = path.resolve(__dirname, "..");
loadEnvFile(path.join(projectRoot, ".env.local"));

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const reemplazos = [
  ["regiónal", "regional"],
  ["regiónales", "regionales"],
  ["guíado", "guiado"],
  ["guíada", "guiada"],
  ["Historico", "Histórico"],
  ["Historica", "Histórica"],
  ["emblematico", "emblemático"],
  ["Camarin", "Camarín"],
  ["cercania", "cercanía"],
  ["gastronomia", "gastronomía"],
  ["vegetacion", "vegetación"],
  ["Excursion", "Excursión"],
  ["interes", "interés"],
  ["precaucion", "precaución"],
  ["caracter", "carácter"],
  ["Pomez", "Pómez"],
  ["pomez", "pómez"],
  ["Volcan", "Volcán"],
  ["volcan", "volcán"],
  ["Galan", "Galán"],
  ["Galan", "Galán"],
  ["Basilica", "Basílica"],
  ["Senora", "Señora"],
  ["Andalgala", "Andalgalá"],
  ["Belen", "Belén"],
  ["Taton", "Tatón"],
  ["Icano", "Icaño"],
  ["Santa Maria", "Santa María"],
  ["Catamarquies", "Catamarquíes"],
  ["Catamarquenos", "Catamarqueños"],
  ["Catamarqueno", "Catamarqueño"],
  ["catamarquena", "catamarqueña"],
  ["catamarqueno", "catamarqueño"],
  ["Esquiu", "Esquiú"],
  ["Paclin", "Paclín"],
  ["Poman", "Pomán"],
  ["Calchaqui", "Calchaquí"],
  ["Calchaquies", "Calchaquíes"],
  ["arqueologico", "arqueológico"],
  ["arqueologica", "arqueológica"],
  ["arqueologicas", "arqueológicas"],
  ["arqueologicos", "arqueológicos"],
  ["historico", "histórico"],
  ["historica", "histórica"],
  ["historicos", "históricos"],
  ["historicas", "históricas"],
  ["escenico", "escénico"],
  ["escenicas", "escénicas"],
  ["fotografia", "fotografía"],
  ["fotografias", "fotografías"],
  ["panoramico", "panorámico"],
  ["panoramicos", "panorámicos"],
  ["panoramicas", "panorámicas"],
  ["montana", "montaña"],
  ["montanas", "montañas"],
  ["medanos", "médanos"],
  ["humedos", "húmedos"],
  ["humedas", "húmedas"],
  ["volcanica", "volcánica"],
  ["volcanicas", "volcánicas"],
  ["volcanico", "volcánico"],
  ["volcanicos", "volcánicos"],
  ["planificacion", "planificación"],
  ["preparacion", "preparación"],
  ["hidratacion", "hidratación"],
  ["proteccion", "protección"],
  ["conservacion", "conservación"],
  ["aclimatacion", "aclimatación"],
  ["condiciones climaticas", "condiciones climáticas"],
  ["climatica", "climática"],
  ["climaticas", "climáticas"],
  ["devocion", "devoción"],
  ["ubicacion", "ubicación"],
  ["region", "región"],
  ["Region", "Región"],
  ["religion", "religión"],
  ["religioso", "religioso"],
  ["religiosa", "religiosa"],
  ["conexion", "conexión"],
  ["transicion", "transición"],
  ["observacion", "observación"],
  ["exposicion", "exposición"],
  ["contextualizacion", "contextualización"],
  ["informacion", "información"],
  ["turistica", "turística"],
  ["turisticas", "turísticas"],
  ["turistico", "turístico"],
  ["turisticos", "turísticos"],
  ["publico", "público"],
  ["publicos", "públicos"],
  ["pequenos", "pequeños"],
  ["acompanamiento", "acompañamiento"],
  ["guia", "guía"],
  ["vehiculo", "vehículo"],
  ["vehiculos", "vehículos"],
  ["mas ", "más "],
  ["area", "área"],
  ["Area", "Área"],
  ["regiónal", "regional"],
  ["regiónales", "regionales"],
  ["interésados", "interesados"],
  ["guíado", "guiado"],
  ["guíada", "guiada"],
];

const camposPorColeccion = {
  atractivos: ["nombre", "departamento", "descripcion"],
  circuitos: ["nombre", "descripcion"],
  actividades: ["nombre", "descripcion", "duracionEstimada"],
};

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const db = client.db();
  const resumen = [];

  for (const [coleccion, campos] of Object.entries(camposPorColeccion)) {
    const documentos = await db.collection(coleccion).find({}).toArray();
    let modificados = 0;

    for (const documento of documentos) {
      const $set = {};

      for (const campo of campos) {
        if (typeof documento[campo] !== "string") continue;
        const normalizado = normalizar(documento[campo]);
        if (normalizado !== documento[campo]) {
          $set[campo] = normalizado;
        }
      }

      if (Object.keys($set).length > 0) {
        $set.updatedAt = new Date();
        await db.collection(coleccion).updateOne({ _id: documento._id }, { $set });
        modificados += 1;
      }
    }

    resumen.push({ coleccion, revisados: documentos.length, modificados });
  }

  console.log(JSON.stringify(resumen, null, 2));
  await client.close();
}

function normalizar(texto) {
  return reemplazos.reduce(
    (valor, [origen, destino]) => valor.replaceAll(origen, destino),
    texto
  );
}

function loadEnvFile(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
