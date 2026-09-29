import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generatePromptUrls } from "@/lib/url-generator";

export const runtime = "nodejs";

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: NextRequest) {
  let body: { prompt?: unknown; userId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ message: "Invalid or missing prompt" }, { status: 400 });
  if (prompt.length > 4000) return NextResponse.json({ message: "Prompt too long. Max length is 4000 characters." }, { status: 413 });

  try {
    const db = getDb();
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const userId = typeof body.userId === "string" && isUuid(body.userId) ? body.userId : undefined;
    let resolvedUserId = userId;

    if (userId) {
      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
      if (existing) {
        await db.update(users).set({
          ip,
          userAgent,
          promptHistory: sql`array_append(coalesce(${users.promptHistory}, '{}'::text[]), ${prompt})`,
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
      } else {
        const [created] = await db.insert(users).values({ id: userId, ip, userAgent, promptHistory: [prompt] }).returning({ id: users.id });
        resolvedUserId = created.id;
      }
    } else {
      const [created] = await db.insert(users).values({ ip, userAgent, promptHistory: [prompt] }).returning({ id: users.id });
      resolvedUserId = created.id;
    }

    return NextResponse.json({ userId: resolvedUserId, data: generatePromptUrls(prompt) });
  } catch (error) {
    console.error("Error generating prompt URLs", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
