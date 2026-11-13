import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, rateLimited } from "@/lib/server/user-db";
import { passwordSchema } from "@/lib/validation";

const body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().min(1).max(254).pipe(z.email()),
  password: passwordSchema,
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`sign-up:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details." }, { status: 400 });
  }

  const result = await createUser(parsed.data);
  if (result === "exists") {
    return NextResponse.json({ error: "An account with this email already exists. Try signing in." }, { status: 409 });
  }
  return NextResponse.json({ user: result }, { status: 201 });
}
