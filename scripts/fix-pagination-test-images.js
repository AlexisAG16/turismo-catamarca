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

const imagenes = [
  [
    "Ciudad de Andalgala",
    "wikimedia-andalgala",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Catamarca_Andalgala.JPG",
  ],
  [
    "Santa Maria del Yokavil",
    "wikimedia-santa-maria",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Catamarca_Santa_Maria_Calle_Belgrano.JPG",
  ],
  [
    "El Rodeo",
    "wikimedia-el-rodeo",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Elrodeo.JPG",
  ],
  [
    "La Merced",
    "wikimedia-balcozna-paclin",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Balcozna.jpg",
  ],
  [
    "Icano",
    "wikimedia-recreo-la-paz",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Centro_de_la_Ciudad_de_Recreo.jpg",
  ],
  [
    "Casa Natal de Fray Mamerto Esquiu",
    "wikimedia-casa-natal-esquiu",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Casa_Natal_de_Fray_Mamerto_Esqui%C3%BA_Catamarca_Argentina.JPG",
  ],
];

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const db = client.db();
  const resumen = [];

  for (const [nombre, publicId, url] of imagenes) {
    const result = await db.collection("atractivos").updateOne(
      { nombre },
      {
        $set: {
          imagen: {
            public_id: publicId,
            url,
          },
          updatedAt: new Date(),
        },
      }
    );

    resumen.push({ nombre, url, modifiedCount: result.modifiedCount });
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
