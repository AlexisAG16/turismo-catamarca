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

const items = [
  {
    circuito: {
      nombre: "Circuito Puna y Paisajes Volcanicos",
      descripcion:
        "Recorrido por ambientes de altura, formaciones volcanicas y paisajes abiertos de la Puna catamarquena. Esta propuesta esta orientada a visitantes interesados en geologia, fotografia, naturaleza y experiencias de larga distancia con acompanamiento local.",
    },
    atractivo: {
      nombre: "Campo de Piedra Pomez",
      departamento: "Antofagasta de la Sierra",
      descripcion:
        "Area natural protegida ubicada en la Puna catamarquena, reconocida por sus extensas formaciones de piedra pomez moldeadas por el viento. El paisaje combina tonos claros, crestas erosionadas y una amplitud visual singular, por lo que se recomienda visitarlo con guia y vehiculo apto para caminos de altura.",
      imagen: {
        public_id: "wikimedia-campo-piedra-pomez",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Campo_de_piedra_p%C3%B3mez_en_Catamarca_-_Argentina.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=4ss--mOw1TE",
      googleMapsUrl: "https://maps.google.com/maps?q=Campo%20de%20Piedra%20Pomez%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Caminata interpretativa por formaciones volcanicas",
      descripcion:
        "Recorrido guiado por sectores representativos del campo de piedra pomez para observar geoformas, texturas, miradores naturales y variaciones de luz sobre el paisaje. Se recomienda llevar abrigo, agua, proteccion solar y respetar las indicaciones de conservacion del area.",
      duracionEstimada: "3 a 4 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Miradores del Valle Central",
      descripcion:
        "Itinerario escenico cercano al Valle Central de Catamarca, pensado para recorrer caminos de cornisa, miradores naturales y puntos panoramicos. Es una alternativa adecuada para quienes buscan vistas amplias, fotografia y contacto con el paisaje serrano.",
    },
    atractivo: {
      nombre: "Cuesta del Portezuelo",
      departamento: "Valle Viejo",
      descripcion:
        "Camino de montana ubicado en el departamento Valle Viejo, famoso por sus curvas, miradores y vistas hacia el valle catamarqueno. Su recorrido permite apreciar la transicion entre el entorno urbano y el paisaje serrano, con paradas recomendadas para fotografia y contemplacion.",
      imagen: {
        public_id: "wikimedia-cuesta-portezuelo",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mirador_del_Valle_de_Catamarca_desde_la_Cuesta_del_Portezuelo.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=YC0muG-PxXc",
      googleMapsUrl: "https://maps.google.com/maps?q=Cuesta%20del%20Portezuelo%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Recorrido panoramico y fotografia",
      descripcion:
        "Actividad de baja dificultad para transitar la cuesta, detenerse en miradores y registrar vistas del valle. Se recomienda realizar el paseo con luz diurna, conducir con precaucion y prever tiempo para paradas breves en puntos seguros.",
      duracionEstimada: "1 a 2 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Altoandino del Volcan Galan",
      descripcion:
        "Ruta de alta montana orientada a la observacion de ambientes puneinos, lagunas, salares y formaciones volcanicas. Por sus condiciones de altura y distancia, se recomienda planificarla con prestadores habilitados y vehiculos adecuados.",
    },
    atractivo: {
      nombre: "Volcan Galan",
      departamento: "Antofagasta de la Sierra",
      descripcion:
        "Imponente caldera volcanica de la Puna catamarquena, reconocida por su escala, sus paisajes de altura y la presencia de lagunas y salares en el entorno. La visita requiere preparacion previa, abrigo, hidratacion y acompanamiento especializado por tratarse de una zona remota.",
      imagen: {
        public_id: "wikimedia-volcan-galan",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Volcan_galan_p.wiki.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=baNck2VVmtQ",
      googleMapsUrl: "https://maps.google.com/maps?q=Volcan%20Galan%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Excursion altoandina al entorno del Galan",
      descripcion:
        "Salida de jornada completa para recorrer caminos de altura, observar paisajes volcanicos y realizar paradas interpretativas en puntos panoramicos. Es importante considerar aclimatacion, condiciones climaticas y disponibilidad de servicios especializados.",
      duracionEstimada: "8 a 10 horas",
      costoAproximado: 0,
    },
  },
  {
    circuito: {
      nombre: "Circuito Historico y Religioso de la Capital",
      descripcion:
        "Recorrido urbano por espacios patrimoniales, religiosos y culturales de San Fernando del Valle de Catamarca. Integra templos, plazas y edificios representativos para comprender la historia, la arquitectura y las tradiciones locales.",
    },
    atractivo: {
      nombre: "Catedral Basilica Nuestra Senora del Valle",
      departamento: "Capital",
      descripcion:
        "Templo emblematico de San Fernando del Valle de Catamarca y centro de devocion mariana del noroeste argentino. Su arquitectura, su ubicacion frente a la plaza principal y el Camarin de la Virgen la convierten en una visita destacada para quienes buscan patrimonio, historia y espiritualidad.",
      imagen: {
        public_id: "wikimedia-basilica-catamarca",
        url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Basilica_de_Catamarca.jpg",
      },
      youtubeUrl: "https://www.youtube.com/watch?v=B9LH0tP0Tos",
      googleMapsUrl: "https://maps.google.com/maps?q=Catedral%20Basilica%20Nuestra%20Senora%20del%20Valle%20Catamarca&output=embed",
    },
    actividad: {
      nombre: "Visita patrimonial al templo y Paseo de la Fe",
      descripcion:
        "Recorrido breve por la fachada, el interior del templo, el entorno de la plaza principal y los espacios vinculados a la devocion de la Virgen del Valle. Se recomienda respetar horarios de celebraciones y mantener una conducta acorde al caracter religioso del sitio.",
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
  const summary = [];

  for (const item of items) {
    const now = new Date();
    const circuitos = db.collection("circuitos");
    const atractivos = db.collection("atractivos");
    const actividades = db.collection("actividades");

    const circuitoResult = await circuitos.findOneAndUpdate(
      { nombre: item.circuito.nombre },
      {
        $set: {
          descripcion: item.circuito.descripcion,
          updatedAt: now,
        },
        $setOnInsert: {
          nombre: item.circuito.nombre,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const atractivoResult = await atractivos.findOneAndUpdate(
      { nombre: item.atractivo.nombre },
      {
        $set: {
          ...item.atractivo,
          circuito: circuitoResult._id,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const actividadResult = await actividades.findOneAndUpdate(
      {
        nombre: item.actividad.nombre,
        atractivo: atractivoResult._id,
      },
      {
        $set: {
          ...item.actividad,
          atractivo: atractivoResult._id,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    summary.push({
      circuito: circuitoResult.nombre,
      circuitoId: circuitoResult._id,
      atractivo: atractivoResult.nombre,
      atractivoId: atractivoResult._id,
      actividad: actividadResult.nombre,
      actividadId: actividadResult._id,
    });
  }

  console.log(JSON.stringify(summary, null, 2));
  await client.close();
}

function loadEnvFile(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

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
