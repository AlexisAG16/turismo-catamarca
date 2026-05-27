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

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const db = client.db();
  const atractivos = await db.collection("atractivos").find({}).toArray();
  const resumen = [];

  for (const atractivo of atractivos) {
    const actividades = await db
      .collection("actividades")
      .find({ atractivo: atractivo._id })
      .project({ _id: 1, nombre: 1 })
      .sort({ nombre: 1 })
      .toArray();

    await db.collection("atractivos").updateOne(
      { _id: atractivo._id },
      {
        $set: {
          actividades: actividades.map((actividad) => actividad._id),
          updatedAt: new Date(),
        },
        $unset: {
          circuito: "",
        },
      }
    );

    resumen.push({
      atractivo: atractivo.nombre,
      actividades: actividades.map((actividad) => actividad.nombre),
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
