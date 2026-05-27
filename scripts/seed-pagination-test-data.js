#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const projectRoot = path.resolve(__dirname, "..");
loadEnvFile(path.join(projectRoot, ".env.local"));

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const items = [
  {
    circuito: {
      nombre: "Circuito Andalgalense de Naturaleza y Cultura",
      descripcion:
        "Recorrido por paisajes serranos, patrimonio local y espacios naturales del departamento Andalgala, orientado a visitantes interesados en cultura regional, fotografia y caminatas de baja dificultad.",
    },
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
    actividad: {
      nombre: "Recorrido urbano y cultural por Andalgala",
      descripcion:
        "Paseo por puntos representativos de la ciudad de Andalgala para conocer su entorno serrano, referencias historicas, espacios publicos y propuestas culturales. Se recomienda complementar la visita con informacion turistica local.",
      duracionEstimada: "1 a 2 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Valles Calchaquies Catamarquenos",
      descripcion:
        "Itinerario por paisajes de valle, patrimonio arqueologico y tradiciones del oeste catamarqueno, con propuestas vinculadas a historia, naturaleza y cultura local.",
    },
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
    actividad: {
      nombre: "Recorrido cultural por Santa Maria del Yokavil",
      descripcion:
        "Actividad orientada a conocer la identidad local de Santa Maria, sus espacios urbanos, referencias arqueologicas regionales, producciones artesanales y paisajes del Valle Calchaqui.",
      duracionEstimada: "1 hora y 30 minutos",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Sierras de Ambato",
      descripcion:
        "Propuesta natural para recorrer paisajes serranos, localidades tranquilas y espacios verdes del departamento Ambato, ideal para descanso, caminatas y fotografia.",
    },
    atractivo: {
      nombre: "El Rodeo",
      departamento: "Ambato",
      descripcion:
        "Localidad serrana reconocida por su clima agradable, sus paisajes verdes y su cercania a circuitos naturales. Es un destino elegido para descanso, caminatas suaves y escapadas de fin de semana.",
      imagen: {
        public_id: "placeholder-el-rodeo",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Elrodeo.JPG",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      googleMapsUrl:
        "https://maps.google.com/maps?q=El%20Rodeo%20Ambato%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Paseo serrano por El Rodeo",
      descripcion:
        "Recorrido recreativo por el entorno de la localidad, con paradas para fotografias, caminatas breves y observacion del paisaje serrano.",
      duracionEstimada: "2 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Verde de Paclin",
      descripcion:
        "Recorrido por quebradas, vegetacion y paisajes humedos del departamento Paclin, recomendado para quienes buscan naturaleza cercana y experiencias al aire libre.",
    },
    atractivo: {
      nombre: "La Merced",
      departamento: "Paclin",
      descripcion:
        "Localidad rodeada de paisajes verdes y quebradas, ubicada en un entorno ideal para recorridos tranquilos, descanso y contacto con la naturaleza.",
      imagen: {
        public_id: "placeholder-la-merced",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Balcozna.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      googleMapsUrl:
        "https://maps.google.com/maps?q=La%20Merced%20Paclin%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Senderismo suave por entorno verde",
      descripcion:
        "Caminata recreativa por sectores cercanos a La Merced, orientada a disfrutar el paisaje, tomar fotografias y recorrer puntos naturales accesibles.",
      duracionEstimada: "1 a 2 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Este Catamarqueno",
      descripcion:
        "Itinerario por localidades y paisajes del este provincial, con propuestas de turismo cultural, descanso y contacto con entornos rurales.",
    },
    atractivo: {
      nombre: "Icano",
      departamento: "La Paz",
      descripcion:
        "Localidad del departamento La Paz con identidad rural y ritmo tranquilo, adecuada para conocer costumbres locales, espacios urbanos pequenos y paisajes del este catamarqueno.",
      imagen: {
        public_id: "placeholder-icano",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Centro_de_la_Ciudad_de_Recreo.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      googleMapsUrl:
        "https://maps.google.com/maps?q=Icano%20La%20Paz%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Recorrido cultural por Icano",
      descripcion:
        "Paseo por la localidad para reconocer espacios representativos, costumbres locales y puntos de interes vinculados a la vida cotidiana del este provincial.",
      duracionEstimada: "1 hora",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Historico de Fray Mamerto Esquiu",
      descripcion:
        "Recorrido por espacios historicos, religiosos y culturales asociados a la figura de Fray Mamerto Esquiu y a localidades tradicionales del valle central.",
    },
    atractivo: {
      nombre: "Casa Natal de Fray Mamerto Esquiu",
      departamento: "Fray Mamerto Esquiu",
      descripcion:
        "Sitio patrimonial vinculado a la vida de Fray Mamerto Esquiu. La visita permite conocer referencias historicas y culturales de una figura central para la identidad catamarquena.",
      imagen: {
        public_id: "placeholder-casa-esquiu",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Casa_Natal_de_Fray_Mamerto_Esqui%C3%BA_Catamarca_Argentina.JPG",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      googleMapsUrl:
        "https://maps.google.com/maps?q=Casa%20Natal%20Fray%20Mamerto%20Esquiu%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Visita historica a la Casa Natal",
      descripcion:
        "Recorrido patrimonial por el sitio y su entorno inmediato, con foco en historia local, arquitectura tradicional y referencias religiosas.",
      duracionEstimada: "45 minutos a 1 hora",
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

  for (const item of items) {
    const circuitos = db.collection("circuitos");
    const atractivos = db.collection("atractivos");
    const actividades = db.collection("actividades");
    const fecha = new Date();

    const circuitoResult = await circuitos.findOneAndUpdate(
      { nombre: item.circuito.nombre },
      {
        $set: {
          descripcion: item.circuito.descripcion,
          updatedAt: fecha,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          nombre: item.circuito.nombre,
          atractivos: [],
          createdAt: fecha,
          __v: 0,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const atractivoResult = await atractivos.findOneAndUpdate(
      { nombre: item.atractivo.nombre },
      {
        $set: {
          ...item.atractivo,
          updatedAt: fecha,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          actividades: [],
          createdAt: fecha,
          __v: 0,
        },
        $unset: {
          circuito: "",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const actividadResult = await actividades.findOneAndUpdate(
      { nombre: item.actividad.nombre, atractivo: atractivoResult._id },
      {
        $set: {
          ...item.actividad,
          atractivo: atractivoResult._id,
          updatedAt: fecha,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          createdAt: fecha,
          __v: 0,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    await atractivos.updateOne(
      { _id: atractivoResult._id },
      { $addToSet: { actividades: actividadResult._id } }
    );

    await circuitos.updateOne(
      { _id: circuitoResult._id },
      { $addToSet: { atractivos: atractivoResult._id } }
    );

    resumen.push({
      circuito: circuitoResult.nombre,
      atractivo: atractivoResult.nombre,
      actividad: actividadResult.nombre,
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
