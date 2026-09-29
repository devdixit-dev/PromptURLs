import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { modelRequests } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid body");
    body = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const clean = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const name = clean("name");
  const modelName = clean("modelName");
  const provider = clean("provider");
  const details = clean("details");
  const urgency = clean("urgency").toLowerCase();

  if (!name || !modelName || !provider || !details) {
    return NextResponse.json({ message: "Name, model name, provider and details are required" }, { status: 400 });
  }
  if (name.length > 120 || modelName.length > 120 || provider.length > 120 || details.length > 3000) {
    return NextResponse.json({ message: "One or more fields exceed allowed length" }, { status: 413 });
  }
  if (urgency && !["normal", "high", "critical"].includes(urgency)) {
    return NextResponse.json({ message: "Urgency must be one of: normal, high, critical" }, { status: 400 });
  }

  try {
    const [saved] = await getDb().insert(modelRequests).values({
      name, modelName, provider,
      urgency: (urgency || "normal") as "normal" | "high" | "critical",
      details,
    }).returning({ id: modelRequests.id });
    return NextResponse.json({ message: "Request sent", requestId: saved.id });
  } catch (error) {
    console.error("Error saving model request", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
