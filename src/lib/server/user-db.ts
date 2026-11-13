import "server-only";
import { randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "@/lib/server/mongo";
import type { Role, SessionUser } from "@/types";

/**
 * User accounts in MongoDB (`users` collection, unique index on `email`).
 * Passwords are stored only as scrypt hashes with a random 16-byte salt.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1 };

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
}

const users = async () => (await getDb()).collection<UserDoc>("users");

export async function hashPassword(password: string) {
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

const toSession = (u: UserDoc): SessionUser => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const user = await (await users()).findOne({ email: email.trim().toLowerCase() });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? toSession(user) : null;
}

export async function createUser(input: { name: string; email: string; password: string }): Promise<SessionUser | "exists"> {
  const doc: UserDoc = {
    _id: `usr_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    // Each new account owns its first workspace, so it starts as that workspace's Super Admin.
    role: "Super Admin",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date(),
  };
  try {
    await (await users()).insertOne(doc);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return "exists"; // duplicate email
    throw e;
  }
  return toSession(doc);
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
