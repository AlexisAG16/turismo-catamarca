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

let clientPromise;
let activeRequests = 0;
let stdinEnded = false;

const tools = [
  {
    name: "mongodb_database_info",
    description: "Show the current MongoDB database name and collection names.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_list_collections",
    description: "List collections in the MongoDB database.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_count_documents",
    description: "Count documents in a collection using an optional MongoDB filter.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        filter: { type: "object", default: {} },
      },
      required: ["collection"],
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_find_documents",
    description: "Find documents in a collection using a MongoDB filter.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        filter: { type: "object", default: {} },
        projection: { type: "object", default: {} },
        sort: { type: "object", default: {} },
        limit: { type: "number", default: 20, minimum: 1, maximum: 100 },
      },
      required: ["collection"],
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_insert_document",
    description: "Insert one document into a MongoDB collection.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        document: { type: "object" },
      },
      required: ["collection", "document"],
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_update_document",
    description: "Update one document in a MongoDB collection.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        filter: { type: "object" },
        update: { type: "object" },
      },
      required: ["collection", "filter", "update"],
      additionalProperties: false,
    },
  },
  {
    name: "mongodb_aggregate",
    description: "Run a MongoDB aggregation pipeline on a collection.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        pipeline: {
          type: "array",
          items: { type: "object" },
          default: [],
        },
        limit: { type: "number", default: 50, minimum: 1, maximum: 100 },
      },
      required: ["collection", "pipeline"],
      additionalProperties: false,
    },
  },
];

process.stdin.setEncoding("utf8");

let buffer = "";
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  let newlineIndex;

  while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);

    if (!line) {
      continue;
    }

    try {
      const message = JSON.parse(line);
      activeRequests += 1;
      await handleMessage(message);
    } catch (error) {
      sendError(null, -32700, error.message);
    } finally {
      activeRequests = Math.max(0, activeRequests - 1);
      await closeAfterPipeInput();
    }
  }
});
process.stdin.on("end", async () => {
  stdinEnded = true;
  await closeAfterPipeInput();
});

process.on("SIGINT", closeAndExit);
process.on("SIGTERM", closeAndExit);

async function handleMessage(message) {
  if (message.method === "notifications/initialized") {
    return;
  }

  if (message.method === "initialize") {
    return sendResult(message.id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "turismo-catamarca-mongodb",
        version: "1.0.0",
      },
    });
  }

  if (message.method === "tools/list") {
    return sendResult(message.id, { tools });
  }

  if (message.method === "tools/call") {
    try {
      const result = await callTool(message.params?.name, message.params?.arguments || {});
      return sendResult(message.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      });
    } catch (error) {
      return sendResult(message.id, {
        isError: true,
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
      });
    }
  }

  sendError(message.id, -32601, `Unsupported method: ${message.method}`);
}

async function callTool(name, args) {
  const db = await getDb();

  if (name === "mongodb_database_info") {
    const collections = await listCollections(db);
    return {
      database: db.databaseName,
      collections,
    };
  }

  if (name === "mongodb_list_collections") {
    return await listCollections(db);
  }

  if (name === "mongodb_count_documents") {
    return {
      collection: args.collection,
      count: await db
        .collection(args.collection)
        .countDocuments(normalizeMongoValues(args.filter || {})),
    };
  }

  if (name === "mongodb_find_documents") {
    const limit = clampLimit(args.limit, 20);
    return await db
      .collection(args.collection)
      .find(normalizeMongoValues(args.filter || {}))
      .project(args.projection || {})
      .sort(args.sort || {})
      .limit(limit)
      .toArray();
  }

  if (name === "mongodb_insert_document") {
    const now = new Date();
    const document = normalizeMongoValues({
      ...args.document,
      createdAt: args.document.createdAt || now,
      updatedAt: args.document.updatedAt || now,
    });
    const result = await db.collection(args.collection).insertOne(document);

    return {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId,
    };
  }

  if (name === "mongodb_update_document") {
    const update = normalizeMongoValues(args.update || {});
    const result = await db
      .collection(args.collection)
      .updateOne(normalizeMongoValues(args.filter || {}), {
        ...update,
        $set: {
          ...(update.$set || {}),
          updatedAt: new Date(),
        },
      });

    return {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  if (name === "mongodb_aggregate") {
    const limit = clampLimit(args.limit, 50);
    const pipeline = normalizeMongoValues(args.pipeline || []);
    return await db
      .collection(args.collection)
      .aggregate([...pipeline, { $limit: limit }])
      .toArray();
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db();
}

async function listCollections(db) {
  return await db.listCollections({}, { nameOnly: true }).toArray();
}

function normalizeMongoValues(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeMongoValues);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (typeof value.$oid === "string") {
    return new ObjectId(value.$oid);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, normalizeMongoValues(child)])
  );
}

function clampLimit(limit, fallback) {
  const parsed = Number(limit || fallback);
  return Math.max(1, Math.min(100, Number.isFinite(parsed) ? parsed : fallback));
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

function sendResult(id, result) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function sendError(id, code, message) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  });
}

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

async function closeAndExit() {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
  }

  process.exit(0);
}

async function closeAfterPipeInput() {
  if (stdinEnded && activeRequests === 0 && !process.env.MCP_KEEP_ALIVE) {
    await closeAndExit();
  }
}
