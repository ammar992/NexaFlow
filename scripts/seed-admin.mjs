#!/usr/bin/env node
/**
 * Seeds the local demo database (data/db.json) with the NexaFlow Super Admin.
 *
 *   npm run db:seed            create the admin if it doesn't exist
 *   npm run db:seed -- --reset recreate the admin with the default password
 *
 * Override defaults with env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
 * Passwords are stored only as scrypt hashes (random 16-byte salt).
 *
 * This file-based store is a stand-in for PostgreSQL (see prisma/schema.prisma)
 * so the demo runs without a database server.
 */
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = join(ROOT, "data", "db.json");

export const DEFAULT_ADMIN = {
  name: process.env.ADMIN_NAME || "NexaFlow Admin",
  email: (process.env.ADMIN_EMAIL || "admin@nexaflow.com").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "NexaFlow@2026",
};

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const reset = process.argv.includes("--reset");
const quiet = process.argv.includes("--quiet");

let db = { users: [] };
if (existsSync(DB_PATH)) {
  try {
    db = JSON.parse(readFileSync(DB_PATH, "utf8"));
    if (!Array.isArray(db.users)) db.users = [];
  } catch {
    console.error(`Could not parse ${DB_PATH}; it will be recreated.`);
    db = { users: [] };
  }
}

const existing = db.users.find((u) => u.email === DEFAULT_ADMIN.email);
if (existing && !reset) {
  if (!quiet) console.log(`✔ Super Admin already exists: ${DEFAULT_ADMIN.email} (use --reset to restore the default password)`);
  process.exit(0);
}

const admin = {
  id: existing?.id ?? `usr_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
  name: DEFAULT_ADMIN.name,
  email: DEFAULT_ADMIN.email,
  role: "Super Admin",
  passwordHash: hashPassword(DEFAULT_ADMIN.password),
  createdAt: existing?.createdAt ?? new Date().toISOString(),
};
db.users = [admin, ...db.users.filter((u) => u.email !== admin.email)];

mkdirSync(dirname(DB_PATH), { recursive: true });
writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log(`✔ Super Admin ${existing ? "reset" : "created"} in data/db.json`);
console.log(`  Email:    ${admin.email}`);
console.log(`  Password: ${DEFAULT_ADMIN.password}`);
console.log(`  Role:     ${admin.role}`);
