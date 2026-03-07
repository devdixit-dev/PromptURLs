import { FastifyRequest, FastifyReply } from "fastify";
import UrlGenerator from "../services/url-generator.service";
import { db } from "../db/client";
import { modelRequests, users } from "../db/schema";
import { eq, sql } from "drizzle-orm";

type GeneratePromptBody = {
  prompt: string;
  userId?: string;
};

type RequestModelBody = {
  name: string;
  modelName: string;
  provider: string;
  urgency?: string;
  details?: string;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export const checkRoot = async (_: FastifyRequest, res: FastifyReply) => {
  try{
    return res.send({
      route: 'Root',
      status: 'Okay'
    });
  }
  catch(e) {
    console.error("Error in checking root route", e);
    return null
  }
}

export const generatePrompts = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { prompt, userId } = req.body as GeneratePromptBody;
    const cleanPrompt = prompt?.trim();
    if (!cleanPrompt) {
      return res.status(400).send({ message: "Invalid or missing prompt" });
    }

    if (cleanPrompt.length > 4000) {
      return res
        .status(413)
        .send({ message: "Prompt too long. Max length is 4000 characters." });
    }

    const safeUserAgent = req.headers["user-agent"] ?? "unknown";
    const safeUserId = typeof userId === "string" && isUuid(userId) ? userId : undefined;
    let resolvedUserId = safeUserId;

    if (resolvedUserId) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, resolvedUserId))
        .limit(1);

      if (existingUser.length > 0) {
        await db
          .update(users)
          .set({
            ip: req.ip,
            userAgent: safeUserAgent,
            promptHistory: sql`array_append(coalesce(${users.promptHistory}, '{}'::text[]), ${cleanPrompt})`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, resolvedUserId));
      } else {
        const [createdUser] = await db
          .insert(users)
          .values({
            id: resolvedUserId,
            ip: req.ip,
            userAgent: safeUserAgent,
            promptHistory: [cleanPrompt],
          })
          .returning({ id: users.id });

        resolvedUserId = createdUser.id;
      }
    } else {
      const [createdUser] = await db
        .insert(users)
        .values({
          ip: req.ip,
          userAgent: safeUserAgent,
          promptHistory: [cleanPrompt],
        })
        .returning({ id: users.id });

      resolvedUserId = createdUser.id;
    }

    const urls = UrlGenerator(cleanPrompt);
    
    return res.status(200).send({
      userId: resolvedUserId,
      data: urls
    });
  }
  catch (e) {
    console.error("Error in generating prompt", e);
    return res.status(500).send({
      message: "Internal server error",
    });
  }
}

export const requestModel = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const { name, modelName, provider, urgency, details } = req.body as RequestModelBody;
    const cleanName = name?.trim();
    const cleanModelName = modelName?.trim();
    const cleanProvider = provider?.trim();
    const cleanDetails = details?.trim();
    const cleanUrgency = urgency?.trim().toLowerCase();

    if (!cleanName || !cleanModelName || !cleanProvider || !cleanDetails) {
      return res.status(400).send({
        message: "Name, model name, provider and details are required",
      });
    }

    if (
      cleanName.length > 120 ||
      cleanModelName.length > 120 ||
      cleanProvider.length > 120 ||
      cleanDetails.length > 3000
    ) {
      return res.status(413).send({
        message: "One or more fields exceed allowed length",
      });
    }

    if (
      cleanUrgency &&
      !["normal", "high", "critical"].includes(cleanUrgency)
    ) {
      return res.status(400).send({
        message: "Urgency must be one of: normal, high, critical",
      });
    }

    const [savedRequest] = await db
      .insert(modelRequests)
      .values({
        name: cleanName,
        modelName: cleanModelName,
        provider: cleanProvider,
        urgency: cleanUrgency as "normal" | "high" | "critical" | undefined,
        details: cleanDetails,
      })
      .returning({ id: modelRequests.id });

    return res.status(200).send({
      message: "Request sent",
      requestId: savedRequest.id,
    });
  }
  catch(e) {
    console.error("Error in requesting a model", e);
    return res.status(500).send({
      message: 'Internal server error'
    });
  }
}
