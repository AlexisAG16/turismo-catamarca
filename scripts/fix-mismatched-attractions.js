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
  {
    nombreAnterior: "Fuerte de Andalgala",
    atractivo: {
      nombre: "Ciudad de Andalgala",
      departamento: "Andalgala",
      descripcion:
        "Ciudad cabecera del departamento Andalgala, ubicada en un valle rodeado por sierras y paisajes naturales. Es un punto de partida para recorridos culturales, caminatas, cabalgatas y visitas a espacios historicos y productivos de la region.",
      imagen: {
        public_id: "wikimedia-andalgala",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Catamarca_Andalgala.JPG",
      },
      youtubeUrl: "https://youtu.be/WIfBHC7wzaU",
      googleMapsUrl:
        "https://maps.google.com/maps?q=Andalgala%20Catamarca%20Argentina&output=embed",
    },
    actividadAnterior: "Visita historica por el Fuerte de Andalgala",
    actividad: {
      nombre: "Recorrido urbano y cultural por Andalgala",
      descripcion:
        "Paseo por puntos representativos de la ciudad de Andalgala para conocer su entorno serrano, referencias historicas, espacios publicos y propuestas culturales. Se recomienda complementar la visita con informacion turistica local.",
      duracionEstimada: "1 a 2 horas",
      costoAproximado: 0,
    },
  },
  {
    nombreAnterior: "Ruinas del Shincal Chico",
    atractivo: {
      nombre: "Santa Maria del Yokavil",
      departamento: "Santa Maria",
      descripcion:
        "Ciudad cabecera del departamento Santa Maria, ubicada en el Valle Calchaqui. Se destaca por su identidad cultural, su patrimonio arqueologico regional, sus paisajes de valle y sus tradiciones vinculadas al poncho, la gastronomia y la historia local.",
      imagen: {
        public_id: "wikimedia-santa-maria",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Catamarca_Santa_Maria_Calle_Belgrano.JPG",
      },
      youtubeUrl: "https://www.youtube.com/live/ATBlQK6_aYE?feature=shared",
      googleMapsUrl:
        "https://maps.google.com/maps?q=Santa%20Maria%20Catamarca%20Argentina&output=embed",
    },
    actividadAnterior: "Caminata cultural por sitio arqueologico",
    actividad: {
      nombre: "Recorrido cultural por Santa Maria del Yokavil",
      descripcion:
        "Actividad orientada a conocer la identidad local de Santa Maria, sus espacios urbanos, referencias arqueologicas regionales, producciones artesanales y paisajes del Valle Calchaqui.",
      duracionEstimada: "1 hora y 30 minutos",
      costoAproximado: 0,
    },
  },
];

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const db = client.db();
  const resumen = [];

  for (const item of reemplazos) {
    const atractivo = await db.collection("atractivos").findOne({
      nombre: item.nombreAnterior,
    });

    if (!atractivo) {
      resumen.push({ anterior: item.nombreAnterior, estado: "no encontrado" });
      continue;
    }

    await db.collection("atractivos").updateOne(
      { _id: atractivo._id },
      {
        $set: {
          ...item.atractivo,
          updatedAt: new Date(),
        },
      }
    );

    await db.collection("actividades").updateOne(
      {
        nombre: item.actividadAnterior,
        atractivo: atractivo._id,
      },
      {
        $set: {
          ...item.actividad,
          atractivo: atractivo._id,
          updatedAt: new Date(),
        },
      }
    );

    resumen.push({
      anterior: item.nombreAnterior,
      nuevo: item.atractivo.nombre,
      imagen: item.atractivo.imagen.url,
    });
  }

  console.log(JSON.stringify(resumen, null, 2));
  await client.close();
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
