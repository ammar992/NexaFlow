import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * Shared MongoDB connection. The URI comes only from the environment
 * (.env.local locally, the host's secret store in production) — never from code.
 * In dev, the client is cached on globalThis so hot reloads don't open new pools.
 */

const globalForMongo = globalThis as unknown as { _nfMongo?: Promise<MongoClient>; _nfIndexes?: Promise<void> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  if (!globalForMongo._nfMongo) {
    globalForMongo._nfMongo = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      appName: "nexaflow-web",
    }).connect();
    // Allow a retry on the next request if the first connection attempt fails.
    globalForMongo._nfMongo.catch(() => {
      globalForMongo._nfMongo = undefined;
    });
  }
  return globalForMongo._nfMongo;
}

export async function getDb(): Promise<Db> {
  const db = (await client()).db(process.env.MONGODB_DB || "nexaflow");
  if (!globalForMongo._nfIndexes) {
    globalForMongo._nfIndexes = db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true, name: "users_email_unique" })
      .then(() => undefined);
  }
  await globalForMongo._nfIndexes;
  return db;
}
