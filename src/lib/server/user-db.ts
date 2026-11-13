import "server-only";
import { randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import type { Role, SessionUser } from "@/types";

/**
 * Minimal file-backed user store (data/db.json) used by the demo's auth routes.
 * Stand-in for the `User` table in prisma/schema.prisma — swap these functions
 * for Prisma queries when PostgreSQL is available. Passwords: scrypt + random salt.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const DB_PATH = join(process.cwd(), "data", "db.json");
const PARAMS = { N: 16384, r: 8, p: 1 };

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

async function load(): Promise<{ users: StoredUser[] }> {
  try {
    const db = JSON.parse(await readFile(DB_PATH, "utf8"));
    return { users: Array.isArray(db.users) ? db.users : [] };
  } catch {
    return { users: [] };
  }
}

async function save(db: { users: StoredUser[] }) {
  await mkdir(dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, PARAMS);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, PARAMS);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Constant work for unknown emails so response time doesn't reveal which accounts exist.
const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");

const toSession = (u: StoredUser): SessionUser => ({ id: u.id, name: u.name, email: u.email, role: u.role });

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const { users } = await load();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? toSession(user) : null;
}

export async function createUser(input: { name: string; email: string; password: string }): Promise<SessionUser | "exists"> {
  const db = await load();
  const email = input.email.trim().toLowerCase();
  if (db.users.some((u) => u.email === email)) return "exists";
  const user: StoredUser = {
    id: `usr_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    name: input.name.trim(),
    email,
    // Each new account owns its first workspace, so it starts as that workspace's Super Admin.
    role: "Super Admin",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await save(db);
  return toSession(user);
}

/* Simple in-memory rate limiter (per IP + route). Production: Redis. */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  h.count++;
  return h.count > limit;
}
