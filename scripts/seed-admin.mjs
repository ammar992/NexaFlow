#!/usr/bin/env node
/**
 * Seeds MongoDB with the NexaFlow Super Admin.
 *
 *   npm run db:seed              create the admin if it doesn't exist
 *   npm run db:seed -- --reset   restore the admin's default password
 *
 * Reads MONGODB_URI / MONGODB_DB from .env.local (via `node --env-file`).
 * Override defaults with ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
 * The password is stored only as a scrypt hash (random 16-byte salt).
 */
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✖ MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

const ADMIN = {
  name: process.env.ADMIN_NAME || "Admin",
  email: (process.env.ADMIN_EMAIL || "admin@nexaflow.com").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "NexaFlow@2026",
};

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const reset = process.argv.includes("--reset");
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, appName: "nexaflow-seed" });

try {
  await client.connect();
  const users = client.db(process.env.MONGODB_DB || "nexaflow").collection("users");
  await users.createIndex({ email: 1 }, { unique: true, name: "users_email_unique" });

  const existing = await users.findOne({ email: ADMIN.email });
  if (existing && !reset) {
    console.log(`✔ Super Admin already exists: ${ADMIN.email} (run with --reset to restore the default password)`);
  } else {
    await users.updateOne(
      { email: ADMIN.email },
      {
        $set: { name: ADMIN.name, role: "Super Admin", passwordHash: hashPassword(ADMIN.password) },
        $setOnInsert: { _id: `usr_${randomUUID().replace(/-/g, "").slice(0, 12)}`, email: ADMIN.email, createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`✔ Super Admin ${existing ? "reset" : "created"} in MongoDB (db: ${process.env.MONGODB_DB || "nexaflow"}, collection: users)`);
    console.log(`  Email:    ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
    console.log(`  Role:     Super Admin`);
  }
} catch (e) {
  console.error("✖ Seeding failed:", e.message);
  if (/whitelist|IP|ENOTFOUND|timed out|Server selection/i.test(e.message)) {
    console.error("  Check MongoDB Atlas → Network Access allows this machine's IP, and that the URI is correct.");
  }
  process.exitCode = 1;
} finally {
  await client.close();
}
