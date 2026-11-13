import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, rateLimited } from "@/lib/server/user-db";

const body = z.object({
  email: z.string().trim().min(1).max(254).pipe(z.email()),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`sign-in:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    // Same message for unknown email and wrong password (no account enumeration).
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  return NextResponse.json({ user });
}
