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

const now = () => new Date();

const circuitos = [
  {
    key: "puna-volcanica",
    nombre: "Circuito Puna y Paisajes Volcanicos",
    descripcion:
      "Recorrido por ambientes de altura, formaciones volcanicas y paisajes abiertos de la Puna catamarquena. Integra atractivos de gran valor natural y requiere planificacion responsable, vehiculos adecuados y acompanamiento local.",
    atractivos: ["campo-piedra-pomez", "volcan-galan"],
  },
  {
    key: "tinogasta-aventura",
    nombre: "Circuito Tinogasta Aventura",
    descripcion:
      "Propuesta orientada a paisajes naturales del oeste catamarqueno, con medanos, montanas y experiencias al aire libre. Es adecuada para visitantes interesados en fotografia, caminatas y turismo aventura.",
    atractivos: ["dunas-taton"],
  },
  {
    key: "belen-patrimonial",
    nombre: "Circuito Belen Patrimonial",
    descripcion:
      "Recorrido cultural por sitios historicos y arqueologicos del departamento Belen. Permite conocer espacios vinculados a la memoria regional, el patrimonio incaico y la identidad local.",
    atractivos: ["shincal"],
  },
  {
    key: "miradores-valle",
    nombre: "Circuito Miradores del Valle Central",
    descripcion:
      "Itinerario escenico cercano al Valle Central de Catamarca, pensado para recorrer caminos de cornisa, miradores naturales y puntos panoramicos con vistas amplias del paisaje serrano.",
    atractivos: ["cuesta-portezuelo"],
  },
  {
    key: "capital-historica-religiosa",
    nombre: "Circuito Historico y Religioso de la Capital",
    descripcion:
      "Recorrido urbano por espacios patrimoniales, religiosos y culturales de San Fernando del Valle de Catamarca. Integra templos, plazas y edificios representativos de la historia local.",
    atractivos: ["catedral-valle"],
  },
];

const atractivos = [
  {
    key: "campo-piedra-pomez",
    nombre: "Campo de Piedra Pomez",
    departamento: "Antofagasta de la Sierra",
    descripcion:
      "Area natural protegida ubicada en la Puna catamarquena, reconocida por sus extensas formaciones de piedra pomez moldeadas por el viento. El paisaje combina tonos claros, crestas erosionadas y una amplitud visual singular, por lo que se recomienda visitarlo con guia y vehiculo apto para caminos de altura.",
    imagen: {
      public_id: "wikimedia-campo-piedra-pomez",
      url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Campo_de_piedra_p%C3%B3mez_en_Catamarca_-_Argentina.jpg",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=4ss--mOw1TE",
    googleMapsUrl:
      "https://maps.google.com/maps?q=Campo%20de%20Piedra%20Pomez%20Catamarca&output=embed",
  },
  {
    key: "volcan-galan",
    nombre: "Volcan Galan",
    departamento: "Antofagasta de la Sierra",
    descripcion:
      "Imponente caldera volcanica de la Puna catamarquena, reconocida por su escala, sus paisajes de altura y la presencia de lagunas y salares en el entorno. La visita requiere preparacion previa, abrigo, hidratacion y acompanamiento especializado por tratarse de una zona remota.",
    imagen: {
      public_id: "wikimedia-volcan-galan",
      url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Volcan_galan_p.wiki.jpg",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=baNck2VVmtQ",
    googleMapsUrl:
      "https://maps.google.com/maps?q=Volcan%20Galan%20Catamarca&output=embed",
  },
  {
    key: "dunas-taton",
    nombre: "Dunas de Taton",
    departamento: "Tinogasta",
    descripcion:
      "Las Dunas de Taton conforman uno de los paisajes naturales mas destacados del departamento Tinogasta. Sus extensos medanos de arena clara, rodeados por montanas y cielo abierto, ofrecen un entorno ideal para la fotografia, las caminatas y las actividades recreativas vinculadas al turismo aventura.",
    imagen: {
      public_id: "wikimedia-dunas-taton",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Dunas_de_Taton._Catamarca.JPG/800px-Dunas_de_Taton._Catamarca.JPG",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=UYDNayxljSg",
    googleMapsUrl:
      "https://maps.google.com/maps?q=Dunas%20de%20Taton%20Catamarca&output=embed",
  },
  {
    key: "shincal",
    nombre: "El Shincal de Quimivil",
    departamento: "Belen",
    descripcion:
      "Sitio arqueologico incaico ubicado en Londres, departamento Belen. Sus plazas ceremoniales, recintos administrativos, senderos y puntos panoramicos permiten comprender la importancia historica del lugar dentro del sistema vial andino.",
    imagen: {
      public_id: "wikimedia-shincal-quimivil",
      url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shincal_de_Quimivil.jpg",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=qO4-jQwC0qA",
    googleMapsUrl:
      "https://maps.google.com/maps?q=El%20Shincal%20de%20Quimivil%20Catamarca&output=embed",
  },
  {
    key: "cuesta-portezuelo",
    nombre: "Cuesta del Portezuelo",
    departamento: "Valle Viejo",
    descripcion:
      "Camino de montana ubicado en el departamento Valle Viejo, famoso por sus curvas, miradores y vistas hacia el valle catamarqueno. Su recorrido permite apreciar la transicion entre el entorno urbano y el paisaje serrano.",
    imagen: {
      public_id: "wikimedia-cuesta-portezuelo",
      url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mirador_del_Valle_de_Catamarca_desde_la_Cuesta_del_Portezuelo.jpg",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=YC0muG-PxXc",
    googleMapsUrl:
      "https://maps.google.com/maps?q=Cuesta%20del%20Portezuelo%20Catamarca&output=embed",
  },
  {
    key: "catedral-valle",
    nombre: "Catedral Basilica Nuestra Senora del Valle",
    departamento: "Capital",
    descripcion:
      "Templo emblematico de San Fernando del Valle de Catamarca y centro de devocion mariana del noroeste argentino. Su arquitectura, su ubicacion frente a la plaza principal y el Camarin de la Virgen la convierten en una visita destacada para quienes buscan patrimonio, historia y espiritualidad.",
    imagen: {
      public_id: "wikimedia-basilica-catamarca",
      url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Basilica_de_Catamarca.jpg",
    },
    youtubeUrl: "https://www.youtube.com/watch?v=B9LH0tP0Tos",
    googleMapsUrl:
      "https://maps.google.com/maps?q=Catedral%20Basilica%20Nuestra%20Senora%20del%20Valle%20Catamarca&output=embed",
  },
];

const actividades = [
  {
    atractivoKey: "campo-piedra-pomez",
    nombre: "Caminata interpretativa por formaciones volcanicas",
    descripcion:
      "Recorrido guiado por sectores representativos del campo de piedra pomez para observar geoformas, texturas, miradores naturales y variaciones de luz sobre el paisaje. Se recomienda llevar abrigo, agua, proteccion solar y respetar las indicaciones de conservacion del area.",
    duracionEstimada: "3 a 4 horas",
    costoAproximado: 0,
  },
  {
    atractivoKey: "volcan-galan",
    nombre: "Excursion altoandina al entorno del Galan",
    descripcion:
      "Salida de jornada completa para recorrer caminos de altura, observar paisajes volcanicos y realizar paradas interpretativas en puntos panoramicos. Es importante considerar aclimatacion, condiciones climaticas y disponibilidad de servicios especializados.",
    duracionEstimada: "8 a 10 horas",
    costoAproximado: 0,
  },
  {
    atractivoKey: "dunas-taton",
    nombre: "Sandboard y recorridos por las dunas",
    descripcion:
      "Actividad recreativa que permite disfrutar el paisaje de las Dunas de Taton mediante descensos controlados sobre arena y caminatas panoramicas por el entorno. Se recomienda realizarla con acompanamiento local, hidratacion adecuada y en horarios de menor exposicion solar.",
    duracionEstimada: "2 a 3 horas",
    costoAproximado: 0,
  },
  {
    atractivoKey: "shincal",
    nombre: "Recorrido arqueologico por El Shincal",
    descripcion:
      "Visita interpretativa por el sitio arqueologico incaico de El Shincal de Quimivil, con recorrido por plazas ceremoniales, recintos administrativos, senderos internos y puntos panoramicos del entorno. Se recomienda realizarla con guia local para una mejor contextualizacion patrimonial.",
    duracionEstimada: "1 hora y 30 minutos a 2 horas",
    costoAproximado: 0,
  },
  {
    atractivoKey: "cuesta-portezuelo",
    nombre: "Recorrido panoramico y fotografia",
    descripcion:
      "Actividad de baja dificultad para transitar la cuesta, detenerse en miradores y registrar vistas del valle. Se recomienda realizar el paseo con luz diurna, conducir con precaucion y prever tiempo para paradas breves en puntos seguros.",
    duracionEstimada: "1 a 2 horas",
    costoAproximado: 0,
  },
  {
    atractivoKey: "catedral-valle",
    nombre: "Visita patrimonial al templo y Paseo de la Fe",
    descripcion:
      "Recorrido breve por la fachada, el interior del templo, el entorno de la plaza principal y los espacios vinculados a la devocion de la Virgen del Valle. Se recomienda respetar horarios de celebraciones y mantener una conducta acorde al caracter religioso del sitio.",
    duracionEstimada: "45 minutos a 1 hora",
    costoAproximado: 0,
  },
];

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();

  const db = client.db();
  const backupPath = await backupCollections(db);

  const circuitosCollection = db.collection("circuitos");
  const atractivosCollection = db.collection("atractivos");
  const actividadesCollection = db.collection("actividades");

  await actividadesCollection.deleteMany({});
  await atractivosCollection.deleteMany({});
  await circuitosCollection.deleteMany({});

  const circuitoIds = new Map();
  for (const circuito of circuitos) {
    const _id = new ObjectId();
    circuitoIds.set(circuito.key, _id);
    await circuitosCollection.insertOne({
      _id,
      nombre: circuito.nombre,
      descripcion: circuito.descripcion,
      atractivos: [],
      createdAt: now(),
      updatedAt: now(),
      __v: 0,
    });
  }

  const atractivoIds = new Map();
  const circuitoPorAtractivo = new Map();
  for (const circuito of circuitos) {
    for (const atractivoKey of circuito.atractivos) {
      circuitoPorAtractivo.set(atractivoKey, circuitoIds.get(circuito.key));
    }
  }

  for (const atractivo of atractivos) {
    const _id = new ObjectId();
    atractivoIds.set(atractivo.key, _id);
    await atractivosCollection.insertOne({
      _id,
      nombre: atractivo.nombre,
      departamento: atractivo.departamento,
      descripcion: atractivo.descripcion,
      imagen: atractivo.imagen,
      actividades: [],
      youtubeUrl: atractivo.youtubeUrl,
      googleMapsUrl: atractivo.googleMapsUrl,
      createdAt: now(),
      updatedAt: now(),
      __v: 0,
    });
  }

  for (const actividad of actividades) {
    const actividadDocumento = {
      _id: new ObjectId(),
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      duracionEstimada: actividad.duracionEstimada,
      costoAproximado: actividad.costoAproximado,
      atractivo: atractivoIds.get(actividad.atractivoKey),
      createdAt: now(),
      updatedAt: now(),
      __v: 0,
    };
    await actividadesCollection.insertOne(actividadDocumento);
    await atractivosCollection.updateOne(
      { _id: actividadDocumento.atractivo },
      { $push: { actividades: actividadDocumento._id } }
    );
  }

  for (const circuito of circuitos) {
    const atractivoObjectIds = circuito.atractivos.map((atractivoKey) =>
      atractivoIds.get(atractivoKey)
    );
    await circuitosCollection.updateOne(
      { _id: circuitoIds.get(circuito.key) },
      { $set: { atractivos: atractivoObjectIds } }
    );
  }

  const summary = {
    backupPath,
    circuitos: await circuitosCollection.countDocuments(),
    atractivos: await atractivosCollection.countDocuments(),
    actividades: await actividadesCollection.countDocuments(),
    usuariosPreservados: await db.collection("usuarios").countDocuments(),
  };

  console.log(JSON.stringify(summary, null, 2));
  await client.close();
}

async function backupCollections(db) {
  const backupDir = path.join(projectRoot, "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `tourism-data-before-rebuild-${stamp}.json`);
  const backup = {
    createdAt: new Date().toISOString(),
    collections: {
      circuitos: await db.collection("circuitos").find({}).toArray(),
      atractivos: await db.collection("atractivos").find({}).toArray(),
      actividades: await db.collection("actividades").find({}).toArray(),
    },
  };

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");
  return backupPath;
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
